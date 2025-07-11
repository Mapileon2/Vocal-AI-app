"use client"

import { useState } from "react"
import { useApiKey } from "./use-api-key"

interface GeminiRequest {
  prompt: string
  systemPrompt?: string
  model?: string
  temperature?: number
  maxTokens?: number
}

interface GeminiResponse {
  text: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export function useGeminiAI() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { getApiKey, trackUsage, checkRateLimit } = useApiKey()

  const generateText = async (request: GeminiRequest): Promise<GeminiResponse | null> => {
    setIsGenerating(true)
    setError(null)

    try {
      // Check rate limiting
      if (!checkRateLimit()) {
        throw new Error("Daily API usage limit exceeded. Please try again tomorrow.")
      }

      const apiKey = await getApiKey()
      if (!apiKey) {
        throw new Error("API key not found. Please configure your Gemini API key.")
      }

      const model = request.model || "gemini-1.5-flash"
      const systemContent = request.systemPrompt ? `${request.systemPrompt}\n\n` : ""
      const fullPrompt = `${systemContent}${request.prompt}`

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: fullPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: request.temperature || 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: request.maxTokens || 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Gemini API error:", errorData)

        if (response.status === 429) {
          throw new Error("API rate limit exceeded. Please wait a moment and try again.")
        } else if (response.status === 401) {
          throw new Error("Invalid API key. Please check your Gemini API key configuration.")
        } else {
          throw new Error(errorData.error?.message || "Failed to generate AI response")
        }
      }

      const data = await response.json()
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!generatedText) {
        throw new Error("No response generated from AI")
      }

      // Track usage
      trackUsage()

      return {
        text: generatedText,
        usage: data.usageMetadata
          ? {
              promptTokens: data.usageMetadata.promptTokenCount || 0,
              completionTokens: data.usageMetadata.candidatesTokenCount || 0,
              totalTokens: data.usageMetadata.totalTokenCount || 0,
            }
          : undefined,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setError(errorMessage)
      console.error("Gemini AI error:", error)
      return null
    } finally {
      setIsGenerating(false)
    }
  }

  const generateVoiceAnalysisFeedback = async (analysisData: any): Promise<string | null> => {
    const prompt = `As a professional voice coach, analyze this voice data and provide specific, actionable feedback:

VOICE METRICS:
- Fundamental Frequency: ${analysisData.fundamentalFreq} Hz
- Pitch Stability (Jitter): ${analysisData.jitter}%
- Volume Stability (Shimmer): ${analysisData.shimmer}%
- Clarity Score: ${analysisData.clarityScore}%
- Formants: ${analysisData.formants?.map((f: any) => `${f.freq}Hz`).join(", ") || "Not available"}

Please provide:
1. Overall assessment of voice quality
2. Specific strengths to build upon
3. Areas needing improvement with practical exercises
4. Daily practice recommendations

Keep the feedback encouraging, specific, and actionable. Limit to 4 paragraphs.`

    const response = await generateText({
      prompt,
      systemPrompt:
        "You are an expert voice coach with 20+ years of experience helping people improve their speaking and presentation skills. Provide encouraging, specific, and actionable feedback.",
      temperature: 0.8,
      maxTokens: 800,
    })

    return response?.text || null
  }

  return {
    generateText,
    generateVoiceAnalysisFeedback,
    isGenerating,
    error,
  }
}
