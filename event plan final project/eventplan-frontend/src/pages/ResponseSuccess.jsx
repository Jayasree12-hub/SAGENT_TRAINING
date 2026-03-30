import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'

const STATUS_CONFIG = {
  accepted: {
    eyebrow: 'RSVP accepted',
    icon: '\u2705',
    iconClass: 'text-green-600',
    title: "You're in! \uD83C\uDF89",
    description: 'Your response has been recorded and the organizer can now see your RSVP.',
    panelClass: 'border-green-200 bg-green-50/70',
  },
  declined: {
    eyebrow: 'RSVP declined',
    icon: '\u274C',
    iconClass: 'text-red-500',
    title: 'Maybe next time \uD83D\uDC4D',
    description: 'We have recorded that you will not be attending this event.',
    panelClass: 'border-red-200 bg-red-50/70',
  },
  already: {
    eyebrow: 'Response already saved',
    icon: '\u23F3',
    iconClass: 'text-gold-600',
    title: 'Already responded',
    description: 'This invitation link was used before, so your original answer is still on file.',
    panelClass: 'border-gold-200 bg-gold-50/70',
  },
  error: {
    eyebrow: 'Unable to process RSVP',
    icon: '!',
    iconClass: 'text-obsidian-600',
    title: 'We could not record your response',
    description: 'Please retry with the original email invitation or contact the organizer for help.',
    panelClass: 'border-obsidian-200 bg-obsidian-50/70',
  },
}

export default function ResponseSuccess() {
  const [searchParams] = useSearchParams()
  const status = (searchParams.get('status') || 'error').toLowerCase()
  const message = searchParams.get('message')
  const eventId = searchParams.get('eventId')
  const email = searchParams.get('email')

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.error
  const detailMessage = message?.trim() || config.description

  return (
    <div className="min-h-screen bg-cream px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl items-center justify-center">
        <div className="w-full overflow-hidden rounded-[2rem] border border-obsidian-200 bg-white shadow-[0_24px_80px_rgba(28,24,16,0.12)]">
          <div className="border-b border-obsidian-100 bg-gradient-to-b from-parchment to-white px-8 py-10 text-center">
            <Link to="/" className="font-display text-2xl tracking-wide text-obsidian-900">
              Soiree
            </Link>
            <div className="mt-8 text-xs uppercase tracking-[0.28em] text-gold-700">{config.eyebrow}</div>
            <div className={`mt-5 text-6xl ${config.iconClass}`}>{config.icon}</div>
            <h1 className="mt-5 font-display text-4xl text-obsidian-900">{config.title}</h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-obsidian-500">{detailMessage}</p>
          </div>

          <div className="px-8 py-8">
            <div className={`rounded-3xl border p-6 ${config.panelClass}`}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-obsidian-400">Response Status</div>
                  <div className="mt-2 text-lg font-medium capitalize text-obsidian-900">{status}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-obsidian-400">Event ID</div>
                  <div className="mt-2 text-lg font-medium text-obsidian-900">{eventId || 'Not provided'}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-obsidian-400">Email</div>
                  <div className="mt-2 break-all text-lg font-medium text-obsidian-900">{email || 'Not provided'}</div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to="/" className="btn-primary justify-center px-8">
                Return Home
              </Link>
              <Link to="/login" className="btn-secondary justify-center px-8">
                Organizer Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
