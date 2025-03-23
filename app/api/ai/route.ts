import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response("Prompt is required", { status: 400 });
    }

    // Create a stream from Anthropic
    const response = streamText({
      model: anthropic("claude-3-sonnet-20240229"),
      messages: [
        {
          role: "system",
          content:
            "You are a writing assistant. When asked to continue text, provide only the new suggested text, NOT the original input. Keep suggestions concise and relevant to the context.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      maxTokens: 150,
    });

    // Set the correct headers for text streaming
    return response.toTextStreamResponse();
  } catch (error) {
    console.error("AI API Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate AI response" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
