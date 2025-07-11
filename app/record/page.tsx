"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, Square, Play, Upload, ArrowLeft, Download, Trash2 } from "lucide-react"
import Link from "next/link"
import { AudioVisualizer } from "@/components/audio-visualizer"
import { VoiceAnalysis } from "@/components/voice-analysis"
import { AIFeedback } from "@/components/ai-feedback"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import { useVoiceAnalysis } from "@/hooks/use-voice-analysis"
import { toast } from "@/hooks/use-toast"

export default function RecordPage() {
  const {
    isRecording,
    isPlaying,
    audioData,
    recordedBlob,
    startRecording,
    stopRecording,
    playRecording,
    clearRecording,
  } = useAudioRecorder()

  const { analysisData, isAnalyzing, analyzeAudio, error } = useVoiceAnalysis()
  const [showFeedback, setShowFeedback] = useState(false)

  const handleStopRecording = async () => {
    const blob = await stopRecording()
    if (blob) {
      toast({
        title: "Recording Complete",
        description: "Your voice recording is ready for analysis.",
      })
    }
  }

  const handleAnalyze = async () => {
    if (!recordedBlob) return

    try {
      const result = await analyzeAudio(recordedBlob)
      if (result) {
        setShowFeedback(true)
        toast({
          title: "Analysis Complete",
          description: "Your voice analysis is ready with AI feedback.",
        })
      }
    } catch (error) {
      console.error("Analysis error:", error)
      toast({
        title: "Analysis Failed",
        description:
          error instanceof Error ? error.message : "There was an error analyzing your recording. Please try again.",
        variant: "destructive",
      })
    }
  }

  const downloadRecording = () => {
    if (!recordedBlob) return

    const url = URL.createObjectURL(recordedBlob)
    const a = document.createElement("a")
    a.href = url
    a.download = `vocalmaster-recording-${new Date().toISOString().slice(0, 19)}.wav`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Voice Analysis Studio</h1>
            <p className="text-gray-600">Record and analyze your voice with AI-powered feedback</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recording Controls */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Recording Studio
                </CardTitle>
                <CardDescription>Record your voice for real-time analysis and AI feedback</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Recording Controls */}
                <div className="flex items-center justify-center gap-4">
                  {!isRecording ? (
                    <Button onClick={startRecording} size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8">
                      <Mic className="w-5 h-5 mr-2" />
                      Start Recording
                    </Button>
                  ) : (
                    <Button onClick={handleStopRecording} size="lg" variant="outline" className="px-8 bg-transparent">
                      <Square className="w-5 h-5 mr-2" />
                      Stop Recording
                    </Button>
                  )}

                  {recordedBlob && (
                    <>
                      <Button onClick={playRecording} variant="outline" disabled={isPlaying}>
                        <Play className="w-4 h-4 mr-2" />
                        {isPlaying ? "Playing..." : "Play"}
                      </Button>
                      <Button onClick={downloadRecording} variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button onClick={clearRecording} variant="outline" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </>
                  )}
                </div>

                {/* Status */}
                <div className="text-center">
                  {isRecording && (
                    <Badge variant="destructive" className="animate-pulse">
                      Recording in progress...
                    </Badge>
                  )}
                  {recordedBlob && !isRecording && (
                    <Badge variant="secondary">Recording complete - Ready for analysis</Badge>
                  )}
                  {isAnalyzing && (
                    <Badge variant="default" className="animate-pulse">
                      Analyzing with AI...
                    </Badge>
                  )}
                </div>

                {/* Audio Visualizer */}
                <AudioVisualizer audioData={audioData} isRecording={isRecording} />

                {/* Analysis Button */}
                {recordedBlob && !isAnalyzing && (
                  <div className="text-center">
                    <Button onClick={handleAnalyze} size="lg" className="bg-purple-600 hover:bg-purple-700">
                      <Upload className="w-5 h-5 mr-2" />
                      Analyze with AI
                    </Button>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analysis Results */}
            {analysisData && <VoiceAnalysis data={analysisData} />}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recording Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recording Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span>Speak clearly and at a natural pace</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span>Maintain 6-12 inches from microphone</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span>Record in a quiet environment</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span>Speak for 30-60 seconds for best analysis</span>
                </div>
              </CardContent>
            </Card>

            {/* Sample Scripts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Practice Scripts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Professional Introduction</h4>
                  <p className="text-xs text-gray-600">
                    "Good morning, my name is [Your Name], and I'm excited to share my expertise in [Your Field]..."
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Presentation Opening</h4>
                  <p className="text-xs text-gray-600">
                    "Thank you for joining us today. I'm here to discuss the latest developments in our industry..."
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Storytelling Practice</h4>
                  <p className="text-xs text-gray-600">
                    "Let me tell you about a time when everything changed. It was a moment that would define..."
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* AI Feedback */}
            {showFeedback && analysisData && <AIFeedback analysisData={analysisData} />}
          </div>
        </div>
      </div>
    </div>
  )
}
