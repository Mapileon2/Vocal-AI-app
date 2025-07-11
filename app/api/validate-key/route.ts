import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required", valid: false }, { status: 400 })
    }

    // Enhanced validation - check format first
    if (apiKey.length < 20 || (!apiKey.startsWith("AIza") && !apiKey.includes("gemini"))) {
      return NextResponse.json({ error: "Invalid API key format", valid: false }, { status: 400 })
    }

    // Test the API key with a minimal request to Gemini
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
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
                  text: "Hello",
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: 10,
          },
        }),
      },
    )

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({
        valid: true,
        model: "gemini-1.5-flash",
        usage: data.usageMetadata || null,
      })
    } else {
      const errorData = await response.json()
      console.error("API key validation failed:", errorData)

      if (response.status === 401) {
        return NextResponse.json({ error: "Invalid API key", valid: false }, { status: 401 })
      } else if (response.status === 429) {
        return NextResponse.json({ error: "Rate limit exceeded", valid: false }, { status: 429 })
      } else {
        return NextResponse.json({ error: "API key validation failed", valid: false }, { status: 400 })
      }
    }
  } catch (error) {
    console.error("API key validation error:", error)
    return NextResponse.json(
      {
        error: "Validation service unavailable",
        valid: false,
      },
      { status: 500 },
    )
  }
}
