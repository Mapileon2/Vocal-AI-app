"use client"

import { useState } from "react"
import { useApiKey } from "./use-api-key"

interface Persona {
  id: string
  name: string
  model: string
  systemPrompt: string
}

export function usePersonaCoaching() {
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { getApiKey } = useApiKey()

  const getFeedback = async (audioBlob: Blob, persona: Persona, practiceText: string) => {
    setIsGenerating(true)
    setError(null)

    try {
      const apiKey = await getApiKey()
      if (!apiKey) {
        throw new Error("API key not found. Please configure your Gemini API key.")
      }

      // First, analyze the audio
      const formData = new FormData()
      formData.append("audio", audioBlob, "recording.webm")

      const analysisResponse = await fetch("/api/analyze-voice", {
        method: "POST",
        body: formData,
      })

      if (!analysisResponse.ok) {
        throw new Error("Failed to analyze audio")
      }

      const analysisData = await analysisResponse.json()

      // Then get persona feedback
      const feedbackResponse = await fetch("/api/persona-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          persona,
          analysisData,
          practiceText,
        }),
      })

      if (!feedbackResponse.ok) {
        const errorData = await feedbackResponse.json()
        throw new Error(errorData.error || "Failed to generate feedback")
      }

      const { feedback: generatedFeedback } = await feedbackResponse.json()
      setFeedback(generatedFeedback)
      return generatedFeedback
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setError(errorMessage)
      console.error("Persona coaching error:", error)
      throw error
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    feedback,
    isGenerating,
    error,
    getFeedback,
  }
}
