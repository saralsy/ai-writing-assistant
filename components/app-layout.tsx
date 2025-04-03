import React from "react";

interface AppLayoutProps {
  children: React.ReactNode;
  savedDocuments: any[];
  currentDocumentId: string;
  onLoadDocument: (id: string) => void;
  onCreateDocument: () => void;
  onDeleteDocument: (id: string) => void;
}

export default function AppLayout({
  children,
  savedDocuments,
  currentDocumentId,
  onLoadDocument,
  onCreateDocument,
  onDeleteDocument,
}: AppLayoutProps) {
  return <div className="flex flex-col h-screen">{children}</div>;
}
