import type { Metadata } from "next";
import { PaymentResult } from "@/components/booking/PaymentResult";

export const metadata: Metadata = { title: "Payment", robots: { index: false } };

export default function PaymentResultPage() {
  return <PaymentResult />;
}
