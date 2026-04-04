"use client";

import { useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import AddToCartModal from "./AddToCartModal";

type Product = {
  id: string;
  name: string;
  price: number;
  images?: Array<{ id: string; url: string }>;
};

export default function ProductDetailActions({ product }: { product: Product }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <button
          className="btn-primary"
          style={{ flex: 1, fontSize: "1rem" }}
          onClick={() => setIsOpen(true)}
        >
          <ShoppingBag size={18} /> Add to Cart
        </button>
        <button className="btn-secondary" style={{ padding: "0.75rem", borderRadius: "6px" }}>
          <Heart size={20} />
        </button>
      </div>

      <AddToCartModal
        product={product}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
