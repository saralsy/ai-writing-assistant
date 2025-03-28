import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { text, writingType, customInstructions } = await req.json();

    if (!text) {
      return new Response("Text is required", { status: 400 });
    }

    // Create the system prompt based on writing type and custom instructions
    let systemPrompt = `You are an expert writing assistant specializing in ${
      writingType || "general"
    } writing. 
    Enhance the provided text to improve clarity, flow, and impact while maintaining the original meaning and voice.`;

    if (customInstructions) {
      systemPrompt += ` ${customInstructions}`;
    }

    // Call Anthropic's Claude API
    const response = streamText({
      model: anthropic("claude-3-sonnet-20240229"),
      maxTokens: 4000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Enhance this text:\n\n${text}\n\nProvide only the enhanced text without explanations or additional comments.`,
        },
      ],
    });

    return response.toTextStreamResponse();
  } catch (error) {
    console.error("AI Enhance API Error:", error);
    return new Response(JSON.stringify({ error: "Failed to enhance text" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
