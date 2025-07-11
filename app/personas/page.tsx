"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Mic, Star, MessageSquare, Sparkles } from "lucide-react"
import Link from "next/link"
import { usePersonaCoaching } from "@/hooks/use-persona-coaching"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import { toast } from "@/hooks/use-toast"

const personas = [
  {
    id: "morgan-freeman",
    name: "Morgan Freeman",
    specialty: "Narration & Gravitas",
    description: "Master the art of authoritative, warm narration with perfect pacing and resonance.",
    avatar: "🎭",
    color: "bg-amber-100 border-amber-200",
    available: true,
    model: "gemini-1.5-flash",
    systemPrompt: `You are Morgan Freeman, the legendary narrator and actor. Your coaching style is warm, authoritative, and deeply resonant. You focus on:
    - Deep, resonant voice projection from the chest
    - Measured, deliberate pacing with strategic pauses
    - Emotional storytelling that connects with the audience
    - Breath control and support for sustained delivery
    - The power of understatement and gravitas
    
    Provide specific, actionable feedback in Morgan Freeman's characteristic style - wise, encouraging, and profound.`,
    techniques: [
      "Deep resonant voice projection",
      "Measured, deliberate pacing",
      "Emotional storytelling",
      "Breath control mastery",
    ],
    sampleText:
      "In the depths of winter, I finally learned that within me there lay an invincible summer. The human spirit, much like the seasons, has its own rhythm of renewal and growth.",
  },
  {
    id: "obama",
    name: "Barack Obama",
    specialty: "Public Speaking & Charisma",
    description: "Learn the techniques of inspirational leadership communication and audience engagement.",
    avatar: "🎤",
    color: "bg-blue-100 border-blue-200",
    available: true,
    model: "gemini-1.5-pro",
    systemPrompt: `You are Barack Obama, former President and master of public speaking. Your coaching emphasizes:
    - Strategic pausing for emphasis and dramatic effect
    - Rising and falling intonation patterns
    - Conversational authority that builds trust
    - Crowd connection and engagement techniques
    - The rhythm of persuasive speech
    - Hope and inspiration in delivery
    
    Coach with the wisdom of a leader who has moved millions with words. Be encouraging, specific, and focus on the power of authentic connection.`,
    techniques: [
      "Strategic pausing for emphasis",
      "Rising and falling intonation",
      "Conversational authority",
      "Crowd connection techniques",
    ],
    sampleText:
      "Change will not come if we wait for some other person or some other time. We are the ones we've been waiting for. We are the change that we seek.",
  },
]

