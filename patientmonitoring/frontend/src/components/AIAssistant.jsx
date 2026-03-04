import { useState, useRef, useEffect } from 'react';
import './AIAssistant.css';

const GEMINI_API_KEY = 'AIzaSyAuWR1Vo_gwSeABywkKsKonwzKMEqMdb1Y';
const GEMINI_API_URLS = [
  `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
  `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
  `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`
];
const GEMINI_API_BASES = [
  'https://generativelanguage.googleapis.com/v1'
];
const PREFERRED_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash'
];

function scoreModel(name = '') {
  const n = String(name).toLowerCase();
  const idx = PREFERRED_MODELS.findIndex(m => n.includes(m));
  return idx === -1 ? 0 : (PREFERRED_MODELS.length - idx);
}

async function discoverGeminiUrls() {
  const discovered = [];
  for (const base of GEMINI_API_BASES) {
    const listUrl = `${base}/models?key=${GEMINI_API_KEY}`;
    const res = await fetch(listUrl).catch(() => null);
    if (!res || !res.ok) continue;
    const data = await res.json().catch(() => ({}));
    const models = (data?.models || [])
      .filter(m => Array.isArray(m?.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
      .sort((a, b) => scoreModel(b?.name) - scoreModel(a?.name));
    for (const model of models) {
      if (!model?.name) continue;
      discovered.push(`${base}/${model.name}:generateContent?key=${GEMINI_API_KEY}`);
    }
  }
  return [...new Set(discovered)];
}

const SYSTEM_PROMPTS = {
  patient: `You are MediAssist, a helpful AI health assistant embedded in MediTrack.

Your personality:
- Friendly, warm, and empathetic
- Always address the patient by name if known
- Use simple language, avoid medical jargon
- Keep answers short and clear (3-5 lines max)

You help patients with:
- Booking and managing appointments
- Understanding their health records and consultation history
- General health tips and wellness advice
- Medication reminders and what to expect at visits
- Preparing questions to ask their doctor

MediTrack platform guide:
- Appointments → book, view, cancel appointments
- Consultations → view past doctor consultations
- Health Records → view lab results and medical history
- My History → full patient history
- Feedback → submit feedback about doctors
- Profile → update personal information

Strict rules:
- NEVER diagnose a disease or prescribe medication
- Always say "please consult your doctor" for medical decisions
- If someone mentions self-harm or emergency, immediately say: "Please call 108 or go to the nearest emergency room."
- Never make up information about the patient's actual data`,

  doctor: `You are MediAssist, a professional AI clinical assistant embedded in MediTrack.

Your personality:
- Professional, concise, and precise
- Use medical terminology appropriately
- Respect the doctor's expertise and time
- Provide evidence-based information only

You help doctors with:
- Viewing and managing patient history and appointments
- Drafting consultation notes and summaries
- Quick reference for drug interactions, dosages (general knowledge)
- Medical terminology explanations
- Administrative tasks on MediTrack

MediTrack platform guide:
- Appointments → manage patient appointments
- Consultations → add/view consultation notes
- Patient History → full patient records
- Directory → find doctors and patients
- Profile → update doctor profile

Strict rules:
- ALWAYS clarify that clinical decisions rest solely with the physician
- Never override or contradict the doctor's clinical judgment
- If unsure about medical data, say "Please verify with latest clinical guidelines"
- Never make up patient data or lab values`,
};

const QUICK_SUGGESTIONS = {
  patient: [
    'Who are the available doctors?',
    'Do I have any appointments?',
    'Tips for a healthy lifestyle',
    'How do I view my health records?',
  ],
  doctor: [
    'How do I view patient history?',
    'Help me write a consultation note',
    'Common drug interactions to watch',
    'How do I manage appointments?',
  ],
};

export default function AIAssistant({ user }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [appContext, setAppContext] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const role = user?.role || 'patient';

  useEffect(() => {
    if (open && user) {
      fetchAppContext();
    }
  }, [open, user]);

  async function fetchAppContext() {
    try {
      const baseURL = 'http://localhost:8080';

      // Try different possible doctor routes
      let doctors = [];
      const doctorRoutes = ['/api/doctors', '/doctors', '/api/doctor', '/doctor'];
      for (const route of doctorRoutes) {
        try {
          const res = await fetch(`${baseURL}${route}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              doctors = data;
              console.log('✅ Doctors fetched from:', route, data);
              break;
            }
          }
        } catch (e) { continue; }
      }

      const doctorList = doctors.length > 0
        ? doctors.map(d =>
            `- ${d.doctor_name || d.name} (${d.specialization || d.specialty || 'General'})`
          ).join('\n')
        : 'No doctors found.';

      // Try different possible appointment routes
      let appointments = [];
      const apptRoutes = [
        `/api/appointments?email=${user.email}`,
        `/appointments?email=${user.email}`,
        `/api/appointments?patientEmail=${user.email}`,
        `/api/appointment?email=${user.email}`,
      ];
      for (const route of apptRoutes) {
        try {
          const res = await fetch(`${baseURL}${route}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              appointments = data;
              console.log('✅ Appointments fetched from:', route, data);
              break;
            }
          }
        } catch (e) { continue; }
      }

      const apptList = appointments.length > 0
        ? appointments.map(a =>
            `- Dr. ${a.doctor_name || a.doctorName} on ${a.date} at ${a.time} [${a.status}]`
          ).join('\n')
        : 'No appointments found.';

      setAppContext(`
Available Doctors in MediTrack:
${doctorList}

Your Appointments:
${apptList}
`);

    } catch (err) {
      console.error('Failed to load app context:', err);
      setAppContext('');
    }
  }

  useEffect(() => {
    if (open && messages.length === 0) {
      const greeting = role === 'doctor'
        ? `Hello Dr. ${user?.name?.split(' ').pop() || 'there'}! I'm MediAssist, your clinical AI companion. How can I help you today?`
        : `Hello ${user?.name?.split(' ')[0] || 'there'}! I'm MediAssist, your personal health assistant. How can I help you today?`;
      setMessages([{ role: 'assistant', text: greeting }]);
    }
  }, [open]);

  useEffect(() => {
    if (open && !minimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, minimized]);

  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, minimized]);

  async function sendMessage(text) {
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const conversationHistory = newMessages
        .filter(m => !(m.role === 'assistant' && newMessages.indexOf(m) === 0))
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.text }]
        }));

      const systemPrompt = `${SYSTEM_PROMPTS[role]}

Current logged-in user info:
- Name: ${user?.name || 'Unknown'}
- Role: ${user?.role || 'patient'}
- Email: ${user?.email || 'Unknown'}

${appContext}

When the patient asks about doctors, list the available doctors above.
When the patient asks about appointments, list their appointments above.
When the patient asks for health tips, give 3-5 practical wellness tips.
Address the user by their first name always.`;

      const contents = [
        {
          role: 'user',
          parts: [{ text: `System instructions: ${systemPrompt}` }]
        },
        {
          role: 'model',
          parts: [{ text: 'Understood. I will follow these instructions carefully.' }]
        },
        ...conversationHistory
      ];

      const body = {
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
        }
      };

      let data = null;
      let lastError = null;
      const discoveredUrls = await discoverGeminiUrls();
      const urlsToTry = discoveredUrls.length ? discoveredUrls : GEMINI_API_URLS;

      for (const url of urlsToTry) {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        if (res.ok) {
          data = await res.json();
          break;
        }

        const errData = await res.json().catch(() => ({}));
        lastError = errData?.error?.message || `HTTP ${res.status}`;
        console.error('Gemini API Error:', { url, error: errData });
      }

      if (!data) throw new Error(lastError || 'Failed to connect to Gemini API.');

      const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text
        || 'Sorry, I could not process that. Please try again.';

      setMessages(prev => [...prev, { role: 'assistant', text: replyText }]);
    } catch (err) {
      console.error('MediAssist error:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `Warning: ${err.message || "I'm having trouble connecting. Please check your internet and try again."}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function clearChat() {
    setMessages([]);
    fetchAppContext();
    setTimeout(() => {
      const greeting = role === 'doctor'
        ? `Hello Dr. ${user?.name?.split(' ').pop() || 'there'}! I'm MediAssist, your clinical AI companion. How can I help you today?`
        : `Hello ${user?.name?.split(' ')[0] || 'there'}! I'm MediAssist, your personal health assistant. How can I help you today?`;
      setMessages([{ role: 'assistant', text: greeting }]);
    }, 100);
  }

  const suggestions = QUICK_SUGGESTIONS[role];

  return (
    <>
      {!open && (
        <button className="ai-fab" onClick={() => setOpen(true)} title="Open AI Assistant">
          <span className="ai-fab__icon">*</span>
          <span className="ai-fab__label">Ask MediAssist</span>
          <span className="ai-fab__ping" />
        </button>
      )}

      {open && (
        <div className={`ai-chat ${minimized ? 'ai-chat--minimized' : ''}`}>
          <div className="ai-chat__header">
            <div className="ai-chat__header-left">
              <div className="ai-chat__avatar">*</div>
              <div>
                <div className="ai-chat__title">MediAssist</div>
                <div className="ai-chat__subtitle">
                  {role === 'doctor' ? 'Clinical AI Assistant' : 'Health AI Assistant'}
                </div>
              </div>
            </div>
            <div className="ai-chat__header-actions">
              <button onClick={clearChat} title="Clear chat" className="ai-icon-btn">R</button>
              <button onClick={() => setMinimized(p => !p)} title={minimized ? 'Expand' : 'Minimize'} className="ai-icon-btn">
                {minimized ? '^' : 'v'}
              </button>
              <button onClick={() => { setOpen(false); setMinimized(false); }} title="Close" className="ai-icon-btn">X</button>
            </div>
          </div>

          {!minimized && (
            <>
              <div className="ai-chat__messages">
                {messages.map((msg, i) => (
                  <div key={i} className={`ai-msg ai-msg--${msg.role}`}>
                    {msg.role === 'assistant' && (
                      <div className="ai-msg__avatar">*</div>
                    )}
                    <div className="ai-msg__bubble">
                      {msg.text.split('\n').map((line, j) => (
                        <span key={j}>{line}{j < msg.text.split('\n').length - 1 && <br />}</span>
                      ))}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="ai-msg ai-msg--assistant">
                    <div className="ai-msg__avatar">*</div>
                    <div className="ai-msg__bubble ai-msg__bubble--typing">
                      <span /><span /><span />
                    </div>
                  </div>
                )}

                {messages.length === 1 && !loading && (
                  <div className="ai-suggestions">
                    {suggestions.map((s, i) => (
                      <button key={i} className="ai-suggestion-btn" onClick={() => sendMessage(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="ai-chat__input-area">
                <textarea
                  ref={inputRef}
                  className="ai-chat__input"
                  placeholder="Ask MediAssist anything..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                <button
                  className="ai-send-btn"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  title="Send"
                >
                  {'>'}
                </button>
              </div>

              <div className="ai-chat__footer">
                Powered by Gemini AI | Always consult a professional for medical decisions
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
