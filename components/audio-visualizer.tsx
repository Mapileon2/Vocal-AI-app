"use client"


import React from "react";
import { useEffect, useRef } from "react"

interface AudioVisualizerProps {
  audioData: number[]
  isRecording: boolean
}


interface AudioVisualizerProps {
  audioData: number[];
  isRecording: boolean;
}

function AudioVisualizerComponent({ audioData, isRecording }: AudioVisualizerProps) {
  console.log("AudioVisualizer rendered");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    console.log("AudioVisualizer useEffect - audioData:", audioData);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return

    // Set canvas size with device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, rect.width, rect.height)

    if (audioData.length === 0) {
      // Draw static waveform when not recording
      drawStaticWaveform(ctx, rect.width, rect.height)
      return
    }

    // Draw real-time frequency visualization
    drawFrequencyBars(ctx, audioData, rect.width, rect.height, isRecording)
  }, [audioData, isRecording])

  const drawStaticWaveform = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = "#4B5563"
    ctx.lineWidth = 2
    ctx.beginPath()

    const centerY = height / 2
    const points = 200

    for (let i = 0; i < points; i++) {
      const x = (i / points) * width
      const amplitude = Math.sin(i * 0.05) * 30 + Math.sin(i * 0.02) * 15
      const y = centerY + amplitude

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()

    // Add text overlay
    ctx.fillStyle = "#9CA3AF"
    ctx.font = "14px Inter, sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("Click 'Start Recording' to see live audio visualization", width / 2, height / 2 + 60)
  }

  const drawFrequencyBars = (
    ctx: CanvasRenderingContext2D,
    data: number[],
    width: number,
    height: number,
    isRecording: boolean,
  ) => {
    const barCount = Math.min(data.length, 128) // Limit bars for better visualization
    const barWidth = width / barCount
    const maxHeight = height - 40

    // Create gradient
    const gradient = ctx.createLinearGradient(0, height, 0, 0)
    if (isRecording) {
      gradient.addColorStop(0, "#3B82F6")
      gradient.addColorStop(0.5, "#60A5FA")
      gradient.addColorStop(1, "#93C5FD")
    } else {
      gradient.addColorStop(0, "#6B7280")
      gradient.addColorStop(0.5, "#9CA3AF")
      gradient.addColorStop(1, "#D1D5DB")
    }

    // Draw frequency bars
    for (let i = 0; i < barCount; i++) {
      const barHeight = (data[i] / 255) * maxHeight
      const x = i * barWidth
      const y = height - barHeight - 20

      // Add glow effect when recording
      if (isRecording && barHeight > 10) {
        ctx.shadowColor = "#3B82F6"
        ctx.shadowBlur = 10
      } else {
        ctx.shadowBlur = 0
      }

      ctx.fillStyle = gradient
      ctx.fillRect(x, y, barWidth - 1, barHeight)
    }

    // Draw frequency labels
    ctx.shadowBlur = 0
    ctx.fillStyle = "#9CA3AF"
    ctx.font = "12px Inter, sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("0 Hz", 10, height - 5)
    ctx.textAlign = "right"
    ctx.fillText("8 kHz", width - 10, height - 5)

    // Draw peak indicator
    const maxValue = Math.max(...data.slice(0, barCount))
    if (maxValue > 200) {
      ctx.fillStyle = isRecording ? "#EF4444" : "#9CA3AF"
      ctx.font = "12px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("PEAK", width / 2, 20)
    }
  }

  return (
    <div className="w-full h-48 bg-black rounded-lg overflow-hidden relative">
      <canvas ref={canvasRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />
      {isRecording && (
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            RECORDING
          </div>
        </div>
      )}
    </div>
  );
}

function areEqual(prevProps: AudioVisualizerProps, nextProps: AudioVisualizerProps) {
  if (prevProps.isRecording !== nextProps.isRecording) {
    return false;
  }

  if (prevProps.audioData.length !== nextProps.audioData.length) {
    return false;
  }

  for (let i = 0; i < prevProps.audioData.length; i++) {
    if (prevProps.audioData[i] !== nextProps.audioData[i]) {
      return false;
    }
  }

  return true;
}

export const AudioVisualizer = React.memo(AudioVisualizerComponent, areEqual);
