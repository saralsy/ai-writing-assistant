import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { command, text, customInstructions, temperature, writingType } =
      await req.json();

    if (!command || !text) {
      return new Response("Command and text are required", { status: 400 });
    }

    // Create the system prompt based on the command
    let systemPrompt = `You are an expert writing assistant specializing in ${
      writingType || "general"
    } writing.`;
    let userPrompt = "";

    switch (command) {
      case "rewrite":
        systemPrompt +=
          " Rewrite the provided text to improve clarity and flow while maintaining the original meaning.";
        userPrompt = `Rewrite this text:\n\n${text}\n\nProvide only the rewritten text without explanations.`;
        break;
      case "expand":
        systemPrompt +=
          " Expand on the provided text with additional relevant details and insights.";
        userPrompt = `Expand on this text:\n\n${text}\n\nProvide only the expansion without explanations.`;
        break;
      case "summarize":
        systemPrompt +=
          " Summarize the provided text concisely while capturing the key points.";
        userPrompt = `Summarize this text:\n\n${text}\n\nProvide only the summary without explanations.`;
        break;
      default:
        return new Response(`Unknown command: ${command}`, { status: 400 });
    }

    if (customInstructions) {
      systemPrompt += ` ${customInstructions}`;
    }

    // Call Anthropic's Claude API
    const response = await streamText({
      model: anthropic("claude-3-sonnet-20240229"),
      maxTokens: 2000,
      temperature: temperature || 0.7,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    // Extract the result from the response
    return response.toTextStreamResponse();
  } catch (error) {
    console.error("AI Command API Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to execute command" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
