"use server";
import { type NextRequest, NextResponse } from "next/server"
import { writeFile, unlink } from "fs/promises"
import { join } from "path"
import { tmpdir } from "os"

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null

  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    console.log("Audio file received:", audioFile);
    if (audioFile) {
      console.log("Audio file size:", audioFile.size);
      console.log("Audio file type:", audioFile.type);
    }

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    // Validate file size (50MB limit)
    if (audioFile.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum size is 50MB." }, { status: 400 })
    }

    // Validate file type
    if (!audioFile.type.includes("audio") && !audioFile.name.includes(".webm")) {
      return NextResponse.json({ error: "Invalid file type. Please upload an audio file." }, { status: 400 })
    }

    // Create temporary file
    const audioBuffer = await audioFile.arrayBuffer()
    const tempFileName = `audio_${Date.now()}_${Math.random().toString(36).substring(7)}.webm`
    tempFilePath = join(tmpdir(), tempFileName)

    await writeFile(tempFilePath, Buffer.from(audioBuffer))

    // Run analysis
    const analysisData = await runAudioAnalysis(tempFilePath)

    if (analysisData.error) {
      return NextResponse.json({ error: analysisData.error }, { status: 500 })
    }

    return NextResponse.json(analysisData)
  } catch (error: any) {
    console.error("Voice analysis error:", error)

    // Return proper JSON error response
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Analysis failed. Please try again with a different audio file.",
      },
      { status: 500 },
    )
  } finally {
    // Clean up temporary file
    if (tempFilePath) {
      try {
        await unlink(tempFilePath)
      } catch (cleanupError) {
        console.error("Failed to clean up temp file:", cleanupError)
      }
    }
  }
}

async function runAudioAnalysis(filePath: string): Promise<any> {
  try {
    // Simulate processing time for realistic UX
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Generate realistic mock analysis data
    const mockAnalysis = generateAdvancedMockAnalysis()
    // return mockAnalysis

    // TODO: Uncomment the following code for production with Python integration
    return new Promise((resolve, reject) => {
      const { spawn } = require('child_process')
      const pythonProcess = spawn('python3', ['scripts/audio-analysis.py', filePath])
      
      let output = ''
      let errorOutput = ''
      
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString()
      })
      
      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString()
      })
      
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            console.log("Python script output:", output);
            const result = JSON.parse(output)
            resolve(result)
          } catch (parseError) {
            reject(new Error('Failed to parse analysis results'))
          }
        } else {
          reject(new Error(`Python analysis failed: ${errorOutput}`))
        }
      })
      
      pythonProcess.on('error', (error) => {
        reject(new Error(`Failed to start Python process: ${error.message}`))
      })
    })
  } catch (error: any) {
    console.error("Analysis error:", error)
    return { error: `Audio analysis failed: ${error.message || error}` }
  }
}

