"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Key, Eye, EyeOff, CheckCircle, ExternalLink, Shield, Zap } from "lucide-react"
import { useApiKey } from "@/hooks/use-api-key"
import { toast } from "@/hooks/use-toast"

interface ApiKeySetupProps {
  onComplete: () => void
}

export function ApiKeySetup({ onComplete }: ApiKeySetupProps) {
  const [apiKey, setApiKey] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const { saveApiKey, validateApiKey, usageStats } = useApiKey()

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Gemini API key",
        variant: "destructive",
      })
      return
    }

    // Basic format validation
    if (apiKey.length < 20 || (!apiKey.startsWith("AIza") && !apiKey.includes("gemini"))) {
      toast({
        title: "Invalid Format",
        description: "Please enter a valid Gemini API key",
        variant: "destructive",
      })
      return
    }

    setIsValidating(true)

    try {
      const isValid = await validateApiKey(apiKey.trim())

      if (isValid) {
        await saveApiKey(apiKey.trim())
        toast({
          title: "API Key Saved Successfully",
          description: "Your Gemini API key has been securely encrypted and validated.",
        })
        onComplete()
      } else {
        toast({
          title: "Invalid API Key",
          description: "The provided API key is not valid. Please check and try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Validation Failed",
        description: "Unable to validate API key. Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleSkip = () => {
    toast({
      title: "Limited Functionality",
      description: "AI features will be unavailable without an API key. You can configure it later in settings.",
      variant: "destructive",
    })
    onComplete()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Setup Gemini AI Integration</CardTitle>
          <CardDescription className="text-base">
            Unlock the full power of VocalMaster AI with personalized coaching and real-time feedback powered by
            Google's Gemini AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enhanced Benefits */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              AI-Powered Features You'll Unlock:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Personalized voice coaching from AI personas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Real-time voice analysis with AI feedback</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Advanced speech pattern recognition</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Customized improvement recommendations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Celebrity voice coach simulations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Intelligent practice session planning</span>
              </div>
            </div>
          </div>

          {/* API Key Input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">Gemini API Key</Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key (AIzaSy...)"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {apiKey && (
                <div className="text-xs text-gray-600">
                  Key format: {apiKey.startsWith("AIza") ? "✓ Valid format" : "⚠ Check format"}
                </div>
              )}
            </div>

            {/* Enhanced Security Notice */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-800">Enterprise-Grade Security</p>
                  <p className="text-green-700 mt-1">
                    Your API key is encrypted using AES-256-GCM with PBKDF2 key derivation and stored locally in your
                    browser. It never leaves your device unencrypted and is only used for direct communication with
                    Google's Gemini API.
                  </p>
                </div>
              </div>
            </div>

            {/* Usage Tracking */}
            {usageStats && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Usage Tracking</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Daily Requests</span>
                    <span>{usageStats.dailyRequests}/100</span>
                  </div>
                  <Progress value={(usageStats.dailyRequests / 100) * 100} className="h-2" />
                  <p className="text-xs text-blue-600">Free tier includes 100 requests per day. Resets daily.</p>
                </div>
              </div>
            )}
          </div>

          {/* Get API Key */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Don't have an API key?</h3>
            <p className="text-sm text-gray-600 mb-3">
              Get your free Gemini API key from Google AI Studio. It includes generous free usage limits perfect for
              voice training.
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Get Free API Key
              </a>
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={isValidating} className="flex-1">
              {isValidating ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Validating...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Save & Validate
                </>
              )}
            </Button>
            <Button onClick={handleSkip} variant="outline">
              Skip for Now
            </Button>
          </div>

          {/* Models Info */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">Supported AI Models:</p>
            <div className="flex justify-center gap-2">
              <Badge variant="secondary">gemini-1.5-flash</Badge>
              <Badge variant="secondary">gemini-1.5-pro</Badge>
              <Badge variant="secondary">gemini-1.0-pro</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
