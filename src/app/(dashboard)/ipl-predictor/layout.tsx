import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IPL Match Predictor — KKR vs MI | AI-Powered Predictions",
  description:
    "Real-time AI-powered IPL 2026 match predictions for KKR vs Mumbai Indians. Ball-by-ball predictions, live scores, and player analytics powered by Claude Opus 4.6.",
};

export default function IplPredictorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
