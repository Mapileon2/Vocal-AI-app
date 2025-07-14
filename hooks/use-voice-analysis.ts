"use client"

import { useState } from "react"

interface VoiceAnalysisData {
  fundamentalFreq: number
  jitter: number
  shimmer: number
  clarityScore: number
  formants: Array<{ freq: number; amplitude: number }>
  recommendations: string[]
  spectralData: number[]
  pitchContour: number[]
  duration?: number
  voicedPercentage?: number
}

export function useVoiceAnalysis() {
  const [analysisData, setAnalysisData] = useState<VoiceAnalysisData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeAudio = async (audioBlob: Blob | File): Promise<VoiceAnalysisData | null> => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("audio", audioBlob, "recording.webm")

      const response = await fetch("/api/analyze-voice", {
        method: "POST",
        body: formData,
      })

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        let errorMessage = "Analysis failed"

        try {
          const errorData = await response.json()
          errorMessage = errorData.error || `Server error: ${response.status}`
        } catch (jsonError) {
          // If JSON parsing fails, use status text
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }

        throw new Error(errorMessage)
      }

      // Parse JSON response
      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        throw new Error("Invalid response format from server")
      }

      // Check for error in response data
      if (data.error) {
        throw new Error(data.error)
      }

      // Validate required fields
      if (!data.fundamentalFreq || !data.clarityScore || !data.formants) {
        throw new Error("Incomplete analysis data received")
      }

      setAnalysisData(data)
      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setError(errorMessage)
      console.error("Voice analysis error:", error)
      return null
    } finally {
      setIsAnalyzing(false)
    }
  }

  const clearAnalysis = () => {
    setAnalysisData(null)
    setError(null)
  }

  const startRecording = async () => {
    // TODO: Implement audio recording logic here
    console.log("Starting recording...");
  };

  const stopRecording = async () => {
    // TODO: Implement audio recording logic here
    console.log("Stopping recording...");
    return { audioBlob: new Blob(), audioData: [] };
  };

  const analyzeAccent = async (audioBlob: Blob, accent: string, prompt: string) => {
    // TODO: Implement accent analysis logic here
    console.log("Analyzing accent...");
    return { feedback: "Your accent is very good!" };
  };

  return {
    analysisData,
    isAnalyzing,
    analyzeAudio,
    clearAnalysis,
    error,
    startRecording,
    stopRecording,
    analyzeAccent,
  }
}
