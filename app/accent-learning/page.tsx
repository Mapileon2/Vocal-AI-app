"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Target } from "lucide-react";
import AccentScenes from "@/components/accent-learning/AccentScenes";
import ProgressTracker from "@/components/accent-learning/ProgressTracker";
import CustomMode from "@/components/accent-learning/CustomMode";
import RealTimeEvaluation from "@/components/accent-learning/RealTimeEvaluation";
import Lesson from "@/components/accent-learning/Lesson";
import { BookUploadConverter } from "@/components/BookUploadConverter";

const accentOptions = [
  { name: "American", flag: "🇺🇸", audio: "" },
  { name: "British RP", flag: "🇬🇧", audio: "" },
  { name: "Australian", flag: "🇦🇺", audio: "" },
  { name: "French-English", flag: "🇫🇷", audio: "" },
  { name: "Indian Neutral", flag: "🇮🇳", audio: "" },
];

interface LessonType {
    lesson_id: string;
    accent_target: string;
    prompts: { type: string; text: string; audio_native: string; correct_phoneme: string; dictionary_lookup: boolean; }[];
}

interface Lessons {
    [key: string]: LessonType[];
}

const lessons: Lessons = {
    "American": [
        { lesson_id: "american_1", accent_target: "American", prompts: [{ type: "word", text: "schedule", audio_native: "", correct_phoneme: "/skedjuːl/", dictionary_lookup: true }] },
        { lesson_id: "american_2", accent_target: "American", prompts: [{ type: "phrase", text: "How are you?", audio_native: "", correct_phoneme: "", dictionary_lookup: false }] },
    ],
    "British RP": [
        { lesson_id: "british_1", accent_target: "British RP", prompts: [{ type: "word", text: "schedule", audio_native: "", correct_phoneme: "/\u0283\u025bdju\u02d0l/", dictionary_lookup: true }] },
        { lesson_id: "british_2", accent_target: "British RP", prompts: [{ type: "phrase", text: "How do you do?", audio_native: "", correct_phoneme: "", dictionary_lookup: false }] },
    ]
};

export default function AccentLearningPage() {
  const [selectedAccent, setSelectedAccent] = useState<string | null>(null);
    const [detectedAccent, setDetectedAccent] = useState<string | null>(null);
    const [currentLesson, setCurrentLesson] = useState<LessonType | null>(null);

  const handleAccentClick = (accent: string) => {
    setSelectedAccent(accent);
  };

  const handleRecordAndAnalyze = async () => {
    // TODO: Implement audio recording and analysis logic here
    console.log("Recording and analyzing audio...");
    const detected = await detectAccent();
    setDetectedAccent(detected);
  };

    const detectAccent = async () => {
        const accents = ["North American English", "British English", "Australian English", "Indian English"];
        const randomIndex = Math.floor(Math.random() * accents.length);
        return accents[randomIndex];
    }

    const handleStartLesson = (lessonId: string) => {
        // TODO: Implement lesson start logic
        console.log("Starting lesson:", lessonId);
        const lesson = lessons[selectedAccent!].find((lesson) => lesson.lesson_id === lessonId);
        if (lesson) {
            setCurrentLesson(lesson);
        }
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1>Accent Learning</h1>
        <div className="flex flex-wrap justify-center gap-4">
          {accentOptions.map((accent) => (
            <button key={accent.name} onClick={() => handleAccentClick(accent.name)} className="p-2 border rounded-md hover:bg-gray-100">
              {accent.flag} {accent.name}
            </button>
          ))}
        </div>
        {selectedAccent && <p>You have selected: {selectedAccent}</p>}
        <button onClick={handleRecordAndAnalyze}>Record and Analyze</button>
            {detectedAccent && <p>Detected Accent: {detectedAccent}</p>}
        {selectedAccent && (
            <div>
                <h2>Lessons</h2>
                <ul>
                    {lessons[selectedAccent]?.map((lesson) => (
                        <li key={lesson.lesson_id}>
                            <button onClick={() => handleStartLesson(lesson.lesson_id)}>
                                {lesson.lesson_id}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        )}
            <AccentScenes />
            <ProgressTracker />
            <CustomMode />
            <RealTimeEvaluation />
            <Lesson />
            <BookUploadConverter />
      </div>
    </div>
  );
}