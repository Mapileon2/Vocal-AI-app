import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { apiKey, persona, analysisData, practiceText } = await request.json()

    if (!apiKey || !persona || !analysisData) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Sanitize practiceText to prevent injection attacks
    const sanitizedPracticeText = practiceText.replace(/<[^>]*>/g, '');

    // Create a detailed prompt for the persona
    const prompt = createPersonaPrompt(persona, analysisData, sanitizedPracticeText);

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${persona.model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Gemini API error:", errorData)
      return NextResponse.json({ error: "Failed to generate feedback" }, { status: response.status })
    }

    const data = await response.json()
    const feedback = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!feedback) {
      return NextResponse.json({ error: "No feedback generated" }, { status: 500 })
    }

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error("Persona feedback error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function createPersonaPrompt(persona: any, analysisData: any, practiceText: string): string {
  return `${persona.systemPrompt}

VOICE ANALYSIS DATA:
- Fundamental Frequency: ${analysisData.fundamentalFreq} Hz
- Pitch Stability (Jitter): ${analysisData.jitter.toFixed(2)}%
- Volume Stability (Shimmer): ${analysisData.shimmer.toFixed(2)}%
- Overall Clarity Score: ${analysisData.clarityScore}%
- Formant Frequencies: ${analysisData.formants.map((f: any) => `${f.freq}Hz`).join(", ")}

PRACTICE TEXT:
"${practiceText}"

COACHING TASK:
Analyze this voice performance and provide specific, actionable feedback in your characteristic style as ${persona.name}. Focus on:

1. What they did well (be encouraging and specific)
2. Areas for improvement based on the voice analysis data
3. Specific techniques they should practice
4. How to apply your signature vocal qualities to their delivery

Keep your feedback conversational, encouraging, and practical. Limit your response to 3-4 paragraphs. Remember to coach in the voice and style of ${persona.name}.`
}
