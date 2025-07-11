"use client"

import { useState, useRef, useCallback } from "react"

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioData, setAudioData] = useState<number[]>([])
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const animationRef = useRef<number>()

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      })

      streamRef.current = stream

      // Set up audio context for visualization
      audioContextRef.current = new AudioContext({ sampleRate: 44100 })
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 2048
      analyserRef.current.smoothingTimeConstant = 0.8
      source.connect(analyserRef.current)

      // Set up media recorder for high-quality recording
      const options = {
        mimeType: "audio/webm;codecs=opus",
        audioBitsPerSecond: 128000,
      }

      mediaRecorderRef.current = new MediaRecorder(stream, options)
      chunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        setRecordedBlob(blob)

        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
        }
      }

      mediaRecorderRef.current.start(100) // Collect data every 100ms
      setIsRecording(true)

      // Start visualization
      visualize()
    } catch (error) {
      console.error("Error starting recording:", error)
      throw error
    }
  }, [])

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" })
          setRecordedBlob(blob)

          // Clean up
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop())
          }
          if (audioContextRef.current) {
            audioContextRef.current.close()
          }
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current)
          }

          resolve(blob)
        }

        mediaRecorderRef.current.stop()
        setIsRecording(false)
      } else {
        resolve(null)
      }
    })
  }, [isRecording])

  const visualize = useCallback(() => {
    if (!analyserRef.current) return

    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      if (!analyserRef.current || !isRecording) return

      analyserRef.current.getByteFrequencyData(dataArray)
      setAudioData(Array.from(dataArray))

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()
  }, [isRecording])

  const playRecording = useCallback(() => {
    if (!recordedBlob) return

    const audio = new Audio(URL.createObjectURL(recordedBlob))
    audio.play()
    setIsPlaying(true)

    audio.onended = () => setIsPlaying(false)
    audio.onerror = () => setIsPlaying(false)
  }, [recordedBlob])

  const clearRecording = useCallback(() => {
    setRecordedBlob(null)
    setAudioData([])
    setIsPlaying(false)
  }, [])

  return {
    isRecording,
    isPlaying,
    audioData,
    recordedBlob,
    startRecording,
    stopRecording,
    playRecording,
    clearRecording,
  }
}
