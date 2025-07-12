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

const AccentLearning = () => {
  const [selectedAccent, setSelectedAccent] = useState<string | null>(null);

  const handleAccentClick = (accent: string) => {
    setSelectedAccent(accent);
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
      </CardContent>
    </Card>
  );
};

export default AccentLearning;