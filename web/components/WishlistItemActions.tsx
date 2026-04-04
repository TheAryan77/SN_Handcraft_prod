"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Trash2 } from "lucide-react";
import { getApiUrl, authHeaders } from "@/lib/apiClient";

type ApiResponse = {
  success: boolean;
  message?: string;
};

export default function WishlistItemActions({
  productId,
}: {
  productId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleRemove() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${getApiUrl()}/wishlist`, {
        method: "DELETE",
        headers: authHeaders(),
        body: JSON.stringify({ productId }),
      });
      const body = (await res.json()) as ApiResponse;
      if (!res.ok || !body.success) {
        throw new Error(body.message || "Failed to remove from wishlist");
      }
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToCart() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${getApiUrl()}/cart/items`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      const body = (await res.json()) as ApiResponse;
      if (!res.ok || !body.success) {
        throw new Error(body.message || "Failed to add to cart");
      }
      router.push("/cart");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: "0.8rem" }}>
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={loading}
        className="btn-primary"
        style={{ width: "100%", display: "inline-flex", gap: "0.4rem", justifyContent: "center" }}
      >
        <ShoppingBag size={16} />
        {loading ? "Please wait..." : "Add to Cart"}
      </button>
      <button
        type="button"
        onClick={handleRemove}
        disabled={loading}
        style={{
          marginTop: "0.55rem",
          width: "100%",
          border: "1px solid var(--border)",
          background: "var(--surface)",
          color: "#b02e20",
          borderRadius: "8px",
          padding: "0.5rem",
          display: "inline-flex",
          justifyContent: "center",
          gap: "0.35rem",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        <Trash2 size={16} /> Remove
      </button>
      {error ? (
        <p style={{ marginTop: "0.4rem", color: "#b02e20", fontSize: "0.8rem" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
