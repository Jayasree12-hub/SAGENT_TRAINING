import React, { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { rsvpApi } from '../api/client'
import { Spinner } from '../components/ui'

function getStatusFromResponse(response) {
  const normalized = response?.trim().toLowerCase()
  if (['yes', 'y', 'accept', 'accepted'].includes(normalized)) return 'accepted'
  if (['no', 'n', 'decline', 'declined'].includes(normalized)) return 'declined'
  return 'error'
}

function getErrorMessage(error) {
  const data = error.response?.data
  if (typeof data === 'string' && data.trim()) {
    return data
  }
  if (data?.message) {
    return data.message
  }
  return 'Failed to submit your RSVP. The link may be expired or invalid.'
}

export default function RsvpRespond() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const eventId = searchParams.get('eventId')
  const email = searchParams.get('email')
  const response = searchParams.get('response')

  useEffect(() => {
    let cancelled = false

    const redirectToResult = (status, message) => {
      if (cancelled) return
      const params = new URLSearchParams()
      params.set('status', status)
      if (message) params.set('message', message)
      if (eventId) params.set('eventId', eventId)
      if (email) params.set('email', email)
      navigate(`/response-success?${params.toString()}`, { replace: true })
    }

    const submitRsvp = async () => {
      if (!eventId || !email || !response) {
        redirectToResult('error', 'Invalid RSVP link. Please check your email invitation.')
        return
      }

      try {
        await rsvpApi.respond({
          eventId: Number(eventId),
          guestEmail: email,
          response,
        })
        redirectToResult(getStatusFromResponse(response), 'Your RSVP response has been recorded.')
      } catch (error) {
        const status = error.response?.status === 409 ? 'already' : 'error'
        redirectToResult(status, getErrorMessage(error))
      }
    }

    submitRsvp()
    return () => {
      cancelled = true
    }
  }, [email, eventId, navigate, response])

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center animate-slide-up">
        <Link to="/" className="inline-block mb-10">
          <span className="font-display text-2xl text-obsidian-900 tracking-wide">Soiree</span>
        </Link>

        <div className="card p-10">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" className="text-obsidian-400" />
            <h1 className="font-display text-2xl text-obsidian-900">Submitting your RSVP</h1>
            <p className="text-obsidian-500 font-sans text-sm leading-relaxed">
              We are confirming your invitation response and redirecting you now.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
