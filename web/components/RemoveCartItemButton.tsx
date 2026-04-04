"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { getApiUrl, authHeaders } from "@/lib/apiClient";

type ApiResponse = {
  success: boolean;
  message?: string;
};

export default function RemoveCartItemButton({ itemId }: { itemId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  async function handleRemove() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${getApiUrl()}/cart/items/${itemId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      const body = (await res.json()) as ApiResponse;
      if (!res.ok || !body.success) {
        throw new Error(body.message || "Failed to remove item from cart");
      }

      router.refresh();
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
        onClick={handleRemove}
        disabled={loading}
        style={{
          border: "1px solid var(--border)",
          background: "var(--surface)",
          color: "#b02e20",
          borderRadius: "8px",
          padding: "0.45rem 0.7rem",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "0.85rem",
        }}
      >
        <Trash2 size={14} />
        {loading ? "Removing..." : "Remove"}
      </button>
      {error ? (
        <p style={{ marginTop: "0.4rem", color: "#b02e20", fontSize: "0.8rem" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