export default function PersonasPage() {
  const [selectedPersona, setSelectedPersona] = useState(personas[0])
  const { isRecording, recordedBlob, startRecording, stopRecording, clearRecording } = useAudioRecorder()
  const { getFeedback, isGenerating, feedback, error } = usePersonaCoaching()

  const handleStartPractice = async () => {
    if (isRecording) {
      const blob = await stopRecording()
      if (blob) {
        toast({
          title: "Recording Complete",
          description: "Your practice session is ready for AI feedback.",
        })
      }
    } else {
      startRecording()
      toast({
        title: "Recording Started",
        description: `Practice with ${selectedPersona.name}'s style and techniques.`,
      })
    }
  }

  const handleGetFeedback = async () => {
    if (!recordedBlob) return

    try {
      await getFeedback(recordedBlob, selectedPersona, selectedPersona.sampleText)
      toast({
        title: "AI Feedback Ready",
        description: `${selectedPersona.name} has analyzed your performance.`,
      })
    } catch (error) {
      toast({
        title: "Feedback Failed",
        description: "Unable to generate feedback. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
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
            <h1 className="text-2xl font-bold text-gray-900">AI Voice Personas</h1>
            <p className="text-gray-600">Learn from celebrity voice coaches powered by Gemini AI</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Persona Selection */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Choose Your Coach</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {personas.map((persona) => (
                  <Card
                    key={persona.id}
                    className={`cursor-pointer transition-all ${
                      selectedPersona.id === persona.id
                        ? "ring-2 ring-blue-500 " + persona.color
                        : persona.available
                          ? "hover:shadow-md " + persona.color
                          : "opacity-60 " + persona.color
                    }`}
                    onClick={() => persona.available && setSelectedPersona(persona)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{persona.avatar}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{persona.name}</h3>
                          <p className="text-xs text-gray-600">{persona.specialty}</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {persona.model}
                          </Badge>
                        </div>
                        {selectedPersona.id === persona.id && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Persona Details */}
            <Card className={selectedPersona.color}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{selectedPersona.avatar}</div>
                  <div>
                    <CardTitle className="text-xl">{selectedPersona.name}</CardTitle>
                    <CardDescription className="text-base">{selectedPersona.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Techniques */}
                  <div>
                    <h3 className="font-semibold mb-3">Key Techniques</h3>
                    <div className="space-y-2">
                      {selectedPersona.techniques.map((technique, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">{technique}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Practice Sample */}
                  <div>
                    <h3 className="font-semibold mb-3">Practice Sample</h3>
                    <div className="bg-white p-4 rounded-lg border">
                      <p className="text-sm italic mb-3">"{selectedPersona.sampleText}"</p>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleStartPractice}
                          size="sm"
                          className={isRecording ? "bg-red-600 hover:bg-red-700" : ""}
                        >
                          <Mic className="w-4 h-4 mr-1" />
                          {isRecording ? "Stop Recording" : "Practice Now"}
                        </Button>
                        {recordedBlob && (
                          <Button onClick={handleGetFeedback} size="sm" variant="outline" disabled={isGenerating}>
                            <Sparkles className="w-4 h-4 mr-1" />
                            {isGenerating ? "Getting Feedback..." : "Get AI Feedback"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Practice Session */}
            <Tabs defaultValue="practice" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="practice">Practice Session</TabsTrigger>
                <TabsTrigger value="feedback">AI Feedback</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
              </TabsList>

              <TabsContent value="practice" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Practice with {selectedPersona.name}</CardTitle>
                    <CardDescription>
                      Read the text below and try to match the vocal style and techniques
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-6 rounded-lg mb-4">
                      <p className="text-lg leading-relaxed">{selectedPersona.sampleText}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <Button
                        onClick={handleStartPractice}
                        disabled={isGenerating}
                        className={isRecording ? "bg-red-600 hover:bg-red-700" : ""}
                      >
                        <Mic className="w-4 h-4 mr-2" />
                        {isRecording ? "Stop Recording" : "Start Practice"}
                      </Button>

                      {recordedBlob && (
                        <>
                          <Button onClick={handleGetFeedback} disabled={isGenerating} variant="outline">
                            <Sparkles className="w-4 h-4 mr-2" />
                            {isGenerating ? "Analyzing..." : "Get AI Feedback"}
                          </Button>
                          <Button onClick={clearRecording} variant="outline" size="sm">
                            Clear Recording
                          </Button>
                        </>
                      )}
                    </div>

                    {isRecording && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium">Recording in progress...</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Speak clearly and try to match {selectedPersona.name}'s style
                        </p>
                      </div>
                    )}

                    {isGenerating && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full"></div>
                          <span className="text-sm font-medium">
                            {selectedPersona.name} is analyzing your performance...
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="feedback" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      AI Coaching Feedback from {selectedPersona.name}
                    </CardTitle>
                    <CardDescription>Personalized feedback powered by {selectedPersona.model}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {feedback ? (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                        <div className="prose prose-sm max-w-none">
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">{feedback}</div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Badge variant="secondary">{selectedPersona.name}</Badge>
                          <Badge variant="secondary">{selectedPersona.model}</Badge>
                          <Badge variant="secondary">AI Powered</Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>
                          Complete a practice session to receive personalized AI feedback from {selectedPersona.name}
                        </p>
                      </div>
                    )}

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                        <p className="text-red-800 text-sm">{error}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="progress" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Progress with {selectedPersona.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Vocal Resonance</span>
                          <span>72%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "72%" }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Pacing Control</span>
                          <span>85%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: "85%" }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Emotional Expression</span>
                          <span>58%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-600 h-2 rounded-full" style={{ width: "58%" }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
