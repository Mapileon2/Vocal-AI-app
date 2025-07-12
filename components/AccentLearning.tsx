import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Target } from "lucide-react";

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
        <div>
          <button onClick={() => handleAccentClick("American")}>🇺🇸 American</button>
          <button onClick={() => handleAccentClick("British RP")}>🇬🇧 British RP</button>
          <button onClick={() => handleAccentClick("Australian")}>🇦🇺 Australian</button>
          <button onClick={() => handleAccentClick("French-English")}>🇫🇷 French-English</button>
          <button onClick={() => handleAccentClick("Indian Neutral")}>🇮🇳 Indian Neutral</button>
        </div>
        {selectedAccent && <p>You have selected: {selectedAccent}</p>}
      </CardContent>
    </Card>
  );
};

export default AccentLearning;