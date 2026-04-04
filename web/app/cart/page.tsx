import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import styles from "../inner.module.css";

import RemoveCartItemButton from "../../components/RemoveCartItemButton";

export default async function CartPage() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/auth");
  }

  let items: any[] = [];
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
    const res = await fetch(`${apiUrl}/cart`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${(session as any).accessToken}` },
      cache: "no-store"
    });
    const data = await res.json();
    if (data.success && data.data && data.data.items) {
      items = data.data.items;
    }
  } catch (error) {
    console.error("Failed to fetch cart", error);
  }

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  return (
    <>
      <section className={styles.pageHeader}>
        <div className="mandala-bg" style={{ opacity: 0.1 }}></div>
        <h1 className={styles.pageTitle}>Your Cart</h1>
        <p className={styles.pageSubtitle}>
          Review your handcrafted treasures before proceeding to checkout.
        </p>
      </section>

      <section className={styles.pageContent} style={{ backgroundColor: "var(--background-color)" }}>
        <div className="pattern2-bg"></div>
        <div className={`container ${styles.twoColumn}`}>
          
          {/* Cart Items */}
          <div className={styles.card} style={{ gap: "1rem", display: "flex", flexDirection: "column" }}>
            <h2 className={styles.cardTitle}>Items ({items.length})</h2>
            
            {items.length === 0 ? (
              <div style={{ padding: "1rem", color: "var(--text-light)" }}>
                Your cart is empty. Add products from the products page.
              </div>
            ) : (
              items.map((item) => (
              <div key={item.id} className={styles.flexBetween} style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)", alignItems: "flex-start" }}>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <div
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: "8px",
                      backgroundColor: "var(--text-light)",
                      backgroundImage: item.product.images[0]
                        ? `url(${item.product.images[0].url})`
                        : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  ></div>
                  <div>
                    <h3 className={styles.productName} style={{ fontSize: "1.2rem", margin: 0 }}>
                      {item.product.name}
                    </h3>
                    <p style={{ color: "var(--text-light)", fontSize: "0.9rem", marginTop: "0.2rem" }}>
                      Category: {item.product.category?.name ?? "-"}
                    </p>
                    <p className={styles.productPrice} style={{ margin: "0.5rem 0", fontSize: "1.1rem" }}>
                      Rs {Number(item.product.price).toLocaleString()}
                    </p>
                    <div style={{ color: "var(--text-light)", fontSize: "0.95rem" }}>
                      Quantity: <strong>{item.quantity}</strong>
                    </div>
                    <RemoveCartItemButton itemId={item.id} />
                  </div>
                </div>
              </div>
            )))}
          </div>

          {/* Checkout Summary */}
          <aside className={styles.card} style={{ height: "fit-content", position: "sticky", top: "100px" }}>
            <h2 className={styles.cardTitle}>Order Summary</h2>
            
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>Rs {subtotal.toLocaleString()}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Taxes (Included)</span>
              <span>₹0</span>
            </div>
            
            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span>Rs {subtotal.toLocaleString()}</span>
            </div>

            <Link href="/checkout" style={{ display: "block", marginTop: "2rem" }}>
              <button className="btn-primary" style={{ width: "100%", padding: "1rem", fontSize: "1.1rem", borderRadius: "8px" }}>
                Proceed to Checkout
              </button>
            </Link>
            
            <Link href="/products" style={{ display: "block", marginTop: "1rem", textAlign: "center", color: "var(--text-light)", textDecoration: "underline" }}>
              Continue Shopping
            </Link>
          </aside>

        </div>
      </section>
    </>
  );
}
