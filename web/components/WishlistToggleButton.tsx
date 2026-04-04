"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { getApiUrl, authHeaders } from "@/lib/apiClient";

type ApiResponse = {
  success: boolean;
  message?: string;
};

export default function WishlistToggleButton({
  productId,
  initialActive,
  onChanged,
}: {
  productId: string;
  initialActive: boolean;
  onChanged?: (active: boolean) => void;
}) {
  const [active, setActive] = useState(initialActive);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setActive(initialActive);
  }, [initialActive]);

  async function toggleWishlist() {
    try {
      setLoading(true);

      const res = await fetch(`${getApiUrl()}/wishlist`, {
        method: active ? "DELETE" : "POST",
        headers: authHeaders(),
        body: JSON.stringify({ productId }),
      });

      const body = (await res.json()) as ApiResponse;
      if (!res.ok || !body.success) {
        throw new Error(body.message || "Unable to update wishlist");
      }

      const next = !active;
      setActive(next);
      onChanged?.(next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      onClick={toggleWishlist}
      disabled={loading}
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        border: "1px solid var(--border)",
        borderRadius: "999px",
        width: "34px",
        height: "34px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255,255,255,0.96)",
        cursor: loading ? "not-allowed" : "pointer",
      }}
    >
      <Heart
        size={16}
        strokeWidth={1.8}
        color={active ? "#b02e20" : "var(--text-secondary)"}
        fill={active ? "#b02e20" : "transparent"}
      />
    </button>
  );
}
