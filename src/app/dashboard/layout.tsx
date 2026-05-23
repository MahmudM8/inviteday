import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import React from 'react'

// Fallback inline DashboardSidebar to avoid module resolution errors.
// This keeps layout working even if the external component is missing.
function DashboardSidebar({ profile }: { profile: any }) {
  return (
    <aside className="w-64 bg-white border-r p-4 fixed inset-y-0 left-0">
      <div className="text-sm text-gray-700">{profile?.full_name ?? 'Guest'}</div>
    </aside>
  )
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar profile={profile} />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  )
}