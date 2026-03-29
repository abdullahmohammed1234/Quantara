import React, { createContext, useContext, useState } from 'react'

// Minimal stub context for components that still need gamification hooks
const GamificationContext = createContext(null)

// Empty implementation - no gamification features
export const GamificationProvider = ({ children }) => {
  // Stub values - all gamification features disabled
  const value = {
    xp: 0,
    level: 1,
    dailyStreak: 0,
    badges: [],
    completedChallenges: [],
    leaderboard: [],
    addXp: () => {},
    completeChallenge: () => {},
    getXpProgress: () => 0,
    getUserRank: () => 0,
    getEarnedBadges: () => [],
    getAvailableBadges: () => [],
  }

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  )
}

/**
 * Hook to access gamification context
 * Returns empty stub values for compatibility
 */
export const useGamification = () => {
  const context = useContext(GamificationContext)
  if (!context) {
    return {
      xp: 0,
      level: 1,
      dailyStreak: 0,
      addXp: () => {},
      completeChallenge: () => {},
      getXpProgress: () => 0,
      getUserRank: () => 0,
      getEarnedBadges: () => [],
      getAvailableBadges: () => [],
      leaderboard: [],
    }
  }
  return context
}

// Stub for CHALLENGE_DEFINITIONS that was imported from GamificationContext
export const CHALLENGE_DEFINITIONS = []