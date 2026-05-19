'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/utils/supabase/client'
import type { Profile } from '@/types'

const navItems = [
  { href: '/dashboard',              label: 'Overview',    icon: '🏠' },
  { href: '/dashboard/wedding/edit', label: 'My Invitation', icon: '💍' },
  { href: '/dashboard/photos',       label: 'Photos',      icon: '📷' },
  { href: '/dashboard/guests',       label: 'Guests & QR', icon: '🎟️' },
  { href: '/dashboard/settings',     label: 'Settings',    icon: '⚙️' },
]

export default function DashboardSidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Logged out')
    router.push('/')
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 flex flex-col z-10">

      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <Link href="/" className="text-lg font-semibold text-amber-600">
          InviteDay
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-amber-50 text-amber-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User info + logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm font-semibold text-amber-700">
            {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {profile?.full_name || 'My Account'}
            </p>
            <p className="text-xs text-gray-400 truncate">{profile?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
        >
          Log out
        </button>
      </div>

    </aside>
  )
}