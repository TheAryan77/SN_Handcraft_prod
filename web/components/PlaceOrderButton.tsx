"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getApiUrl, authHeaders } from "@/lib/apiClient";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: {
    orderId: string;
    razorpayOrderId?: string;
    amount?: number;
    currency?: string;
  };
};

export default function PlaceOrderButton({
  selectedAddressId,
  paymentMethod,
}: {
  selectedAddressId: string;
  paymentMethod: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  async function placeOrder() {
    if (!selectedAddressId) {
      setError("Please select a shipping address.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (paymentMethod === "ONLINE") {
        const res = await loadRazorpayScript();
        if (!res) {
          setError("Razorpay SDK failed to load. Please check your connection.");
          setLoading(false);
          return;
        }
      }

      const res = await fetch(`${getApiUrl()}/orders`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ addressId: selectedAddressId, paymentMethod }),
      });

      const body = (await res.json()) as ApiResponse;
      if (!res.ok || !body.success) {
        throw new Error(body.message || "Unable to place order");
      }

      if (paymentMethod === "ONLINE" && body.data?.razorpayOrderId) {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
          amount: body.data.amount,
          currency: body.data.currency,
          name: "SN HandCrafts",
          description: "Purchase of handcrafted ethnic goods",
          order_id: body.data.razorpayOrderId,
          handler: async function (response: any) {
            try {
              const verifyRes = await fetch(`${getApiUrl()}/payments/orders/${body.data!.orderId}/verify`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: body.data!.orderId,
                }),
              });
              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                router.push("/orders");
                router.refresh();
              } else {
                setError("Payment verification failed: " + verifyData.message);
              }
            } catch (err) {
              setError("Payment verification failed.");
            }
          },
          theme: {
            color: "#7c3d1e", // Terracotta branding
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          setError(`Payment Failed: ${response.error.description}`);
        });
        rzp.open();
        setLoading(false);
      } else {
        // COD logic
        router.push("/orders");
        router.refresh();
      }
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: "1.1rem" }}>
      <button
        type="button"
        onClick={placeOrder}
        className="btn-primary"
        disabled={loading}
        style={{ width: "100%", padding: "0.95rem", fontSize: "1.05rem" }}
      >
        {loading ? "Processing..." : paymentMethod === "ONLINE" ? "Pay via Razorpay" : "Confirm COD Order"}
      </button>
      {error ? (
        <p style={{ marginTop: "0.45rem", color: "#b02e20", fontSize: "0.85rem" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
