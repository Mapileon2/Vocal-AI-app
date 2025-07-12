import React from 'react';
import { Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const AccentLearning = () => {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200">
      <CardContent className="p-6 text-center">
        <h1>Accent Learning</h1>
        <p>Select your target accent:</p>
        <div>
          <button>🇺🇸 American</button>
          <button>🇬🇧 British RP</button>
          <button>🇦🇺 Australian</button>
          <button>🇫🇷 French-English</button>
          <button>🇮🇳 Indian Neutral</button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccentLearning;