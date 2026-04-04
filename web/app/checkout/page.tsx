import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import styles from "../inner.module.css";

import CheckoutClient from "./checkout-client";

export default async function CheckoutPage() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/auth");
  }

  let items: any[] = [];
  let addresses: any[] = [];
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
    const token = (session as any).accessToken;
    
    // Fetch cart
    const cartRes = await fetch(`${apiUrl}/cart`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` },
      cache: "no-store"
    });
    const cartData = await cartRes.json();
    if (cartData.success && cartData.data?.items) {
      items = cartData.data.items;
    }

    // Fetch addresses from user profile
    const userRes = await fetch(`${apiUrl}/users/me`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` },
      cache: "no-store",
    });
    const userData = await userRes.json();
    if (userData.success && userData.data?.addresses) {
      addresses = userData.data.addresses;
    }
  } catch (error) {
    console.error("Failed to fetch checkout data", error);
  }

  if (items.length === 0) {
    return (
      <>
        <section className={styles.pageHeader}>
          <div className="mandala-bg" style={{ opacity: 0.1 }}></div>
          <h1 className={styles.pageTitle}>Secure Checkout</h1>
          <p className={styles.pageSubtitle}>Your cart is currently empty.</p>
        </section>

        <section className={styles.pageContent} style={{ backgroundColor: "var(--background-color)" }}>
          <div className="pattern2-bg"></div>
          <div className="container">
            <div className={styles.card} style={{ textAlign: "center" }}>
              <h2 className={styles.cardTitle}>Nothing to checkout</h2>
              <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
                Add products to your cart, then return here to place your order.
              </p>
              <Link href="/products" className="btn-primary" style={{ display: "inline-flex" }}>
                Browse Products
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (addresses.length === 0) {
    return (
      <>
        <section className={styles.pageHeader}>
          <div className="mandala-bg" style={{ opacity: 0.1 }}></div>
          <h1 className={styles.pageTitle}>Secure Checkout</h1>
          <p className={styles.pageSubtitle}>Add a delivery address before placing your order.</p>
        </section>

        <section className={styles.pageContent} style={{ backgroundColor: "var(--background-color)" }}>
          <div className="pattern2-bg"></div>
          <div className="container">
            <div className={styles.card} style={{ textAlign: "center" }}>
              <h2 className={styles.cardTitle}>No saved addresses</h2>
              <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
                Add your address in profile to continue checkout.
              </p>
              <Link href="/profile" className="btn-primary" style={{ display: "inline-flex" }}>
                Go to Profile
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section className={styles.pageHeader}>
        <div className="mandala-bg" style={{ opacity: 0.1 }}></div>
        <h1 className={styles.pageTitle}>Secure Checkout</h1>
        <p className={styles.pageSubtitle}>
          Complete your purchase to bring genuine Indian artistry home.
        </p>
      </section>

      <section className={styles.pageContent} style={{ backgroundColor: "var(--background-color)" }}>
        <div className="pattern2-bg"></div>
        <CheckoutClient addresses={addresses} items={items} />
      </section>
    </>
  );
}
