"use client"

import { useState, useEffect } from "react"

interface UserProgress {
  clarityScore: number
  avgPitch: number
  totalSessions: number
  streak: number
  weekSessions: number
  weeklyGoal: number
  badges: string[]
  recentActivity: Array<{
    text: string
    color: string
  }>
}

export function useUserProgress() {
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProgress()
  }, [])

  const loadProgress = async () => {
    try {
      // In a real app, this would fetch from your database
      // For now, we'll use localStorage with some mock data
      const savedProgress = localStorage.getItem("vocalmaster_progress")

      if (savedProgress) {
        setProgress(JSON.parse(savedProgress))
      } else {
        // Initialize with default progress
        const defaultProgress: UserProgress = {
          clarityScore: 65,
          avgPitch: 165,
          totalSessions: 0,
          streak: 0,
          weekSessions: 0,
          weeklyGoal: 5,
          badges: [],
          recentActivity: [],
        }
        setProgress(defaultProgress)
        localStorage.setItem("vocalmaster_progress", JSON.stringify(defaultProgress))
      }
    } catch (error) {
      console.error("Error loading progress:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateProgress = (updates: Partial<UserProgress>) => {
    if (!progress) return

    const updatedProgress = { ...progress, ...updates }
    setProgress(updatedProgress)
    localStorage.setItem("vocalmaster_progress", JSON.stringify(updatedProgress))
  }

  const addSession = () => {
    if (!progress) return

    const newActivity = {
      text: "Completed voice analysis session",
      color: "bg-green-500",
    }

    updateProgress({
      totalSessions: progress.totalSessions + 1,
      weekSessions: progress.weekSessions + 1,
      recentActivity: [newActivity, ...progress.recentActivity.slice(0, 4)],
    })
  }

  const earnBadge = (badgeId: string) => {
    if (!progress || progress.badges.includes(badgeId)) return

    const newActivity = {
      text: `Earned new badge: ${badgeId.replace("_", " ")}`,
      color: "bg-purple-500",
    }

    updateProgress({
      badges: [...progress.badges, badgeId],
      recentActivity: [newActivity, ...progress.recentActivity.slice(0, 4)],
    })
  }

  return {
    progress,
    loading,
    updateProgress,
    addSession,
    earnBadge,
  }
}
