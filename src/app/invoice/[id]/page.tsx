import type { Metadata } from "next";
import { Invoice } from "@/components/booking/Invoice";

export const metadata: Metadata = { title: "Invoice", robots: { index: false } };

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Invoice bookingId={id} />;
}
