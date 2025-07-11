"use client"

import { useState, useRef, useCallback, useEffect } from "react"

interface AudioAnalysisData {
  frequencyData: Float32Array
  timeData: Float32Array
  fundamentalFreq: number
  spectralCentroid: number
  spectralRolloff: number
  zeroCrossingRate: number
  rms: number
}

export function useRealTimeAudio() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisData, setAnalysisData] = useState<AudioAnalysisData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number>()

  const startAnalysis = useCallback(async () => {
    try {
      setError(null)

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      })

      streamRef.current = stream

      // Create audio context
      audioContextRef.current = new AudioContext({ sampleRate: 44100 })
      const source = audioContextRef.current.createMediaStreamSource(stream)

      // Create analyser
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 4096
      analyserRef.current.smoothingTimeConstant = 0.8
      analyserRef.current.minDecibels = -90
      analyserRef.current.maxDecibels = -10

      source.connect(analyserRef.current)

      setIsAnalyzing(true)
      analyzeAudio()
    } catch (error) {
      console.error("Error starting audio analysis:", error)
      setError("Failed to access microphone. Please check permissions.")
    }
  }, [])

  const stopAnalysis = useCallback(() => {
    setIsAnalyzing(false)

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
  }, [])

  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current || !isAnalyzing) return

    const bufferLength = analyserRef.current.frequencyBinCount
    const frequencyData = new Float32Array(bufferLength)
    const timeData = new Float32Array(bufferLength)

    analyserRef.current.getFloatFrequencyData(frequencyData)
    analyserRef.current.getFloatTimeDomainData(timeData)

    // Calculate fundamental frequency using autocorrelation
    const fundamentalFreq = calculateFundamentalFrequency(timeData, 44100)

    // Calculate spectral features
    const spectralCentroid = calculateSpectralCentroid(frequencyData, 44100)
    const spectralRolloff = calculateSpectralRolloff(frequencyData, 44100)
    const zeroCrossingRate = calculateZeroCrossingRate(timeData)
    const rms = calculateRMS(timeData)

    setAnalysisData({
      frequencyData: frequencyData.slice(),
      timeData: timeData.slice(),
      fundamentalFreq,
      spectralCentroid,
      spectralRolloff,
      zeroCrossingRate,
      rms,
    })

    animationRef.current = requestAnimationFrame(analyzeAudio)
  }, [isAnalyzing])

  useEffect(() => {
    return () => {
      stopAnalysis()
    }
  }, [stopAnalysis])

  return {
    startAnalysis,
    stopAnalysis,
    isAnalyzing,
    analysisData,
    error,
  }
}

// Audio analysis utility functions
function calculateFundamentalFrequency(timeData: Float32Array, sampleRate: number): number {
  const minPeriod = Math.floor(sampleRate / 800) // 800 Hz max
  const maxPeriod = Math.floor(sampleRate / 80) // 80 Hz min

  let bestCorrelation = 0
  let bestPeriod = 0

  // Autocorrelation
  for (let period = minPeriod; period < maxPeriod; period++) {
    let correlation = 0
    for (let i = 0; i < timeData.length - period; i++) {
      correlation += timeData[i] * timeData[i + period]
    }

    if (correlation > bestCorrelation) {
      bestCorrelation = correlation
      bestPeriod = period
    }
  }

  return bestPeriod > 0 ? sampleRate / bestPeriod : 0
}

function calculateSpectralCentroid(frequencyData: Float32Array, sampleRate: number): number {
  let numerator = 0
  let denominator = 0

  for (let i = 0; i < frequencyData.length; i++) {
    const magnitude = Math.pow(10, frequencyData[i] / 20) // Convert dB to linear
    const frequency = (i * sampleRate) / (2 * frequencyData.length)

    numerator += frequency * magnitude
    denominator += magnitude
  }

  return denominator > 0 ? numerator / denominator : 0
}

function calculateSpectralRolloff(frequencyData: Float32Array, sampleRate: number): number {
  const magnitudes = frequencyData.map((db) => Math.pow(10, db / 20))
  const totalEnergy = magnitudes.reduce((sum, mag) => sum + mag, 0)
  const threshold = totalEnergy * 0.85 // 85% rolloff

  let cumulativeEnergy = 0
  for (let i = 0; i < magnitudes.length; i++) {
    cumulativeEnergy += magnitudes[i]
    if (cumulativeEnergy >= threshold) {
      return (i * sampleRate) / (2 * frequencyData.length)
    }
  }

  return sampleRate / 2
}

function calculateZeroCrossingRate(timeData: Float32Array): number {
  let crossings = 0
  for (let i = 1; i < timeData.length; i++) {
    if (timeData[i] >= 0 !== timeData[i - 1] >= 0) {
      crossings++
    }
  }
  return crossings / timeData.length
}

function calculateRMS(timeData: Float32Array): number {
  let sum = 0
  for (let i = 0; i < timeData.length; i++) {
    sum += timeData[i] * timeData[i]
  }
  return Math.sqrt(sum / timeData.length)
}
