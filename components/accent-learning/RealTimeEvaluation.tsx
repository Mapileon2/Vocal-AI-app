import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, StopCircle, Play, Target, Volume2 } from "lucide-react";
import { AudioVisualizer } from '../audio-visualizer';
import { useVoiceAnalysis } from '@/hooks/use-voice-analysis';

interface RealTimeEvaluationProps {
  selectedAccent?: string | null;
  currentScene?: any;
}

export const RealTimeEvaluation: React.FC<RealTimeEvaluationProps> = ({ 
  selectedAccent, 
  currentScene 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState(currentScene?.sample || "This is a test sentence for accent practice.");
  
  const { startRecording, stopRecording, analyzeAccent } = useVoiceAnalysis();

  const handleRecord = async () => {
    if (!isRecording) {
      setIsRecording(true);
      setFeedback(null);
      await startRecording();
    } else {
      setIsRecording(false);
      const result = await stopRecording();
      if (result && selectedAccent) {
        const analysis = await analyzeAccent(result.audioBlob, selectedAccent, currentPrompt);
        setFeedback(analysis.feedback);
        setAudioData(result.audioData);
      }
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Real-Time Accent Evaluation
          </CardTitle>
          <CardDescription>
            {currentScene 
              ? `Practicing: ${currentScene.title}` 
              : "Practice with standard accent prompts"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Prompt Display */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-lg font-medium text-center">{currentPrompt}</p>
            <div className="flex justify-center mt-2">
              <Button variant="ghost" size="sm">
                <Volume2 className="w-4 h-4 mr-1" />
                Hear Native
              </Button>
            </div>
          </div>

          {/* Recording Controls */}
          <div className="text-center">
            <Button 
              size="lg" 
              onClick={handleRecord}
              className={isRecording ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {isRecording ? (
                <>
                  <StopCircle className="w-5 h-5 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 mr-2" />
                  Start Recording
                </>
              )}
            </Button>
          </div>

          {/* Audio Visualizer */}
          <AudioVisualizer audioData={audioData} isRecording={isRecording} />
          {isRecording && (
            <div className="mt-4">
              <p className="text-sm text-center text-gray-500">Recording...</p>
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <Badge variant="secondary" className="mb-2">AI Feedback</Badge>
              <p className="text-sm">{feedback}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeEvaluation;