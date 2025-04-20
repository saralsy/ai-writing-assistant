import { TestToast } from "@/components/test-toast";

export default function TestToastPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Toast Notification Test</h1>
      <p className="mb-4">
        Click the buttons below to test if toast notifications are working
        correctly.
      </p>
      <TestToast />
    </div>
  );
}
