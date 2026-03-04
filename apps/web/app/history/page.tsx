import type { Metadata } from "next";
import { HistoryClient } from "./HistoryClient";

export const metadata: Metadata = {
  title: "Cover Letter History",
  description: "View and manage your generated cover letters.",
};

export default function HistoryPage() {
  return <HistoryClient />;
}
