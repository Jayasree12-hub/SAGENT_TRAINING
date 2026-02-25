# MediTrack Frontend

React frontend for the Patient Monitoring System Spring Boot backend.

## Project Structure

```
src/
├── styles/
│   └── global.css          ← CSS variables, base resets, animations
│
├── services/
│   ├── api.js              ← Base fetch wrapper
│   ├── authService.js      ← Login & register logic
│   └── dataService.js      ← All endpoint services (appointments, etc.)
│
├── hooks/
│   └── useToast.js         ← Toast notification hook
│
├── components/
│   ├── Layout.jsx / .css   ← App shell with sidebar
│   ├── Sidebar.jsx / .css  ← Navigation sidebar
│   ├── Modal.jsx / .css    ← Reusable modal dialog
│   ├── Toast.jsx / .css    ← Toast notifications
│   └── UI.jsx / .css       ← Button, Input, Badge, StatCard, Table helpers
│
├── pages/
│   ├── Login.jsx / .css
│   ├── Register.jsx / .css
│   ├── Appointments.jsx / .css
│   ├── Consultations.jsx / .css
│   ├── HealthRecords.jsx
│   ├── PatientHistory.jsx
│   ├── Feedback.jsx / .css
│   ├── Profile.jsx / .css
│   └── Directory.jsx       ← Doctors + Patients listing
│
├── App.jsx                 ← Root router/state
└── main.jsx                ← ReactDOM entry
```

## Setup

Make sure your Spring Boot backend is running on `http://localhost:8080`.

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev
```

## Backend Endpoints Used

| Module          | Endpoints                                         |
|-----------------|---------------------------------------------------|
| Auth (simulated)| GET /doctors, GET /patients (email+password match)|
| Appointments    | GET/POST/PUT/DELETE /appointments                 |
| Consultations   | GET/POST/DELETE /consultations                    |
| Health Records  | GET/POST/DELETE /health-records                   |
| Patient History | GET/POST/DELETE /patient-history                  |
| Feedback        | GET/POST/DELETE /feedback                         |
| Doctors         | GET /doctors, PUT /doctors/:id                    |
| Patients        | GET /patients, PUT /patients/:id, POST /patients  |

## Design

- **Theme**: Warm neutral light theme (off-white, sage green accents)
- **Fonts**: Playfair Display (display) + Nunito (body)
- **Color scheme**: CSS custom properties throughout for easy theming
- **Responsive**: Mobile-friendly with collapsing sidebar
