"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Play, Pause, RotateCcw, Settings, Upload, Mic, Download, Eye } from "lucide-react"
import Link from "next/link"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import { toast } from "@/hooks/use-toast"

const defaultScript = `Welcome to VocalMaster AI, the revolutionary platform that transforms how you master your voice.

Whether you're preparing for a presentation, perfecting your narration skills, or simply wanting to speak with more confidence, our AI-powered coaching system provides personalized feedback and guidance.

Our advanced analysis examines your pitch, clarity, pacing, and breath support in real-time, giving you the insights you need to improve.

With celebrity voice personas, interactive teleprompter training, and gamified learning experiences, VocalMaster AI makes voice training engaging and effective.

Start your journey to vocal mastery today and discover the power of your voice.`

const sampleScripts = {
  "product-demo": {
    title: "Product Demo",
    content: `Good morning everyone, and thank you for joining today's demonstration.

I'm excited to show you how our latest innovation can transform your workflow and boost productivity by up to 40%.

Let's start with the key features that make this solution unique in the marketplace.

First, our intuitive interface requires zero training time. You can start using it immediately.

Second, our AI-powered automation handles repetitive tasks, freeing you to focus on strategic work.

Finally, our robust security ensures your data remains protected at all times.

Now, let me show you exactly how this works in practice.`,
  },
  "news-report": {
    title: "News Report",
    content: `Good evening, I'm reporting live from downtown where thousands have gathered for today's historic announcement.

The atmosphere here is electric as community leaders prepare to unveil plans that will reshape our city's future.

Behind me, you can see the crowd has been growing steadily throughout the afternoon, with people from all walks of life coming together.

We've spoken with several attendees who express both excitement and cautious optimism about what's to come.

The announcement is expected to begin in just a few minutes, and we'll bring you live coverage as events unfold.

This is a developing story, and we'll continue to provide updates throughout the evening.`,
  },
  "presentation-intro": {
    title: "Presentation Opening",
    content: `Thank you for joining us today. I'm genuinely excited to share our latest findings with you.

Over the past six months, our team has been working tirelessly to solve one of the industry's most persistent challenges.

What we've discovered will not only change how we approach this problem, but it opens up entirely new possibilities we hadn't considered before.

Today, I'll walk you through our methodology, share our key insights, and demonstrate practical applications you can implement immediately.

By the end of this presentation, you'll have a clear roadmap for achieving similar results in your own organization.

Let's begin with the challenge that started this journey.`,
  },
}