function generateAdvancedMockAnalysis() {
  // Generate realistic voice analysis data
  const baseFreq = 140 + Math.random() * 80 // 140-220 Hz range
  const jitter = Math.random() * 1.8 // 0-1.8% jitter
  const shimmer = Math.random() * 4.5 // 0-4.5% shimmer

  // Calculate clarity score based on jitter and shimmer
  const jitterScore = Math.max(0, 100 - jitter * 55)
  const shimmerScore = Math.max(0, 100 - shimmer * 22)
  const clarity = Math.round((jitterScore + shimmerScore) / 2)

  // Generate formants with realistic values
  const formants = [
    {
      freq: Math.round(700 + Math.random() * 300), // F1: 700-1000 Hz
      amplitude: Number((0.7 + Math.random() * 0.3).toFixed(2)),
    },
    {
      freq: Math.round(1200 + Math.random() * 400), // F2: 1200-1600 Hz
      amplitude: Number((0.5 + Math.random() * 0.3).toFixed(2)),
    },
    {
      freq: Math.round(2400 + Math.random() * 600), // F3: 2400-3000 Hz
      amplitude: Number((0.3 + Math.random() * 0.4).toFixed(2)),
    },
  ]

  // Generate realistic spectral data (frequency bins)
  const spectralData = Array.from({ length: 512 }, (_, i) => {
    // Simulate natural speech spectrum with formant peaks
    let value = Math.random() * 50 // Base noise floor

    // Add formant peaks
    formants.forEach((formant) => {
      const freqBin = (formant.freq / 8000) * 512 // Map to bin
      const distance = Math.abs(i - freqBin)
      if (distance < 20) {
        value += formant.amplitude * 200 * Math.exp(-distance / 10)
      }
    })

    // Add high-frequency rolloff
    const rolloffFactor = Math.exp(-i / 200)
    value *= rolloffFactor

    return Math.round(Math.min(255, value))
  })

  // Generate pitch contour
  const pitchContour = Array.from({ length: 100 }, (_, i) => {
    const variation = Math.sin(i * 0.1) * 15 + Math.sin(i * 0.03) * 8
    const noise = (Math.random() - 0.5) * 5
    return Number((baseFreq + variation + noise).toFixed(1))
  })

  return {
    fundamentalFreq: Math.round(baseFreq),
    jitter: Number(jitter.toFixed(2)),
    shimmer: Number(shimmer.toFixed(2)),
    clarityScore: clarity,
    formants,
    spectralData,
    pitchContour,
    recommendations: generateIntelligentRecommendations(baseFreq, jitter, shimmer, clarity),
    duration: Number((3 + Math.random() * 8).toFixed(1)),
    voicedPercentage: Number((75 + Math.random() * 20).toFixed(1)),
  }
}

function generateIntelligentRecommendations(pitch: number, jitter: number, shimmer: number, clarity: number): string[] {
  const recommendations = []

  // Pitch-based recommendations
  if (pitch < 130) {
    recommendations.push(
      "Your voice has a deep, authoritative quality. Practice pitch variation to add more expressiveness and prevent monotony.",
    )
  } else if (pitch > 200) {
    recommendations.push(
      "Your higher pitch conveys energy and approachability. Work on grounding your voice occasionally for more gravitas in serious moments.",
    )
  } else {
    recommendations.push(
      "Your pitch range is well-suited for professional communication. Focus on using strategic pitch changes to emphasize key points.",
    )
  }

  // Stability recommendations
  if (jitter > 1.2) {
    recommendations.push(
      "Your pitch shows some instability. Practice sustained vowel sounds (ah, eh, oh) for 30 seconds each to improve vocal cord coordination.",
    )
  } else if (jitter < 0.5) {
    recommendations.push(
      "Excellent pitch stability! Your voice shows professional-level control. Continue this consistency while adding more dynamic expression.",
    )
  }

  if (shimmer > 3.0) {
    recommendations.push(
      "Work on volume consistency through diaphragmatic breathing. Place one hand on your chest, one on your stomach - only the lower hand should move when breathing.",
      )
  } else if (shimmer < 1.5) {
    recommendations.push(
      "Great volume control! Your voice maintains steady amplitude. This consistency creates a trustworthy, professional impression.",
      )
  }

  // Clarity-based recommendations
  if (clarity < 65) {
    recommendations.push(
      "Focus on articulation clarity. Practice reading aloud with exaggerated consonants for 10 minutes daily, then gradually return to natural speech.",
      )
  } else if (clarity > 85) {
    recommendations.push(
      "Outstanding clarity! Your articulation is crisp and professional. Now focus on adding emotional color while maintaining this precision.",
      )
  } else {
    recommendations.push(
      "Good overall clarity with room for improvement. Practice tongue twisters and focus on crisp consonant endings.",
      )
  }

  // Always include a practice recommendation
  if (recommendations.length < 4) {
    recommendations.push(
      "Record yourself daily reading different types of content (news, stories, technical material) to build versatility and track improvement.",
      )
  }

  return recommendations.slice(0, 4) // Limit to 4 recommendations
}
