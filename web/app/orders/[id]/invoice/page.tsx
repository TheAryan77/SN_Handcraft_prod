import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import styles from "../../../inner.module.css";

import InvoiceActions from "../../../../components/InvoiceActions";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/auth");
  }

  const { id } = await params;

  let order: any = null;
  let user: any = null;
  try {
    const token = (session as any)?.accessToken;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

    const [orderRes, userRes] = await Promise.all([
      fetch(`${apiUrl}/orders/${id}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
        cache: "no-store",
      }),
      fetch(`${apiUrl}/users/me`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
        cache: "no-store",
      })
    ]);

    const orderData = await orderRes.json();
    const userData = await userRes.json();

    if (orderData.success && orderData.data) order = orderData.data;
    if (userData.success && userData.data) user = userData.data;
  } catch (err) {
    console.error("Failed to fetch invoice data", err);
  }

  if (!order) {
    notFound();
  }

  const invoiceNumber = `SNH-INV-${order.id.slice(0, 8).toUpperCase()}`;
  const shippingAddress = [
    order.shippingLine1,
    order.shippingLine2,
    [order.shippingCity, order.shippingState, order.shippingPostalCode].filter(Boolean).join(" "),
    order.shippingCountry,
  ]
    .filter(Boolean)
    .join(", ");

  const lineItems = order.items.map((item: any) => ({
    name: item.product.name,
    quantity: item.quantity,
    unitPrice: Number(item.price),
    lineTotal: Number(item.price) * item.quantity,
  }));

  return (
    <>
      <section className={styles.pageHeader}>
        <div className="mandala-bg" style={{ opacity: 0.1 }}></div>
        <h1 className={styles.pageTitle}>Invoice</h1>
        <p className={styles.pageSubtitle}>Invoice #{invoiceNumber}</p>
      </section>

      <section className={styles.pageContent} style={{ backgroundColor: "var(--background-color)" }}>
        <div className="pattern2-bg"></div>
        <div className="container" style={{ display: "grid", gap: "1rem" }}>
          <div className={styles.card}>
            <div className={styles.flexBetween} style={{ alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
              <div>
                <h2 className={styles.cardTitle} style={{ border: "none", marginBottom: "0.2rem", paddingBottom: 0 }}>
                  SN HandCrafts
                </h2>
                <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  Invoice No: {invoiceNumber}
                </p>
                <p style={{ margin: "0.2rem 0 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  Issued: {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <InvoiceActions
                invoiceNumber={invoiceNumber}
                orderId={order.id}
                issuedOn={new Date(order.createdAt).toLocaleDateString()}
                customerName={order.shippingName || user.name}
                customerEmail={user.email}
                shippingAddress={shippingAddress || "No shipping snapshot available"}
                total={Number(order.totalAmount)}
                items={lineItems}
              />
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Bill To</h2>
            <p style={{ margin: 0, color: "var(--text-primary)", fontWeight: 600 }}>
              {order.shippingName || user.name}
            </p>
            {order.shippingPhone ? (
              <p style={{ margin: "0.2rem 0 0", color: "var(--text-muted)", fontSize: "0.92rem" }}>
                {order.shippingPhone}
              </p>
            ) : null}
            <p style={{ margin: "0.35rem 0 0", color: "var(--text-muted)", fontSize: "0.92rem" }}>
              {shippingAddress || "No shipping snapshot available for this order."}
            </p>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Items</h2>
            <div style={{ display: "grid", gap: "0.65rem" }}>
              {lineItems.map((item: any, index: any) => (
                <div
                  key={`${item.name}-${index}`}
                  className={styles.flexBetween}
                  style={{ borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}
                >
                  <span style={{ color: "var(--text-primary)" }}>
                    {item.name} x {item.quantity}
                  </span>
                  <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    ₹{item.lineTotal.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "1rem" }}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>₹{Number(order.totalAmount).toLocaleString()}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span>₹{Number(order.totalAmount).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ marginTop: "1rem", display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              <Link href={`/orders/${order.id}/tracking`} className="btn-secondary" style={{ display: "inline-flex" }}>
                Track Order
              </Link>
              <Link href="/orders" className="btn-primary" style={{ display: "inline-flex" }}>
                Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
