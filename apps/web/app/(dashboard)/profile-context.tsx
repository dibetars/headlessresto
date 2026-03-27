'use client'

import React, { createContext, useContext } from 'react'

interface UserProfile {
  id: string
  role: string
  full_name: string
  restaurant_id?: string
  organization?: {
    name: string
    brand_assets?: {
      features?: Record<string, boolean>
    }
  }
}

interface ProfileContextValue {
  profile: UserProfile | null
}

const ProfileContext = createContext<ProfileContextValue>({ profile: null })

export function ProfileProvider({
  children,
  profile,
}: {
  children: React.ReactNode
  profile: UserProfile | null
}) {
  return (
    <ProfileContext.Provider value={{ profile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile(): ProfileContextValue {
  return useContext(ProfileContext)
}
