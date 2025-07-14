import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Mic, Play, Upload, Target, Trophy, Clock, ChevronRight } from "lucide-react";
import RealTimeEvaluation from './accent-learning/RealTimeEvaluation';
import AccentScenes from './accent-learning/AccentScenes';
import ProgressTracker from './accent-learning/ProgressTracker';
import CustomMode from './accent-learning/CustomMode';
import { BookUploadConverter } from '@/components/BookUploadConverter';

// Enhanced scene data with phonetic challenges
const accentScenes = [
  {
    id: "startup-pitch",
    title: "Startup Pitch",
    description: "Practice confident, fast-paced presentation speech",
    difficulty: "Advanced",
    phonemes: ["ɜː", "ɑː", "tʃ", "dʒ"],
    sample: "We're disrupting the market with innovative solutions"
  },
  {
    id: "romantic-monologue",
    title: "Romantic Monologue",
    description: "Master emotional intonation and softer sounds",
    difficulty: "Intermediate",
    phonemes: ["əʊ", "ɪə", "ʒ", "ɔː"],
    sample: "I've never felt this way about anyone before"
  },
  {
    id: "news-anchor",
    title: "News Anchor Readout",
    description: "Perfect clear, neutral pronunciation",
    difficulty: "Beginner",
    phonemes: ["θ", "ð", "ɒ", "ɜː"],
    sample: "Breaking news from the nation's capital"
  },
  {
    id: "call-center",
    title: "Call Center Simulation",
    description: "Professional, patient communication style",
    difficulty: "Intermediate",
    phonemes: ["eə", "ɪ", "ʌ", "æ"],
    sample: "Thank you for calling, how may I assist you?"
  }
];

const AccentLearning = () => {
  const [selectedAccent, setSelectedAccent] = useState<string | null>(null);
  const [selectedScene, setSelectedScene] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("scenes");
  const [userProgress, setUserProgress] = useState({
    totalSessions: 0,
    currentStreak: 0,
    phonemeMastery: {
      "ɜː": 75,
      "ɑː": 60,
      "tʃ": 85,
      "dʒ": 70
    }
  });

  const handleStartScene = (sceneId: string) => {
    setSelectedScene(sceneId);
    const scene = accentScenes.find(s => s.id === sceneId);
    if (scene) {
      setCurrentLesson({
        type: "scene",
        content: scene
      });
    }
  };

  const handleRecordScene = async (sceneId: string) => {
    console.log(`Recording ${sceneId}...`);
    // Integration with RealTimeEvaluation
    setActiveTab("realtime");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">🎭 Accent Training Studio</h1>
        <p className="text-gray-600">Master US/UK accents with interactive scenes and real-time feedback</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="scenes">Scenes</TabsTrigger>
          <TabsTrigger value="realtime">Live Practice</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="custom">Custom Mode</TabsTrigger>
          <TabsTrigger value="books">Book Converter</TabsTrigger>
        </TabsList>

        {/* Accent Scenes Tab */}
        <TabsContent value="scenes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Accent Scenes & Challenges
              </CardTitle>
              <CardDescription>
                Practice with realistic scenarios designed for accent improvement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accentScenes.map((scene) => (
                  <Card key={scene.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{scene.title}</h3>
                          <p className="text-sm text-gray-600">{scene.description}</p>
                        </div>
                        <Badge variant={scene.difficulty === "Beginner" ? "default" : "secondary"}>
                          {scene.difficulty}
                        </Badge>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-2">Key phonemes:</p>
                        <div className="flex gap-1 flex-wrap">
                          {scene.phonemes.map(phoneme => (
                            <Badge key={phoneme} variant="outline" className="text-xs">
                              /{phoneme}/
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="mb-3 p-2 bg-gray-50 rounded">
                        <p className="text-sm italic">"{scene.sample}"</p>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleStartScene(scene.id)}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Start Scene
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRecordScene(scene.id)}
                        >
                          <Mic className="w-4 h-4 mr-1" />
                          Practice
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Real-Time Evaluation Tab */}
        <TabsContent value="realtime">
          <RealTimeEvaluation 
            selectedAccent={selectedAccent}
            currentScene={currentLesson?.type === "scene" ? currentLesson.content : null}
          />
        </TabsContent>

        {/* Progress Tracker Tab */}
        <TabsContent value="progress">
          <ProgressTracker 
            userProgress={userProgress}
            selectedAccent={selectedAccent}
          />
        </TabsContent>

        {/* Custom Mode Tab */}
        <TabsContent value="custom">
          <CustomMode 
            selectedAccent={selectedAccent}
            onUploadComplete={(sample) => console.log("Custom sample uploaded:", sample)}
          />
        </TabsContent>

        {/* Book Converter Tab */}
        <TabsContent value="books">
          <BookUploadConverter />
        </TabsContent>
      </Tabs>

      {/* Floating Progress Bar */}
      <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border">
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <div>
            <p className="text-sm font-medium">{userProgress.currentStreak} day streak</p>
            <Progress value={60} className="w-20 h-2" />
          </div>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default AccentLearning;