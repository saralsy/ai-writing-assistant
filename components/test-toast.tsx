"use client";

import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "./ui/toast";

export function TestToast() {
  const { toast } = useToast();

  return (
    <div className="p-4">
      <Button
        onClick={() => {
          console.log("Toast button clicked");
          toast({
            title: "Test Toast Title",
            description: "This is a test toast to verify it's working",
            action: (
              <ToastAction
                altText="Try again"
                onClick={() => console.log("Action clicked")}
              >
                Try again
              </ToastAction>
            ),
          });
        }}
      >
        Show Test Toast
      </Button>

      <Button
        variant="destructive"
        className="ml-2"
        onClick={() => {
          console.log("AI Issue toast button clicked");
          toast({
            title: "AI couldn't generate a useful suggestion",
            description:
              "Model 'claude-3-sonnet-20240229' returned the same text or an empty result. Please select a different AI model to continue getting suggestions.",
            variant: "destructive",
            action: (
              <ToastAction
                altText="Switch Model"
                onClick={() => {
                  toast({
                    title: "Model switched",
                    description:
                      "Now using claude-3-haiku-20240307. Suggestions will resume automatically.",
                  });
                }}
              >
                Switch Model
              </ToastAction>
            ),
          });
        }}
      >
        Show AI Issue Toast
      </Button>
    </div>
  );
}
