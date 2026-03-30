import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function Landing() {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background geometric */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-parchment" />
          <div className="absolute top-[20%] right-[5%] w-72 h-72 border border-gold-300/40 rounded-full" />
          <div className="absolute top-[30%] right-[12%] w-48 h-48 border border-gold-400/30 rounded-full" />
          <div className="absolute bottom-20 left-[5%] w-96 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-16 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-px bg-gold-500" />
                <span className="text-xs uppercase tracking-[0.2em] text-gold-600 font-sans">Professional Event Planning</span>
              </div>

              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-light text-obsidian-900 leading-[1.1] mb-6">
                Plan events<br />
                <em className="text-gold-600 not-italic">without</em> the<br />
                chaos
              </h1>

              <p className="font-sans text-obsidian-500 text-lg max-w-md mb-8 leading-relaxed">
                From intimate gatherings to grand galas — manage guests, vendors, budgets, and tasks in one refined platform.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link to="/register" className="btn-primary px-8 py-3 text-sm">
                  Start Planning
                </Link>
                <Link to="/vendor/register" className="btn-secondary px-8 py-3 text-sm">
                  Join as Vendor
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-6">
                {[
                  { n: '500+', l: 'Events Managed' },
                  { n: '12k+', l: 'Guests Invited' },
                  { n: '98%', l: 'Satisfaction' },
                ].map((s) => (
                  <div key={s.l} className="text-center">
                    <div className="font-display text-2xl text-obsidian-900">{s.n}</div>
                    <div className="text-xs text-obsidian-400 tracking-wide">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — decorative card stack */}
            <div className="hidden lg:flex items-center justify-center animate-slide-up">
              <div className="relative w-80 h-80">
                {/* Back card */}
                <div className="absolute top-6 left-6 w-72 h-56 bg-obsidian-900 rounded-lg rotate-3 opacity-80" />
                {/* Mid card */}
                <div className="absolute top-3 left-3 w-72 h-56 bg-gold-600 rounded-lg rotate-1 opacity-60" />
                {/* Front card */}
                <div className="absolute top-0 left-0 w-72 h-56 bg-white rounded-lg shadow-xl border border-obsidian-100 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-display text-sm text-obsidian-600">Summer Gala 2025</span>
                    <span className="badge-status bg-gold-50 text-gold-700 border border-gold-200">PLANNED</span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs text-obsidian-400">
                      <span>Guests</span><span className="text-obsidian-700 font-medium">124 / 150</span>
                    </div>
                    <div className="w-full bg-obsidian-100 rounded-full h-1.5">
                      <div className="bg-gold-500 h-1.5 rounded-full" style={{width:'83%'}} />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-obsidian-400">
                    <span>Budget Used</span><span className="text-obsidian-700 font-medium">₹2.4L / ₹3L</span>
                  </div>
                  <div className="w-full bg-obsidian-100 rounded-full h-1.5 mt-1">
                    <div className="bg-obsidian-800 h-1.5 rounded-full" style={{width:'80%'}} />
                  </div>
                  <div className="mt-4 pt-3 border-t border-obsidian-100 flex gap-2">
                    <div className="flex-1 text-center">
                      <div className="text-base font-display text-obsidian-900">8</div>
                      <div className="text-[10px] text-obsidian-400">Tasks</div>
                    </div>
                    <div className="flex-1 text-center">
                      <div className="text-base font-display text-obsidian-900">3</div>
                      <div className="text-[10px] text-obsidian-400">Vendors</div>
                    </div>
                    <div className="flex-1 text-center">
                      <div className="text-base font-display text-obsidian-900">Jul 15</div>
                      <div className="text-[10px] text-obsidian-400">Date</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-obsidian-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-light text-obsidian-900 mb-3">Everything you need</h2>
            <div className="deco-line w-24 mx-auto" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '◈', title: 'Event Management', desc: 'Create and manage events with full lifecycle tracking from planning to completion.' },
              { icon: '◎', title: 'Guest & RSVP', desc: 'Manage guest lists, send invitations, and track RSVP responses effortlessly.' },
              { icon: '◉', title: 'Task Tracking', desc: 'Assign tasks with priorities and deadlines. Keep your team aligned.' },
              { icon: '◇', title: 'Budget Control', desc: 'Track estimated vs actual spend per category. Never go over budget.' },
              { icon: '◈', title: 'Vendor Network', desc: 'Connect with vendors, compare services, and manage event-vendor relationships.' },
              { icon: '◎', title: 'Invitations', desc: 'Send digital invitations with custom messages and track delivery.' },
            ].map((f) => (
              <div key={f.title} className="card p-6 hover:shadow-md transition-shadow">
                <div className="text-2xl text-gold-500 mb-3">{f.icon}</div>
                <h3 className="font-display text-lg text-obsidian-900 mb-2">{f.title}</h3>
                <p className="text-sm text-obsidian-400 font-sans leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-obsidian-900">
        <div className="max-w-2xl mx-auto text-center px-6">
          <h2 className="font-display text-4xl font-light text-cream mb-4">Ready to begin?</h2>
          <p className="text-obsidian-300 font-sans mb-8">Join organizers and vendors already using Soirée.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/register" className="btn-gold">Create Account</Link>
            <Link to="/login" className="btn-secondary border-obsidian-600 text-cream hover:bg-obsidian-800">Sign In</Link>
          </div>
        </div>
      </section>

      <footer className="py-6 border-t border-obsidian-800 bg-obsidian-900">
        <p className="text-center text-obsidian-500 text-xs font-sans">© 2025 Soirée Event Planning. All rights reserved.</p>
      </footer>
    </div>
  )
}
