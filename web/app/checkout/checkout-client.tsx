"use client";

import { useMemo, useState } from "react";
import { CreditCard, Lock, MapPin } from "lucide-react";
import styles from "../inner.module.css";
import PlaceOrderButton from "../../components/PlaceOrderButton";

type Address = {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    images: Array<{ id: string; url: string }>;
  };
};

export default function CheckoutClient({
  addresses,
  items,
}: {
  addresses: Address[];
  items: CartItem[];
}) {
  const [selectedAddressId, setSelectedAddressId] = useState(addresses[0]?.id ?? "");
  const [paymentMethod, setPaymentMethod] = useState("ONLINE");

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0),
    [items]
  );

  return (
    <div className={`container ${styles.threeColumn}`}>
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <div className={styles.card}>
          <h2
            className={styles.cardTitle}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <MapPin size={22} color="var(--terracotta)" /> Shipping Address
          </h2>

          {addresses.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>
              Add a delivery address from your profile before checkout.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              {addresses.map((address) => (
                <label
                  key={address.id}
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    padding: "0.9rem",
                    display: "flex",
                    gap: "0.65rem",
                    alignItems: "flex-start",
                    cursor: "pointer",
                    background:
                      selectedAddressId === address.id
                        ? "rgba(124, 61, 30, 0.05)"
                        : "var(--surface)",
                  }}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === address.id}
                    onChange={() => setSelectedAddressId(address.id)}
                    style={{ marginTop: "0.1rem", accentColor: "var(--terracotta)" }}
                  />
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.55 }}>
                    <strong style={{ color: "var(--text-primary)" }}>{address.fullName}</strong>
                    <br />
                    {address.phone}
                    <br />
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ""}
                    <br />
                    {address.city}, {address.state} {address.postalCode}
                    <br />
                    {address.country}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className={styles.card}>
          <h2
            className={styles.cardTitle}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <CreditCard size={22} color="var(--terracotta)" /> Payment Method
          </h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", marginBottom: "1.5rem" }}>
            <label
              style={{
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "1rem",
                display: "flex",
                gap: "0.65rem",
                alignItems: "center",
                cursor: "pointer",
                background:
                  paymentMethod === "ONLINE"
                    ? "rgba(124, 61, 30, 0.05)"
                    : "var(--surface)",
              }}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="ONLINE"
                checked={paymentMethod === "ONLINE"}
                onChange={() => setPaymentMethod("ONLINE")}
                style={{ accentColor: "var(--terracotta)" }}
              />
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Razorpay (UPI, Cards, NetBanking, Wallets)
              </span>
            </label>

            <label
              style={{
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "1rem",
                display: "flex",
                gap: "0.65rem",
                alignItems: "center",
                cursor: "pointer",
                background:
                  paymentMethod === "COD"
                    ? "rgba(124, 61, 30, 0.05)"
                    : "var(--surface)",
              }}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
                style={{ accentColor: "var(--terracotta)" }}
              />
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Cash on Delivery (COD)
              </span>
            </label>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", color: "var(--text-muted)" }}>
            <Lock size={15} />
            <span style={{ fontSize: "0.86rem" }}>Orders are secured by 128-bit encryption.</span>
          </div>
        </div>
      </div>

      <aside className={styles.card} style={{ height: "fit-content", position: "sticky", top: "100px" }}>
        <h2 className={styles.cardTitle}>Order Summary</h2>
        {items.map((item) => (
          <div key={item.id} style={{ display: "flex", gap: "0.7rem", marginBottom: "0.95rem" }}>
            <div
              style={{
                width: "58px",
                height: "58px",
                borderRadius: "8px",
                backgroundColor: "var(--linen)",
                backgroundImage: item.product.images[0] ? `url(${item.product.images[0].url})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, color: "var(--text-primary)", fontSize: "0.9rem" }}>{item.product.name}</p>
              <p style={{ margin: "0.15rem 0 0", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                Qty: {item.quantity}
              </p>
              <p style={{ margin: "0.2rem 0 0", color: "var(--terracotta)", fontSize: "0.9rem", fontWeight: 600 }}>
                ₹{(Number(item.product.price) * item.quantity).toLocaleString()}
              </p>
            </div>
          </div>
        ))}

        <div className={styles.summaryRow}>
          <span>Subtotal</span>
          <span>₹{subtotal.toLocaleString()}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Shipping</span>
          <span>Free</span>
        </div>
        <div className={styles.summaryTotal}>
          <span>Total</span>
          <span>₹{subtotal.toLocaleString()}</span>
        </div>

        <PlaceOrderButton selectedAddressId={selectedAddressId} paymentMethod={paymentMethod} />
      </aside>
    </div>
  );
}
