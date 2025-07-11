"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Sparkles, RefreshCw, Copy, ThumbsUp, ThumbsDown, Zap } from "lucide-react"
import { useGeminiAI } from "@/hooks/use-gemini-ai"
import { useApiKey } from "@/hooks/use-api-key"
import { toast } from "@/hooks/use-toast"

interface AIFeedbackProps {
  analysisData: {
    fundamentalFreq: number
    jitter: number
    shimmer: number
    clarityScore: number
    formants?: Array<{ freq: number; amplitude: number }>
  }
}

export function AIFeedback({ analysisData }: AIFeedbackProps) {
  console.log("AIFeedback rendered");
  const [feedback, setFeedback] = useState<string | null>(null)
  const [feedbackRating, setFeedbackRating] = useState<"positive" | "negative" | null>(null)
  const { generateVoiceAnalysisFeedback, isGenerating, error } = useGeminiAI()
  const { hasValidKey, usageStats } = useApiKey()

  useEffect(() => {
    // Auto-generate feedback when analysis data is available and API key is valid
    if (analysisData && hasValidKey && !feedback) {
      handleGenerateFeedback()
    }
  }, [analysisData, hasValidKey])

  const handleGenerateFeedback = async () => {
    if (!hasValidKey) {
      toast({
        title: "API Key Required",
        description: "Please configure your Gemini API key to get AI feedback.",
        variant: "destructive",
      })
      return
    }

    try {
      const generatedFeedback = await generateVoiceAnalysisFeedback(analysisData)
      if (generatedFeedback) {
        setFeedback(generatedFeedback)
        setFeedbackRating(null)
        toast({
          title: "AI Feedback Generated",
          description: "Your personalized voice coaching feedback is ready!",
        })
      }
    } catch (error) {
      toast({
        title: "Feedback Generation Failed",
        description: "Unable to generate AI feedback. Please try again.",
        variant: "destructive",
      })
    }
  }

  const copyFeedback = () => {
    if (feedback) {
      navigator.clipboard.writeText(feedback)
      toast({
        title: "Feedback Copied",
        description: "AI feedback has been copied to your clipboard.",
      })
    }
  }

  const rateFeedback = (rating: "positive" | "negative") => {
    setFeedbackRating(rating)
    toast({
      title: "Thank You!",
      description: "Your feedback helps us improve our AI coaching.",
    })
  }

  if (!hasValidKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Voice Coach
          </CardTitle>
          <CardDescription>Get personalized feedback powered by Gemini AI</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Zap className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600 mb-4">Configure your Gemini API key to unlock AI-powered voice coaching</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Configure API Key
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI Voice Coach
        </CardTitle>
        <CardDescription className="flex items-center justify-between">
          <span>Advanced AI analysis powered by Gemini</span>
          {usageStats && (
            <Badge variant="outline" className="text-xs">
              {usageStats.dailyRequests}/100 daily requests
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!feedback && !isGenerating && (
          <div className="text-center py-6">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600 mb-4">Get detailed AI coaching based on your voice analysis</p>
            <Button onClick={handleGenerateFeedback} className="bg-purple-600 hover:bg-purple-700">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate AI Coaching
            </Button>
          </div>
        )}

        {isGenerating && (
          <div className="text-center py-8">
            <div className="relative">
              <div className="animate-spin w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"></div>
              <Sparkles className="w-6 h-6 text-purple-600 absolute top-3 left-1/2 transform -translate-x-1/2" />
            </div>
            <p className="text-gray-600 font-medium">Gemini AI is analyzing your voice...</p>
            <p className="text-sm text-gray-500 mt-1">Generating personalized coaching recommendations</p>
          </div>
        )}

        {feedback && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{feedback}</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Badge variant="secondary">Gemini AI</Badge>
                <Badge variant="secondary">Personalized</Badge>
                <Badge variant="secondary">Real Analysis</Badge>
              </div>

              <div className="flex gap-2">
                <Button onClick={copyFeedback} variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
                <Button onClick={handleGenerateFeedback} variant="outline" size="sm" disabled={isGenerating}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Regenerate
                </Button>
              </div>
            </div>

            {/* Feedback Rating */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">Was this AI feedback helpful?</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => rateFeedback("positive")}
                  variant={feedbackRating === "positive" ? "default" : "outline"}
                  size="sm"
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  Helpful
                </Button>
                <Button
                  onClick={() => rateFeedback("negative")}
                  variant={feedbackRating === "negative" ? "destructive" : "outline"}
                  size="sm"
                >
                  <ThumbsDown className="w-4 h-4 mr-1" />
                  Not Helpful
                </Button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
            <Button onClick={handleGenerateFeedback} variant="outline" size="sm" className="mt-2 bg-transparent">
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
