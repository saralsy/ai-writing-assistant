import { anthropic } from "@ai-sdk/anthropic";

interface AIServiceOptions {
  temperature: number;
  writingType: string;
}

export async function getAISuggestion(
  text: string,
  options: { temperature: number; writingType: string }
) {
  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: text,
        temperature: options.temperature,
        writingType: options.writingType,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.text();
    return data;
  } catch (error) {
    console.error("Error getting AI suggestion:", error);
    throw error;
  }
}

export async function executeAICommand(
  command: string,
  text: string,
  customInstructions: string,
  options: { temperature: number; writingType: string }
) {
  try {
    const response = await fetch("/api/command", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        command,
        text,
        customInstructions,
        temperature: options.temperature,
        writingType: options.writingType,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.text();
    return data;
  } catch (error) {
    console.error("Error executing AI command:", error);
    throw error;
  }
}

export async function enhanceText(
  text: string,
  writingType: string,
  customInstructions: string
) {
  try {
    const response = await fetch("/api/enhance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        writingType,
        customInstructions,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const enhancedText = await response.text();
    return enhancedText;
  } catch (error) {
    console.error("Error enhancing text:", error);
    throw error;
  }
}