export default function TeleprompterPage() {
  const [script, setScript] = useState(defaultScript)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState([50])
  const [fontSize, setFontSize] = useState([24])
  const [currentPosition, setCurrentPosition] = useState(0)
  const [highlightMode, setHighlightMode] = useState<"line" | "word" | "none">("line")
  const [theme, setTheme] = useState<"dark" | "light">("dark")

  const { isRecording, recordedBlob, startRecording, stopRecording, clearRecording } = useAudioRecorder()

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const startScrolling = () => {
    if (isPlaying) {
      // Pause
      setIsPlaying(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    } else {
      // Play
      setIsPlaying(true)
      const scrollSpeed = speed[0] * 2

      intervalRef.current = setInterval(() => {
        if (scrollContainerRef.current) {
          const container = scrollContainerRef.current
          const newPosition = container.scrollTop + scrollSpeed / 10

          if (newPosition >= container.scrollHeight - container.clientHeight) {
            // Reached the end
            setIsPlaying(false)
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
            }
            toast({
              title: "Script Complete",
              description: "You've reached the end of your script!",
            })
          } else {
            container.scrollTop = newPosition
            setCurrentPosition(newPosition)
          }
        }
      }, 100)
    }
  }

  const resetPosition = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0
      setCurrentPosition(0)
    }
    setIsPlaying(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const handleSpeedChange = (value: number[]) => {
    setSpeed(value)
    if (isPlaying) {
      // Restart with new speed
      startScrolling()
      startScrolling()
    }
  }

  const toggleRecording = async () => {
    if (isRecording) {
      const blob = await stopRecording()
      if (blob) {
        toast({
          title: "Recording Complete",
          description: "Your teleprompter session has been recorded successfully.",
        })
      }
    } else {
      startRecording()
      toast({
        title: "Recording Started",
        description: "Practice with the teleprompter while recording your performance.",
      })
    }
  }

  const loadSampleScript = (scriptKey: string) => {
    const sampleScript = sampleScripts[scriptKey as keyof typeof sampleScripts]
    if (sampleScript) {
      setScript(sampleScript.content)
      resetPosition()
      toast({
        title: "Script Loaded",
        description: `${sampleScript.title} script has been loaded.`,
      })
    }
  }

  const downloadRecording = () => {
    if (!recordedBlob) return

    const url = URL.createObjectURL(recordedBlob)
    const a = document.createElement("a")
    a.href = url
    a.download = `teleprompter-session-${new Date().toISOString().slice(0, 19)}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const words = script.split(" ")
  const wordsPerLine = Math.max(6, Math.floor(fontSize[0] / 3))
  const lines = []
  for (let i = 0; i < words.length; i += wordsPerLine) {
    lines.push(words.slice(i, i + wordsPerLine).join(" "))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Professional Teleprompter</h1>
            <p className="text-gray-600">Advanced teleprompter with AI-powered features and recording</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Playback Controls */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Playback</h4>
                  <div className="flex gap-2">
                    <Button
                      onClick={startScrolling}
                      variant={isPlaying ? "secondary" : "default"}
                      size="sm"
                      className="flex-1"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4 mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-1" />
                          Play
                        </>
                      )}
                    </Button>
                    <Button onClick={resetPosition} variant="outline" size="sm">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Speed Control */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm">Speed</h4>
                    <Badge variant="outline">{speed[0]}%</Badge>
                  </div>
                  <Slider
                    value={speed}
                    onValueChange={handleSpeedChange}
                    max={100}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Font Size */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm">Font Size</h4>
                    <Badge variant="outline">{fontSize[0]}px</Badge>
                  </div>
                  <Slider value={fontSize} onValueChange={setFontSize} max={48} min={16} step={2} className="w-full" />
                </div>

                {/* Display Options */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Display</h4>
                  <div className="space-y-2">
                    <Select value={highlightMode} onValueChange={(value: any) => setHighlightMode(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Highlight mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="line">Line Highlight</SelectItem>
                        <SelectItem value="word">Word Highlight</SelectItem>
                        <SelectItem value="none">No Highlight</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={theme} onValueChange={(value: any) => setTheme(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Dark Theme</SelectItem>
                        <SelectItem value="light">Light Theme</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Recording */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Recording</h4>
                  <Button
                    onClick={toggleRecording}
                    variant={isRecording ? "destructive" : "outline"}
                    size="sm"
                    className="w-full"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    {isRecording ? "Stop Recording" : "Start Recording"}
                  </Button>
                  {isRecording && (
                    <Badge variant="destructive" className="w-full justify-center animate-pulse">
                      Recording in progress...
                    </Badge>
                  )}
                  {recordedBlob && (
                    <div className="flex gap-2">
                      <Button onClick={downloadRecording} variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      <Button onClick={clearRecording} variant="outline" size="sm">
                        Clear
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Script Library */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Script Library</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Script
                </Button>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Sample Scripts</h4>
                  <div className="space-y-1">
                    {Object.entries(sampleScripts).map(([key, script]) => (
                      <Button
                        key={key}
                        onClick={() => loadSampleScript(key)}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs"
                      >
                        {script.title}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Teleprompter Display */}
          <div className="lg:col-span-3">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Teleprompter Display
                </CardTitle>
                <CardDescription>
                  Your script will scroll automatically. The highlighted area shows your current reading position.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-full p-0">
                <div
                  ref={scrollContainerRef}
                  className={`h-full overflow-hidden relative ${
                    theme === "dark" ? "bg-black text-white" : "bg-white text-black"
                  }`}
                  style={{ fontSize: `${fontSize[0]}px` }}
                >
                  {/* Highlight overlay */}
                  {highlightMode === "line" && (
                    <div className="absolute inset-x-0 top-1/2 h-16 bg-yellow-400 opacity-20 rounded transform -translate-y-1/2 pointer-events-none mx-8"></div>
                  )}

                  {/* Reading guide lines */}
                  <div className="absolute inset-x-8 top-1/2 border-t border-yellow-400 opacity-30 transform -translate-y-8 pointer-events-none"></div>
                  <div className="absolute inset-x-8 top-1/2 border-t border-yellow-400 opacity-30 transform translate-y-8 pointer-events-none"></div>

                  {/* Script content */}
                  <div className="p-8 space-y-6 leading-relaxed text-center">
                    {lines.map((line, index) => (
                      <div key={index} className="transition-all duration-300 min-h-[1.5em]">
                        {line}
                      </div>
                    ))}

                    {/* End marker */}
                    <div className="py-20 text-center opacity-50">
                      <div className="text-2xl mb-2">🎯</div>
                      <div className="text-lg">End of Script</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Script Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Script Editor</CardTitle>
            <CardDescription>
              Edit your script here. Changes will be reflected in the teleprompter above in real-time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="min-h-[200px] font-mono text-base leading-relaxed"
              placeholder="Enter your script here..."
            />
            <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
              <span>
                {script.split(" ").length} words • {Math.ceil(script.split(" ").length / 150)} min read time
              </span>
              <span>{lines.length} lines</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
