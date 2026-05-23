import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { format } from 'date-fns'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

type Photo = {
  id?: number
  photo_url?: string
  url?: string
  alt_text?: string
}

function PhotoGallery({ photos }: { photos: Photo[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {photos.map((photo, index) => (
        <div key={photo.id ?? index} className="overflow-hidden rounded-xl">
          <img
            src={photo.photo_url || photo.url || ''}
            alt={photo.alt_text || `Wedding photo ${index + 1}`}
            className="w-full h-72 object-cover"
          />
        </div>
      ))}
    </div>
  )
}

function VenueMap({ lat, lng, venueName }: { lat: number; lng: number; venueName: string }) {
  return (
    <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-sm">
      <div className="bg-gray-50 p-6 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-2">Venue Location</p>
        <p className="text-lg font-semibold text-gray-900">{venueName}</p>
        <p className="text-sm text-gray-500">Latitude: {lat}</p>
        <p className="text-sm text-gray-500">Longitude: {lng}</p>
      </div>
      <div className="h-[420px] bg-gray-100 flex items-center justify-center text-gray-400">
        Map preview unavailable
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: wedding } = await supabase
    .from('weddings')
    .select('bride_name, groom_name, wedding_date')
    .eq('slug', slug)
    .single()

  if (!wedding) return { title: 'Invitation not found' }
  return {
    title: `${wedding.bride_name} & ${wedding.groom_name} — Wedding Invitation`,
    description: `Join us to celebrate the wedding of ${wedding.bride_name} and ${wedding.groom_name}`,
  }
}

export default async function WeddingPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('*, wedding_photos(*)')
    .eq('slug', slug)
    .eq('is_published', true)
    .eq('is_active', true)
    .single()

  if (!wedding) notFound()

  const photos = wedding.wedding_photos || []

  return (
    <div className="min-h-screen bg-[var(--cream)]">

      {/* Hero */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-gray-900">
        {wedding.cover_photo_url ? (
          <img
            src={wedding.cover_photo_url}
            alt="Wedding cover"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-rose-900 to-gray-900 opacity-80" />
        )}
        <div className="relative z-10 text-center text-white px-6">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-300 mb-4 font-light">
            You are cordially invited to the wedding of
          </p>
          <h1 className="text-5xl md:text-7xl font-bold font-wedding mb-4 leading-tight">
            {wedding.bride_name}
            <span className="text-amber-400 mx-4">&</span>
            {wedding.groom_name}
          </h1>
          <p className="text-xl text-white/80 font-light">
            {format(new Date(wedding.wedding_date), 'EEEE, MMMM d, yyyy')}
            {wedding.wedding_time && ` · ${wedding.wedding_time}`}
          </p>
          {wedding.venue_name && (
            <p className="text-sm text-white/60 mt-2">{wedding.venue_name}</p>
          )}
        </div>
      </section>

      {/* Event details */}
      <section className="py-16 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold font-wedding text-gray-900 mb-8">
            Event Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="card text-center">
              <div className="text-2xl mb-2">📅</div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Date</p>
              <p className="font-semibold text-gray-900 text-sm">
                {format(new Date(wedding.wedding_date), 'MMM d, yyyy')}
              </p>
            </div>
            {wedding.wedding_time && (
              <div className="card text-center">
                <div className="text-2xl mb-2">🕐</div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Time</p>
                <p className="font-semibold text-gray-900 text-sm">{wedding.wedding_time}</p>
              </div>
            )}
            {wedding.dress_code && (
              <div className="card text-center">
                <div className="text-2xl mb-2">👗</div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Dress code</p>
                <p className="font-semibold text-gray-900 text-sm">{wedding.dress_code}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Love story */}
      {wedding.story_body && (
        <section className="py-16 px-6 bg-white">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold font-wedding text-gray-900 mb-8">
              {wedding.story_title || 'Our Story'}
            </h2>
            <div className="text-gray-600 leading-relaxed text-base whitespace-pre-wrap text-left">
              {wedding.story_body}
            </div>
          </div>
        </section>
      )}

      {/* Photo gallery */}
      {photos.length > 0 && (
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold font-wedding text-gray-900 mb-8 text-center">
              Our Photos
            </h2>
            <PhotoGallery photos={photos} />
          </div>
        </section>
      )}

      {/* Venue map */}
      {wedding.venue_lat && wedding.venue_lng && (
        <section className="py-16 px-6 bg-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold font-wedding text-gray-900 mb-2 text-center">
              Venue
            </h2>
            {wedding.venue_name && (
              <p className="text-center text-gray-500 mb-2">{wedding.venue_name}</p>
            )}
            {wedding.venue_address && (
              <p className="text-center text-sm text-gray-400 mb-8">{wedding.venue_address}</p>
            )}
            <VenueMap
              lat={wedding.venue_lat}
              lng={wedding.venue_lng}
              venueName={wedding.venue_name || 'Wedding Venue'}
            />
          </div>
        </section>
      )}

      {/* QR section */}
      <QRSection weddingId={wedding.id} qrEnabled={wedding.qr_enabled} />

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-400 border-t border-gray-100">
        Made with ❤️ on{' '}
        <a href="/" className="text-amber-500 hover:underline">InviteDay</a>
      </footer>

    </div>
  )
}