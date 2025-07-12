"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  Mic,
  FileAudio,
  Trophy,
  Target,
  TrendingUp,
  Users,
  Calendar,
  Zap,
  Key,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import AccentLearning from "@/components/AccentLearning";
import Link from "next/link"
import { useUserProgress } from "@/hooks/use-user-progress"
import { useApiKey } from "@/hooks/use-api-key"
import { ApiKeySetup } from "@/components/api-key-setup"

export default function Dashboard() {
  const { progress, loading: progressLoading } = useUserProgress()
  const { hasValidKey, loading: keyLoading, usageStats, clearApiKey } = useApiKey()
  const [showApiSetup, setShowApiSetup] = useState(false)

  useEffect(() => {
    // Only show API setup if not loading and no valid key
    if (!keyLoading && !hasValidKey) {
      setShowApiSetup(true)
    }
  }, [hasValidKey, keyLoading])

  // Show loading state while checking API key
  if (keyLoading || progressLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading VocalMaster AI...</p>
        </div>
      </div>
    )
  }

  // Show API setup if no valid key
  if (showApiSetup) {
    return <ApiKeySetup onComplete={() => setShowApiSetup(false)} />
  }

  const quickStats = [
    { label: "Clarity Score", value: `${progress?.clarityScore || 0}%`, change: "+12%", icon: Target },
    { label: "Avg. Pitch", value: `${progress?.avgPitch || 165} Hz`, change: "+5 Hz", icon: TrendingUp },
    { label: "Sessions", value: (progress?.totalSessions || 0).toString(), change: "+3", icon: Calendar },
    { label: "Streak", value: `${progress?.streak || 0} days`, change: "Active", icon: Zap },
  ]

  const recentBadges = [
    { name: "First Recording", icon: "🎤", earned: progress?.badges?.includes("first_recording") || false },
    { name: "Week Warrior", icon: "⚡", earned: progress?.badges?.includes("week_warrior") || false },
    { name: "Clarity Master", icon: "🎯", earned: progress?.badges?.includes("clarity_master") || false },
    { name: "Pitch Perfect", icon: "🎵", earned: progress?.badges?.includes("pitch_perfect") || false },
  ]

  const handleResetApiKey = () => {
    clearApiKey()
    setShowApiSetup(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">VocalMaster AI</h1>
            <p className="text-gray-600 mt-1">Master your voice with AI-powered coaching</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => setShowApiSetup(true)}>
              <Key className="w-4 h-4 mr-2" />
              API Settings
            </Button>
            {hasValidKey ? (
              <Badge variant="secondary" className="px-3 py-1">
                <Zap className="w-4 h-4 mr-1" />
                AI Enabled
              </Badge>
            ) : (
              <Badge variant="destructive" className="px-3 py-1">
                <AlertCircle className="w-4 h-4 mr-1" />
                AI Disabled
              </Badge>
            )}
            <Badge variant="secondary" className="px-3 py-1">
              <Trophy className="w-4 h-4 mr-1" />
              {progress?.streak || 0} Day Streak
            </Badge>
          </div>
        </div>

        {/* API Usage Status */}
        {hasValidKey && usageStats && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-green-800">AI Usage Today</h3>
                  <p className="text-sm text-green-600">
                    {usageStats.dailyRequests}/100 requests used • {100 - usageStats.dailyRequests} remaining
                  </p>
                </div>
                <div className="w-32">
                  <Progress value={(usageStats.dailyRequests / 100) * 100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No API Key Warning */}
        {!hasValidKey && (
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-800">AI Features Disabled</h3>
                  <p className="text-sm text-yellow-700">
                    Configure your Gemini API key to unlock personalized AI coaching and feedback.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setShowApiSetup(true)} size="sm">
                    Setup Now
                  </Button>
                  <Button onClick={handleResetApiKey} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-green-600">{stat.change}</p>
                  </div>
                  <stat.icon className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Practice Modules */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Practice Modules</CardTitle>
                <CardDescription>Choose your training focus for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/record">
                    <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200">
                      <CardContent className="p-6 text-center">
                        <Mic className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                        <h3 className="font-semibold mb-2">Voice Analysis</h3>
                        <p className="text-sm text-gray-600">Record and analyze your voice with AI feedback</p>
                        {hasValidKey && (
                          <Badge variant="secondary" className="mt-2">
                            AI Powered
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/teleprompter">
                    <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200">
                      <CardContent className="p-6 text-center">
                        <FileAudio className="w-12 h-12 text-green-600 mx-auto mb-3" />
                        <h3 className="font-semibold mb-2">Teleprompter</h3>
                        <p className="text-sm text-gray-600">Practice with scripts and AI pacing</p>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/personas">
                    <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200">
                      <CardContent className="p-6 text-center">
                        <Users className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                        <h3 className="font-semibold mb-2">AI Personas</h3>
                        <p className="text-sm text-gray-600">Learn from celebrity voice coaches</p>
                        {hasValidKey ? (
                          <Badge variant="secondary" className="mt-2">
                            AI Powered
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="mt-2">
                            Requires API Key
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/import">
                    <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200">
                      <CardContent className="p-6 text-center">
                        <Target className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                        <h3 className="font-semibold mb-2">Audio Import</h3>
                        <p className="text-sm text-gray-600">Analyze uploaded .wav files</p>
                        {hasValidKey && (
                          <Badge variant="secondary" className="mt-2">
                            AI Powered
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                  <AccentLearning />
                </div>
              </CardContent>
            </Card>
          </div>
