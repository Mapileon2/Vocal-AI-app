import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Target } from "lucide-react";

const accentOptions = [
  { name: "American", flag: "🇺🇸", audio: "" },
  { name: "British RP", flag: "🇬🇧", audio: "" },
  { name: "Australian", flag: "🇦🇺", audio: "" },
  { name: "French-English", flag: "🇫🇷", audio: "" },
  { name: "Indian Neutral", flag: "🇮🇳", audio: "" },
];

const lessons = {
    "American": [
        { lesson_id: "american_1", accent_target: "American", prompts: [{ type: "word", text: "schedule", audio_native: "", correct_phoneme: "/skedjuːl/", dictionary_lookup: true }] },
        { lesson_id: "american_2", accent_target: "American", prompts: [{ type: "phrase", text: "How are you?", audio_native: "", correct_phoneme: "", dictionary_lookup: false }] },
    ],
    "British RP": [
        { lesson_id: "british_1", accent_target: "British RP", prompts: [{ type: "word", text: "schedule", audio_native: "", correct_phoneme: "/\u0283\u025bdju\u02d0l/", dictionary_lookup: true }] },
        { lesson_id: "british_2", accent_target: "British RP", prompts: [{ type: "phrase", text: "How do you do?", audio_native: "", correct_phoneme: "", dictionary_lookup: false }] },
    ]
};

const AccentLearning = () => {
  const [selectedAccent, setSelectedAccent] = useState<string | null>(null);
    const [detectedAccent, setDetectedAccent] = useState<string | null>(null);

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
    };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200">
      <CardContent className="p-6 text-center">
        <h1>Accent Learning</h1>
        <p>Select your target accent:</p>
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
      </CardContent>
    </Card>
  );
};

export default AccentLearning;