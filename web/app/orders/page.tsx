import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { CheckCircle, Clock } from "lucide-react";
import styles from "../inner.module.css";


function formatStatus(status: string) {
  return status.replaceAll("_", " ").toLowerCase().replace(/(^|\s)\S/g, (s) => s.toUpperCase());
}

export default async function OrdersPage() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/auth");
  }

  let orders: any[] = [];
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
    const res = await fetch(`${apiUrl}/orders/my`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${(session as any).accessToken}` },
      cache: "no-store"
    });
    const data = await res.json();
    if (data.success && data.data) {
      orders = data.data; // API should return array of orders
      if (!Array.isArray(orders)) orders = []; // fallback in case API shape differs
      // Express API orders.controller.ts uses getMyOrders(userId) which returns an array of orders
    }
  } catch (error) {
    console.error("Failed to fetch orders", error);
  }

  return (
    <>
      <section className={styles.pageHeader}>
        <div className="mandala-bg" style={{ opacity: 0.1 }}></div>
        <h1 className={styles.pageTitle}>Order History</h1>
        <p className={styles.pageSubtitle}>
          Track your handcrafted shipments and view past purchases.
        </p>
      </section>

      <section
        className={styles.pageContent}
        style={{ backgroundColor: "var(--background-color)", minHeight: "50vh" }}
      >
        <div className="pattern2-bg"></div>
        <div className="container">
          {orders.length === 0 ? (
            <div className={styles.card} style={{ textAlign: "center" }}>
              <h2 className={styles.cardTitle}>No previous orders</h2>
              <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
                Once you complete checkout, your order history will appear here.
              </p>
              <Link href="/products" className="btn-primary" style={{ display: "inline-flex" }}>
                Start Shopping
              </Link>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className={styles.card} style={{ marginBottom: "1.5rem" }}>
                <div
                  className={styles.flexBetween}
                  style={{ borderBottom: "1px solid var(--border)", paddingBottom: "1rem", marginBottom: "1rem" }}
                >
                  <div>
                    <h3 className={styles.cardTitle} style={{ border: "none", margin: 0, padding: 0 }}>
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.35rem" }}>
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                      ₹{Number(order.totalAmount).toLocaleString()}
                    </p>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        marginTop: "0.35rem",
                        color: order.status === "DELIVERED" ? "#22863a" : "#8a5a10",
                        fontSize: "0.85rem",
                      }}
                    >
                      {order.status === "DELIVERED" ? <CheckCircle size={15} /> : <Clock size={15} />}
                      {formatStatus(order.status)}
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.9rem" }}>
                  {order.items.map((item: any) => (
                    <div key={item.id} style={{ display: "flex", gap: "0.7rem", alignItems: "center" }}>
                      <div
                        style={{
                          width: "70px",
                          height: "70px",
                          borderRadius: "8px",
                          backgroundColor: "var(--linen)",
                          backgroundImage: item.product?.images?.[0]
                            ? `url(${item.product.images[0].url})`
                            : "none",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      ></div>
                      <div>
                        <h4 style={{ margin: 0, color: "var(--text-primary)", fontSize: "0.95rem" }}>
                          {item.product.name}
                        </h4>
                        <p style={{ margin: "0.25rem 0 0", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: "1rem", display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                  <Link
                    href={`/orders/${order.id}/tracking`}
                    className="btn-secondary"
                    style={{ display: "inline-flex" }}
                  >
                    Track Order
                  </Link>
                  <Link
                    href={`/orders/${order.id}/invoice`}
                    className="btn-primary"
                    style={{ display: "inline-flex" }}
                  >
                    Invoice
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}
