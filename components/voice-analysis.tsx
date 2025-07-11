"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Volume2, Zap, Activity } from "lucide-react"

interface VoiceAnalysisProps {
  data: {
    fundamentalFreq: number
    jitter: number
    shimmer: number
    clarityScore: number
    formants: Array<{ freq: number; amplitude: number }>
    recommendations: string[]
    spectralData?: number[]
    pitchContour?: number[]
  }
}

export function VoiceAnalysis({ data }: VoiceAnalysisProps) {
  console.log("VoiceAnalysis rendered");
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    return "Needs Work"
  }

  const getStabilityScore = (jitter: number, shimmer: number) => {
    const jitterScore = Math.max(0, 100 - jitter * 50)
    const shimmerScore = Math.max(0, 100 - shimmer * 20)
    return Math.round((jitterScore + shimmerScore) / 2)
  }

  const stabilityScore = getStabilityScore(data.jitter, data.shimmer)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Advanced Voice Analysis
        </CardTitle>
        <CardDescription>Comprehensive analysis using FFT and formant detection</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <div className={`text-4xl font-bold ${getScoreColor(data.clarityScore)}`}>{data.clarityScore}%</div>
            <p className="text-gray-600 mt-1">Clarity Score</p>
            <Badge variant="secondary" className="mt-2">
              {getScoreBadge(data.clarityScore)}
            </Badge>
          </div>

          <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
            <div className={`text-4xl font-bold ${getScoreColor(stabilityScore)}`}>{stabilityScore}%</div>
            <p className="text-gray-600 mt-1">Voice Stability</p>
            <Badge variant="secondary" className="mt-2">
              {getScoreBadge(stabilityScore)}
            </Badge>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Fundamental Frequency */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold">Pitch Analysis</h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{data.fundamentalFreq} Hz</div>
              <p className="text-sm text-gray-600 mt-1">
                {data.fundamentalFreq < 120
                  ? "Low pitch range"
                  : data.fundamentalFreq > 200
                    ? "High pitch range"
                    : "Normal pitch range"}
              </p>
              <div className="mt-2">
                <div className="text-xs text-gray-500 mb-1">Pitch Stability</div>
                <Progress value={Math.max(0, 100 - data.jitter * 50)} className="h-2" />
              </div>
            </div>
          </div>

          {/* Voice Quality */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-600" />
              <h3 className="font-semibold">Voice Quality</h3>
            </div>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between text-sm mb-1">
                  <span>Jitter</span>
                  <span>{data.jitter.toFixed(2)}%</span>
                </div>
                <Progress value={Math.max(0, 100 - data.jitter * 50)} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  {data.jitter < 1 ? "Excellent" : data.jitter < 2 ? "Good" : "Needs work"}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between text-sm mb-1">
                  <span>Shimmer</span>
                  <span>{data.shimmer.toFixed(2)}%</span>
                </div>
                <Progress value={Math.max(0, 100 - data.shimmer * 20)} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  {data.shimmer < 2 ? "Excellent" : data.shimmer < 4 ? "Good" : "Needs work"}
                </p>
              </div>
            </div>
          </div>

          {/* Formants */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-600" />
              <h3 className="font-semibold">Formant Analysis</h3>
            </div>
            <div className="space-y-2">
              {data.formants.map((formant, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">F{index + 1}</span>
                    <span className="text-sm">{formant.freq} Hz</span>
                  </div>
                  <Progress value={formant.amplitude * 100} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">{(formant.amplitude * 100).toFixed(0)}% strength</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Spectral Visualization */}
        {data.spectralData && (
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Frequency Spectrum
            </h3>
            <div className="bg-black rounded-lg p-4 h-32 relative overflow-hidden">
              <div className="flex items-end justify-center h-full gap-1">
                {data.spectralData.slice(0, 64).map((value, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t"
                    style={{
                      height: `${(value / 255) * 100}%`,
                      width: "3px",
                      minHeight: "2px",
                    }}
                  />
                ))}
              </div>
              <div className="absolute bottom-2 left-4 text-white text-xs">0 Hz</div>
              <div className="absolute bottom-2 right-4 text-white text-xs">8 kHz</div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="space-y-3">
          <h3 className="font-semibold">AI Recommendations</h3>
          <div className="space-y-2">
            {data.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
