import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { prompt, writingType, temperature } = await req.json();

    if (!prompt) {
      return new Response("Prompt is required", { status: 400 });
    }

    // Format the prompt for continuation
    const formattedPrompt = preparePromptForContinuation(prompt);

    // Create a stream from Anthropic
    const response = streamText({
      model: anthropic("claude-3-sonnet-20240229"),
      messages: [
        {
          role: "system",
          content: `You are a writing assistant. When asked to continue text, provide only the new suggested text, NOT the original input. Keep suggestions concise and relevant to the context. Maintain consistent formatting with the input text - if the input ends without a space, begin your response without a space; if the input ends with a space, begin your response with the next word. If the input ends with a comma, period, or other punctuation, respect the appropriate spacing that would follow. You are writing in the style of ${writingType}.`,
        },
        {
          role: "user",
          content: formattedPrompt,
        },
      ],
      temperature: temperature || 0.7,
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

// Helper function to analyze and prepare the prompt for proper continuation
function preparePromptForContinuation(prompt: string): string {
  // This function could add explicit instructions to the prompt
  // For example: "Continue this text exactly from where it ends: {prompt}"
  // Or you could add hints about the current formatting

  const endsWithPunctuation = /[,.!?;:]$/.test(prompt);
  const endsWithSpace = /\s$/.test(prompt);

  let instructions = "Continue this text: ";

  if (endsWithPunctuation && !endsWithSpace) {
    instructions =
      "Continue this text (note it ends with punctuation without a space): ";
  } else if (!endsWithSpace) {
    instructions = "Continue this text (note it ends without a space): ";
  } else if (endsWithSpace) {
    instructions = "Continue this text (note it ends with a space): ";
  }

  return instructions + prompt;
}
