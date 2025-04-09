import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";

export const modelOptions = [
  {
    label: "Claude 3 Haiku (Fast)",
    value: "claude-3-haiku",
    model: anthropic("claude-3-5-haiku-20241022"),
  },
  {
    label: "Claude 3.7 Sonnet (Balanced)",
    value: "claude-3-sonnet",
    model: anthropic("claude-3-7-sonnet-20250219"),
  },
  { label: "GPT-4o", value: "gpt-4o", model: openai("gpt-4o") },
  { label: "GPT-4o-mini", value: "gpt-4o-mini", model: openai("gpt-4o-mini") },
  { label: "GPT-4-turbo", value: "gpt-4-turbo", model: openai("gpt-4-turbo") },

  {
    label: "Gemini 2.5 Pro",
    value: "gemini-2.5-pro-preview-03-25",
    model: google("gemini-2.5-pro-preview-03-25"),
  },
  {
    label: "Gemini 1.5 Pro",
    value: "gemini-1.5-pro",
    model: google("gemini-1.5-pro"),
  },
  {
    label: "Gemini 1.5 Flash",
    value: "gemini-1.5-flash",
    model: google("gemini-1.5-flash"),
  },
];
