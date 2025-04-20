"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

export default function DirectToastTest() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Direct Toast Test</h1>
      <p className="mb-4">
        This page uses the direct toast import to test notifications.
      </p>

      <Button
        onClick={() => {
          console.log("Direct toast clicked");
          toast({
            title: "Direct Toast Test",
            description: "This toast uses the direct toast function import",
            variant: "default",
          });
        }}
      >
        Show Direct Toast
      </Button>
    </div>
  );
}
