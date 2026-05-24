"use client";

import { Download } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface PrintButtonProps {
  fileName?: string;
}

export function PrintButton({ fileName }: PrintButtonProps) {
  useEffect(() => {
    if (fileName) {
      const original = document.title;
      document.title = fileName.replace(/\.pdf$/, "");
      return () => {
        document.title = original;
      };
    }
  }, [fileName]);

  return (
    <Button onClick={() => window.print()}>
      <Download className="w-4 h-4" />
      Save as PDF
    </Button>
  );
}
