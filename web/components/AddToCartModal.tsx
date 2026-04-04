"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Minus,
  Plus,
  ShoppingBag,
  Check,
  Palette,
  Shapes,
  Package,
} from "lucide-react";
import { useSession } from "@/providers/AuthProvider";
import { getApiUrl, authHeaders } from "@/lib/apiClient";
import styles from "./AddToCartModal.module.css";

type Product = {
  id: string;
  name: string;
  price: number;
  images?: Array<{ id: string; url: string }>;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const COLORS = [
  { name: "Natural", hex: "#d4a96a" },
  { name: "Terracotta", hex: "#7c3d1e" },
  { name: "Ivory", hex: "#fdf8f2" },
  { name: "Forest", hex: "#3d6b4f" },
  { name: "Indigo", hex: "#2d3a6e" },
  { name: "Rust", hex: "#c4541a" },
];

const DESIGNS = [
  "Classic",
  "Traditional",
  "Contemporary",
  "Minimalist",
  "Ornate",
  "Custom",
];

export default function AddToCartModal({
  product,
  isOpen,
  onClose,
}: {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { status } = useSession();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedDesign, setSelectedDesign] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setQuantity(1);
      setSelectedColor("");
      setSelectedDesign("");
      setResult(null);
      setIsSubmitting(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Close on outside click
  function handleBackdropClick(e: React.MouseEvent) {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  }

  async function handleAddToCart() {
    if (status !== "authenticated") {
      setResult({
        success: false,
        message: "Please login first to add items to cart.",
      });
      return;
    }

    if (!product) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`${getApiUrl()}/cart/items`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          productId: product.id,
          quantity,
          color: selectedColor,
          design: selectedDesign,
        }),
      });

      const body = (await res.json()) as ApiResponse<unknown>;
      if (!res.ok || !body.success) {
        throw new Error(body.message || "Failed to add item to cart");
      }

      setResult({ success: true, message: "Added to cart successfully!" });
    } catch (error) {
      setResult({ success: false, message: (error as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen || !product) return null;

  const totalPrice = product.price * quantity;

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal} ref={modalRef}>
        {/* Close button */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <X size={20} strokeWidth={1.5} />
        </button>

        {/* Header — product preview */}
        <div className={styles.header}>
          <div className={styles.productPreview}>
            {product.images && product.images[0] ? (
              <img
                src={product.images[0].url}
                alt={product.name}
                className={styles.previewImage}
              />
            ) : (
              <div className={styles.previewPlaceholder}>
                <Package size={24} strokeWidth={1} color="var(--text-muted)" />
              </div>
            )}
            <div>
              <h3 className={styles.productName}>{product.name}</h3>
              <p className={styles.productPrice}>
                ₹{product.price.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <div className={styles.steps}>
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`${styles.stepDot} ${step >= s ? styles.stepActive : ""} ${step === s ? styles.stepCurrent : ""}`}
              >
                {step > s ? <Check size={12} /> : s}
              </div>
            ))}
          </div>
        </div>

        {/* Success / Error Result */}
        {result ? (
          <div className={styles.resultScreen}>
            <div
              className={`${styles.resultIcon} ${result.success ? styles.resultSuccess : styles.resultError}`}
            >
              {result.success ? (
                <Check size={32} strokeWidth={2} />
              ) : (
                <X size={32} strokeWidth={2} />
              )}
            </div>
            <h3 className={styles.resultTitle}>
              {result.success ? "Added to Cart!" : "Oops!"}
            </h3>
            <p className={styles.resultMessage}>{result.message}</p>
            <button className={styles.primaryBtn} onClick={onClose}>
              {result.success ? "Continue Shopping" : "Close"}
            </button>
          </div>
        ) : (
          <>
            {/* Body — step content */}
            <div className={styles.body}>
              {/* STEP 1: Quantity */}
              {step === 1 && (
                <div className={styles.stepContent}>
                  <div className={styles.stepHeader}>
                    <Package
                      size={20}
                      strokeWidth={1.5}
                      color="var(--terracotta)"
                    />
                    <h3 className={styles.stepTitle}>
                      How many would you like?
                    </h3>
                  </div>
                  <div className={styles.quantityPicker}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus size={18} strokeWidth={2} />
                    </button>
                    <span className={styles.qtyValue}>{quantity}</span>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus size={18} strokeWidth={2} />
                    </button>
                  </div>
                  <p className={styles.subtotalText}>
                    Subtotal:{" "}
                    <strong>₹{totalPrice.toLocaleString()}</strong>
                  </p>
                </div>
              )}

              {/* STEP 2: Color */}
              {step === 2 && (
                <div className={styles.stepContent}>
                  <div className={styles.stepHeader}>
                    <Palette
                      size={20}
                      strokeWidth={1.5}
                      color="var(--terracotta)"
                    />
                    <h3 className={styles.stepTitle}>
                      Choose a colour
                    </h3>
                  </div>
                  <p className={styles.stepHint}>
                    Select a colour preference (optional — leave blank for the
                    artisan&apos;s default finish)
                  </p>
                  <div className={styles.colorGrid}>
                    {COLORS.map((c) => (
                      <button
                        key={c.name}
                        className={`${styles.colorOption} ${selectedColor === c.name ? styles.colorSelected : ""}`}
                        onClick={() =>
                          setSelectedColor(
                            selectedColor === c.name ? "" : c.name
                          )
                        }
                      >
                        <span
                          className={styles.colorSwatch}
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className={styles.colorLabel}>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: Design */}
              {step === 3 && (
                <div className={styles.stepContent}>
                  <div className={styles.stepHeader}>
                    <Shapes
                      size={20}
                      strokeWidth={1.5}
                      color="var(--terracotta)"
                    />
                    <h3 className={styles.stepTitle}>
                      Pick a design style
                    </h3>
                  </div>
                  <p className={styles.stepHint}>
                    Choose a design style (optional — artisan will use the
                    default design if not selected)
                  </p>
                  <div className={styles.designGrid}>
                    {DESIGNS.map((d) => (
                      <button
                        key={d}
                        className={`${styles.designOption} ${selectedDesign === d ? styles.designSelected : ""}`}
                        onClick={() =>
                          setSelectedDesign(selectedDesign === d ? "" : d)
                        }
                      >
                        {selectedDesign === d && (
                          <Check
                            size={14}
                            strokeWidth={2}
                            className={styles.designCheck}
                          />
                        )}
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: Confirm */}
              {step === 4 && (
                <div className={styles.stepContent}>
                  <div className={styles.stepHeader}>
                    <ShoppingBag
                      size={20}
                      strokeWidth={1.5}
                      color="var(--terracotta)"
                    />
                    <h3 className={styles.stepTitle}>Confirm your order</h3>
                  </div>
                  <div className={styles.summaryCard}>
                    <div className={styles.summaryRow}>
                      <span>Product</span>
                      <strong style={{ textTransform: "capitalize" }}>
                        {product.name}
                      </strong>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Quantity</span>
                      <strong>{quantity}</strong>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Colour</span>
                      <strong>
                        {selectedColor || (
                          <span style={{ color: "var(--text-muted)" }}>
                            Artisan default
                          </span>
                        )}
                      </strong>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Design</span>
                      <strong>
                        {selectedDesign || (
                          <span style={{ color: "var(--text-muted)" }}>
                            Artisan default
                          </span>
                        )}
                      </strong>
                    </div>
                    <div className={styles.summaryDivider} />
                    <div className={styles.summaryRow}>
                      <span>Total</span>
                      <strong className={styles.summaryTotal}>
                        ₹{totalPrice.toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer — navigation */}
            <div className={styles.footer}>
              {step > 1 && (
                <button
                  className={styles.secondaryBtn}
                  onClick={() => setStep((step - 1) as 1 | 2 | 3)}
                >
                  Back
                </button>
              )}
              <div style={{ flex: 1 }} />
              {step < 4 ? (
                <button
                  className={styles.primaryBtn}
                  onClick={() => setStep((step + 1) as 2 | 3 | 4)}
                >
                  {step === 1
                    ? "Choose Colour →"
                    : step === 2
                      ? "Choose Design →"
                      : "Review Order →"}
                </button>
              ) : (
                <button
                  className={styles.addBtn}
                  onClick={handleAddToCart}
                  disabled={isSubmitting}
                >
                  <ShoppingBag size={18} strokeWidth={1.5} />
                  {isSubmitting ? "Adding..." : "Add to Cart"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
