'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { Guest } from '@/types'

type Props = {
  weddingId: string
  qrEnabled: boolean
}

function QRContent({ weddingId, qrEnabled }: Props) {
  const searchParams = useSearchParams()
  const guestToken = searchParams.get('invite')
  const [guest, setGuest] = useState<Guest | null>(null)
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!guestToken || !qrEnabled) { setChecked(true); return }
    const fetchGuest = async () => {
      setLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('guests')
        .select('*')
        .eq('qr_code', guestToken)
        .eq('wedding_id', weddingId)
        .single()
      setGuest(data)
      setLoading(false)
      setChecked(true)
    }
    fetchGuest()
  }, [guestToken, weddingId, qrEnabled])

  // QR not enabled
  if (!qrEnabled) {
    return (
      <section className="py-16 px-6">
        <div className="max-w-md mx-auto text-center">
          <div className="card border-amber-200 bg-amber-50">
            <div className="text-4xl mb-3 opacity-40 select-none filter blur-sm">
              ▓▓▓▓▓▓
            </div>
            <span className="premium-badge mb-3 inline-flex">⭐ Premium feature</span>
            <h3 className="font-bold text-gray-900 mb-2">QR code invitation</h3>
            <p className="text-sm text-gray-500">
              The couple has not yet enabled QR code invitations for this wedding.
            </p>
          </div>
        </div>
      </section>
    )
  }

  // QR enabled but no token in URL
  if (!guestToken) {
    return (
      <section className="py-16 px-6">
        <div className="max-w-md mx-auto text-center">
          <div className="card">
            <div className="text-4xl mb-3">🎟️</div>
            <h3 className="font-bold text-gray-900 mb-2">QR code access</h3>
            <p className="text-sm text-gray-500">
              Your personalised invitation link includes a QR code. Please use the link sent to you directly.
            </p>
          </div>
        </div>
      </section>
    )
  }

  if (loading || !checked) {
    return (
      <section className="py-16 px-6 text-center">
        <p className="text-gray-400 text-sm">Loading your invitation...</p>
      </section>
    )
  }

  if (!guest) {
    return (
      <section className="py-16 px-6">
        <div className="max-w-md mx-auto text-center">
          <div className="card border-red-200 bg-red-50">
            <div className="text-4xl mb-3">❌</div>
            <h3 className="font-bold text-red-700 mb-2">Invalid invitation</h3>
            <p className="text-sm text-red-500">
              This invitation link is not valid. Please contact the couple.
            </p>
          </div>
        </div>
      </section>
    )
  }

  // Valid guest — show QR
  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-sm mx-auto text-center">
        <h2 className="text-2xl font-bold font-wedding text-gray-900 mb-2">
          Your Invitation
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Dear <strong>{guest.name}</strong>, your invitation admits{' '}
          <strong>{guest.seats} {guest.seats === 1 ? 'person' : 'people'}</strong>.
          Present this QR code at the entrance.
        </p>
        {guest.qr_url && (
          <div className="inline-block p-4 bg-white border-2 border-gray-100 rounded-2xl shadow-sm mb-6">
            <img
              src={guest.qr_url}
              alt="Your QR invitation"
              width={200}
              height={200}
            />
          </div>
        )}
        <p className="text-xs text-gray-400">
          Screenshot and save this QR code to your phone.
        </p>
        {guest.scanned_at && (
          <p className="text-xs text-orange-500 mt-2">
            ⚠️ This code has already been scanned at the venue.
          </p>
        )}
      </div>
    </section>
  )
}

export default function QRSection(props: Props) {
  return (
    <Suspense fallback={
      <section className="py-16 px-6 text-center">
        <p className="text-gray-400 text-sm">Loading...</p>
      </section>
    }>
      <QRContent {...props} />
    </Suspense>
  )
}