"use client";

import { useEffect } from "react";
import { clearOrderData } from "@/lib/order-storage";

/** Rendered only after Stripe confirms the payment — then the saved order is no longer needed. */
export default function ClearOrderData() {
  useEffect(() => {
    clearOrderData();
  }, []);

  return null;
}
