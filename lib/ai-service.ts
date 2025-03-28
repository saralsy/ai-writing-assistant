interface AIServiceOptions {
  temperature: number;
  writingType: string;
}

export async function getAISuggestion(
  contextText: string,
  options: AIServiceOptions
) {
  try {
    const prompt = `Continue the following text with a suggestion. Return ONLY the new content, not the original text: "${contextText}"`;

    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        temperature: options.temperature,
        writingType: options.writingType,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get AI suggestion");
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
  content: string,
  customInstructions: string,
  options: AIServiceOptions
) {
  try {
    const prompt = `${command} the following text: "${content} ${customInstructions}"`;

    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        temperature: options.temperature,
        writingType: options.writingType,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to process command");
    }

    const result = await response.json();
    return result.text || result;
  } catch (error) {
    console.error("Error processing command:", error);
    throw error;
  }
}
