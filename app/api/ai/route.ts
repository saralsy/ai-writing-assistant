import { streamText } from "ai";
import { modelOptions } from "@/lib/model-options";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { prompt, writingType, temperature, model, customInstructions } =
      await req.json();

    console.log("Model:", model);

    if (!prompt) {
      return new Response("Prompt is required", { status: 400 });
    }

    console.log("API received prompt:", prompt);

    // Find the selected model from our options
    const selectedModel = modelOptions.find((option) => option.value === model);

    // Use the default model (Claude 3 Sonnet) if the selected model is not found
    const aiClient = selectedModel?.model || modelOptions[1].model;

    // Analyze the end of the prompt
    const endsWithSpace = prompt.endsWith(" ");
    const endsWithComma = prompt.endsWith(",");
    const endsWithPeriod = /[.!?]$/.test(prompt);
    const endsWithNewline = prompt.endsWith("\n");

    // Set up guidance based on ending
    let continuationGuidance = "";
    if (endsWithSpace) {
      continuationGuidance = "Start with the next word after the space.";
    } else if (endsWithComma) {
      continuationGuidance =
        "Continue after the comma with appropriate phrasing.";
    } else if (endsWithPeriod) {
      continuationGuidance = "Begin a new sentence that logically follows.";
    } else if (endsWithNewline) {
      continuationGuidance = "Start a new paragraph that follows logically.";
    } else {
      continuationGuidance = "Complete the current word or phrase naturally.";
    }

    // Clear system instructions with stronger language about not repeating
    const systemPrompt = `You are a subtle, intelligent writing assistant that offers minimal, high-quality inline suggestions as the author writes. Your goal is to help them stay in flow—not interrupt it.

    Your suggestions should: – Match the author's voice, tone, and pacing,
    – Be context-aware, building on what was just written,
    – Offer helpful continuations, not completions,
    – Be short (1–2 clauses or a sentence max),
    – Never change the author's meaning or intent,
    – Avoid generic, filler, or overly enthusiastic phrases.
    - DO NOT EVER repeat any part of the user's text.
    - ONLY provide NEW TEXT that would logically come next. 

    Do not offer advice, critiques, or explanations.
    Do not break the narrative voice.
    If uncertain, err on the side of silence.

    CRITICAL RULES:
    1. DO NOT EVER repeat any part of the user's text
    2. ONLY provide NEW TEXT that would logically come next
    3. Keep your suggestion relatively short (1-3 sentences max)
    4. Match the tone, style and formatting of the user's writing
    5. ${continuationGuidance}
    6. Writing style: ${writingType || "general"}
    7. Your response MUST be entirely different from the user's input
    8. Your response MUST NOT be empty or just whitespace
    ${
      customInstructions ? `\nAdditional guidance: ${customInstructions}` : ""
    }`;

    // Format the user prompt to make it clearer which part is to be continued
    const formattedUserPrompt = `The following is a text that needs to be continued:
        
    ===BEGIN TEXT===
    ${prompt}
    ===END TEXT===

    Provide only the natural continuation of this text. DO NOT repeat any part of the original text.`;

    // Stream the response from the selected AI model
    const response = streamText({
      model: aiClient,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: formattedUserPrompt,
        },
      ],
      temperature: temperature || 0.7,
      maxTokens: 250,
    });

    // Ensure we return a Response object
    return response.toTextStreamResponse();
  } catch (error) {
    console.error("Error in AI route:", error);
    return new Response("Error processing your request", { status: 500 });
  }
}
