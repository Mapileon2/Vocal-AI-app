"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, FileAudio, ArrowLeft, Trash2, Play } from "lucide-react"
import Link from "next/link"
import { useDropzone } from "react-dropzone"
import { VoiceAnalysis } from "@/components/voice-analysis"
import { AIFeedback } from "@/components/ai-feedback"
import { useVoiceAnalysis } from "@/hooks/use-voice-analysis"
import { toast } from "@/hooks/use-toast"

export default function ImportPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const { analysisData, isAnalyzing, analyzeAudio, error } = useVoiceAnalysis()
  const [showFeedback, setShowFeedback] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      // Validate file type and size
      if (!file.type.includes("audio")) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a valid audio file (.wav, .mp3, .m4a, etc.)",
          variant: "destructive",
        })
        return
      }

      if (file.size > 50 * 1024 * 1024) {
        // 50MB limit
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 50MB",
          variant: "destructive",
        })
        return
      }

      setUploadedFile(file)
      const url = URL.createObjectURL(file)
      setAudioUrl(url)

      toast({
        title: "File Uploaded",
        description: `${file.name} is ready for analysis`,
      })
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".wav", ".mp3", ".m4a", ".ogg", ".flac"],
    },
    multiple: false,
  })

  const handleAnalyze = async () => {
    if (!uploadedFile) return

    try {
      const result = await analyzeAudio(uploadedFile)
      if (result) {
        setShowFeedback(true)
        toast({
          title: "Analysis Complete",
          description: "Your audio analysis is ready with AI feedback.",
        })
      }
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your audio file. Please try again.",
        variant: "destructive",
      })
    }
  }

  const playAudio = () => {
    if (!audioUrl) return

    const audio = new Audio(audioUrl)
    audio.play()
    setIsPlaying(true)

    audio.onended = () => setIsPlaying(false)
    audio.onerror = () => {
      setIsPlaying(false)
      toast({
        title: "Playback Error",
        description: "Unable to play the audio file",
        variant: "destructive",
      })
    }
  }

  const clearFile = () => {
    setUploadedFile(null)
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    setShowFeedback(false)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-6">
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
            <h1 className="text-2xl font-bold text-gray-900">Audio Import & Analysis</h1>
            <p className="text-gray-600">Upload and analyze your existing audio recordings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Audio Upload
                </CardTitle>
                <CardDescription>
                  Upload your audio files (.wav, .mp3, .m4a) for professional voice analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload Area */}
                {!uploadedFile ? (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <FileAudio className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    {isDragActive ? (
                      <p className="text-blue-600 font-medium">Drop your audio file here...</p>
                    ) : (
                      <>
                        <p className="text-gray-600 font-medium mb-2">
                          Drag & drop your audio file here, or click to browse
                        </p>
                        <p className="text-sm text-gray-500">Supports .wav, .mp3, .m4a, .ogg, .flac (max 50MB)</p>
                      </>
                    )}
                  </div>
                ) : (
                  /* File Info */
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <FileAudio className="w-8 h-8 text-blue-600" />
                        <div>
                          <h3 className="font-medium">{uploadedFile.name}</h3>
                          <p className="text-sm text-gray-600">
                            {formatFileSize(uploadedFile.size)} • {uploadedFile.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={playAudio} variant="outline" size="sm" disabled={isPlaying}>
                          <Play className="w-4 h-4 mr-1" />
                          {isPlaying ? "Playing..." : "Play"}
                        </Button>
                        <Button onClick={clearFile} variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Analysis Button */}
                    {!isAnalyzing && (
                      <Button onClick={handleAnalyze} size="lg" className="w-full bg-purple-600 hover:bg-purple-700">
                        <Upload className="w-5 h-5 mr-2" />
                        Analyze with AI
                      </Button>
                    )}

                    {isAnalyzing && (
                      <div className="text-center py-4">
                        <Badge variant="default" className="animate-pulse">
                          Analyzing audio with AI...
                        </Badge>
                        <p className="text-sm text-gray-600 mt-2">This may take a few moments</p>
                      </div>
                    )}
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
            {/* Supported Formats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Supported Formats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">.wav</span>
                    <Badge variant="secondary">Recommended</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">.mp3</span>
                    <Badge variant="outline">Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">.m4a</span>
                    <Badge variant="outline">Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">.ogg</span>
                    <Badge variant="outline">Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">.flac</span>
                    <Badge variant="outline">Supported</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <span>Use .wav format for highest quality analysis</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <span>Ensure clear audio with minimal background noise</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <span>30-120 seconds of speech works best</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <span>Maximum file size: 50MB</span>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Analysis Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span>FFT frequency analysis</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span>Formant detection and visualization</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span>Pitch stability (jitter/shimmer)</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span>AI-powered coaching feedback</span>
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
