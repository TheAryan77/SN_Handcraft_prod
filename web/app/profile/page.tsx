import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  Bell,
  CreditCard,
  MapPin,
  Package,
  Settings,
  User,
} from "lucide-react";
import styles from "../inner.module.css";

import ProfileSidebarLogoutButton from "../../components/ProfileSidebarLogoutButton";
import IndianAddressForm from "../../components/IndianAddressForm";

async function requireUserEmail() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    redirect("/auth");
  }
  return session.user.email;
}

type TabKey =
  | "personal"
  | "addresses"
  | "payments"
  | "orders"
  | "notifications"
  | "settings";

const tabList: Array<{
  id: TabKey;
  label: string;
  icon: React.ReactNode;
}> = [
  { id: "personal", label: "Personal Info", icon: <User size={16} /> },
  { id: "addresses", label: "Saved Addresses", icon: <MapPin size={16} /> },
  { id: "payments", label: "Payment Methods", icon: <CreditCard size={16} /> },
  { id: "orders", label: "Previous Orders", icon: <Package size={16} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
  { id: "settings", label: "Account Settings", icon: <Settings size={16} /> },
];

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  async function addAddress(formData: FormData) {
    "use server";

    const email = await requireUserEmail();
    const session = await getServerSession();
    const token = (session as any)?.accessToken;

    const fullName = String(formData.get("fullName") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const line1 = String(formData.get("line1") ?? "").trim();
    const line2 = String(formData.get("line2") ?? "").trim();
    const city = String(formData.get("city") ?? "").trim();
    const state = String(formData.get("state") ?? "").trim();
    const postalCode = String(formData.get("postalCode") ?? "").trim();
    const country = String(formData.get("country") ?? "").trim();

    if (!fullName || !phone || !line1 || !city || !state || !postalCode || !country) {
      return;
    }

    if (!/^\d{6}$/.test(postalCode)) {
      return;
    }
    
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/users/me/addresses`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ fullName, phone, line1, line2: line2 || null, city, state, postalCode, country })
    });

    revalidatePath("/profile");
  }

  async function deleteAddress(formData: FormData) {
    "use server";

    const email = await requireUserEmail();
    const session = await getServerSession();
    const addressId = String(formData.get("addressId") ?? "").trim();
    if (!addressId) return;

    const token = (session as any)?.accessToken;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/users/me/addresses/${addressId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });

    revalidatePath("/profile");
  }

  const email = await requireUserEmail();
  const query = await searchParams;

  const activeTab = tabList.some((tab) => tab.id === query.tab)
    ? (query.tab as TabKey)
    : "personal";

  let user: any = null;
  try {
    const session = await getServerSession();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
    const res = await fetch(`${apiUrl}/users/me`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${(session as any)?.accessToken}` },
      cache: "no-store",
    });
    const data = await res.json();
    if (data.success && data.data) {
      user = data.data;
      if (!user.addresses) user.addresses = [];
      if (!user.orders) user.orders = [];
    }
  } catch (error) {
    console.error("Failed to fetch user profile", error);
  }

  if (!user) {
    redirect("/auth");
  }

  return (
    <>
      <section className={styles.pageHeader}>
        <div className="mandala-bg" style={{ opacity: 0.1 }}></div>
        <h1 className={styles.pageTitle}>My Profile</h1>
        <p className={styles.pageSubtitle}>Manage your account, addresses, and orders.</p>
      </section>

      <section className={styles.pageContent} style={{ backgroundColor: "var(--background-color)" }}>
        <div className="pattern2-bg"></div>
        <div className={`container ${styles.twoColumn}`}>
          <aside className={styles.card} style={{ padding: 0, height: "fit-content" }}>
            <div
              style={{
                padding: "1.6rem 1rem 1.4rem",
                textAlign: "center",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "86px",
                  height: "86px",
                  margin: "0 auto 0.75rem",
                  borderRadius: "999px",
                  background: "var(--terracotta)",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src="/image.png"
                  alt="Profile Avatar"
                  style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.88 }}
                />
              </div>
              <h3 style={{ margin: 0, color: "var(--text-primary)", fontSize: "1.25rem" }}>
                {user.name}
              </h3>
              <p style={{ margin: "0.2rem 0 0", color: "var(--text-muted)", fontSize: "0.92rem" }}>
                Premium Artisan Member
              </p>
            </div>

            <div style={{ padding: "0.85rem" }}>
              {tabList.map((tab) => (
                <Link
                  key={tab.id}
                  href={`/profile?tab=${tab.id}`}
                  style={{
                    padding: "0.9rem 0.95rem",
                    borderRadius: "8px",
                    backgroundColor:
                      activeTab === tab.id ? "rgba(166, 136, 96, 0.32)" : "transparent",
                    color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-secondary)",
                    fontWeight: activeTab === tab.id ? 700 : 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.8rem",
                    marginBottom: "0.2rem",
                    textDecoration: "none",
                    fontSize: "0.95rem",
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </Link>
              ))}
              <ProfileSidebarLogoutButton />
            </div>
          </aside>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {activeTab === "personal" ? (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Personal Info</h2>
                <div className={styles.twoColumn} style={{ gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Name</label>
                    <input className={styles.input} value={user.name} readOnly />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Role</label>
                    <input className={styles.input} value={user.role} readOnly />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email</label>
                  <input className={styles.input} value={user.email} readOnly />
                </div>
              </div>
            ) : null}

            {activeTab === "addresses" ? (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Saved Addresses</h2>

                {user.addresses.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
                    No saved addresses yet.
                  </p>
                ) : (
                  <div style={{ display: "grid", gap: "0.8rem", marginBottom: "1rem" }}>
                    {user.addresses.map((address: any) => (
                      <div
                        key={address.id}
                        style={{
                          border: "1px solid var(--border)",
                          borderRadius: "10px",
                          padding: "0.85rem",
                        }}
                      >
                        <p style={{ margin: 0, color: "var(--text-primary)", fontWeight: 600 }}>
                          {address.fullName} • {address.phone}
                        </p>
                        <p
                          style={{
                            margin: "0.35rem 0",
                            color: "var(--text-muted)",
                            fontSize: "0.9rem",
                            lineHeight: 1.5,
                          }}
                        >
                          {address.line1}
                          {address.line2 ? `, ${address.line2}` : ""}
                          <br />
                          {address.city}, {address.state} {address.postalCode}, {address.country}
                        </p>
                        <form action={deleteAddress}>
                          <input type="hidden" name="addressId" value={address.id} />
                          <button
                            type="submit"
                            style={{
                              border: "1px solid var(--border)",
                              borderRadius: "7px",
                              background: "var(--surface)",
                              color: "#b02e20",
                              padding: "0.3rem 0.55rem",
                              fontSize: "0.82rem",
                              cursor: "pointer",
                            }}
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    ))}
                  </div>
                )}

                <h3 style={{ margin: "0.2rem 0 0.7rem", color: "var(--text-primary)", fontSize: "1rem" }}>
                  Add New Address
                </h3>
                <IndianAddressForm action={addAddress} />
              </div>
            ) : null}

            {activeTab === "payments" ? (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Payment Methods</h2>
                <p style={{ color: "var(--text-muted)" }}>
                  Saved payment methods are not enabled yet. Checkout remains functional.
                </p>
              </div>
            ) : null}

            {activeTab === "orders" ? (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Previous Orders</h2>
                {user.orders.length === 0 ? (
                  <p style={{ color: "var(--text-muted)" }}>No previous orders yet.</p>
                ) : (
                  <div style={{ display: "grid", gap: "0.7rem" }}>
                    {user.orders.map((order: any) => (
                      <div
                        key={order.id}
                        style={{ border: "1px solid var(--border)", borderRadius: "10px", padding: "0.8rem" }}
                      >
                        <p style={{ margin: 0, color: "var(--text-primary)", fontWeight: 600 }}>
                          Order #{order.id.slice(0, 8).toUpperCase()} • {order.status.replaceAll("_", " ")}
                        </p>
                        <p style={{ margin: "0.35rem 0 0", color: "var(--text-muted)", fontSize: "0.88rem" }}>
                          {order.items.length} item(s) • ₹
                          {Number(order.totalAmount).toLocaleString()} • {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem", flexWrap: "wrap" }}>
                          <Link
                            href={`/orders/${order.id}/tracking`}
                            className="btn-secondary"
                            style={{ display: "inline-flex" }}
                          >
                            Track
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
                    ))}
                  </div>
                )}
                <Link
                  href="/orders"
                  className="btn-secondary"
                  style={{ display: "inline-flex", marginTop: "1rem" }}
                >
                  View Full Orders Page
                </Link>
              </div>
            ) : null}

            {activeTab === "notifications" ? (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Notifications</h2>
                <p style={{ color: "var(--text-muted)" }}>
                  Notification preferences UI is visible. Backend preference persistence can be added next.
                </p>
              </div>
            ) : null}

            {activeTab === "settings" ? (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Account Settings</h2>
                <p style={{ color: "var(--text-muted)" }}>
                  Secure password-change and account-delete actions can be connected in the next step.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
