import { addCategory, addProduct } from "./actions";
import styles from "../inner.module.css";
import { Plus } from "lucide-react";
import { getServerSession } from "@/lib/auth";


export default async function AdminPage() {
  const session = await getServerSession();
  const token = (session as any)?.accessToken;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

  let categories: any[] = [];
  let products: any[] = [];

  try {
    const [catsRes, prodsRes] = await Promise.all([
      fetch(`${apiUrl}/categories`, { headers: { "Authorization": `Bearer ${token}` }, cache: "no-store" }),
      fetch(`${apiUrl}/products`, { headers: { "Authorization": `Bearer ${token}` }, cache: "no-store" })
    ]);
    const catsData = await catsRes.json();
    const prodsData = await prodsRes.json();
    if (catsData.success && catsData.data) categories = catsData.data;
    if (prodsData.success && prodsData.data) products = prodsData.data;
  } catch (err) {
    console.error("Failed to load admin data", err);
  }

  return (
    <>
      <section className={styles.pageHeader} style={{ padding: "4rem 2rem 2rem" }}>
        <h1 className={styles.pageTitle} style={{ fontSize: "2rem" }}>Database Admin Panel</h1>
        <p className={styles.pageSubtitle}>Add categories and products quickly.</p>
      </section>

      <section className={styles.pageContent} style={{ backgroundColor: "var(--background-color)" }}>
        <div className={`container ${styles.twoColumn}`}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* Category Form */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Add new Category</h2>
              <form action={async (data) => { "use server"; await addCategory(data); }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Category Name</label>
                  <input type="text" name="name" className={styles.input} placeholder="e.g. Copper Mugs" required />
                </div>
                <button type="submit" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Plus size={16} /> Add Category
                </button>
              </form>
            </div>

            {/* Product Form */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Add new Product</h2>
              <form action={async (data) => { "use server"; await addProduct(data); }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Product Name</label>
                  <input type="text" name="name" className={styles.input} placeholder="e.g. Handmade Jaipur Kurti" required />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.label}>Category</label>
                  <select name="categoryId" className={styles.input} required>
                    <option value="" disabled selected>Select a Category...</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.twoColumn} style={{ gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Price (₹)</label>
                    <input type="number" name="price" className={styles.input} placeholder="2999" required />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Stock Quantity</label>
                    <input type="number" name="stock" className={styles.input} placeholder="50" required />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Description</label>
                  <textarea name="description" className={styles.input} style={{ minHeight: "100px", resize: "vertical" }} placeholder="Enter detailed story / product specification..." required></textarea>
                </div>

                <button type="submit" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", justifyContent: "center" }}>
                  <Plus size={16} /> Save Product to Database
                </button>
              </form>
            </div>
          </div>

          <aside style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Existing Categories</h2>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {categories.map((cat: any) => (
                  <li key={cat.id} className={styles.flexBetween} style={{ padding: "0.8rem 0", borderBottom: "1px solid var(--border-color)" }}>
                    <span style={{ fontWeight: "bold", color: "var(--text-dark)" }}>{cat.name}</span>
                    <span style={{ backgroundColor: "var(--border-color)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.8rem" }}>{cat.products ? cat.products.length : 0} products</span>
                  </li>
                ))}
                {categories.length === 0 && <p style={{ color: "var(--text-light)" }}>No categories found in DB.</p>}
              </ul>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Recent Products</h2>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {products.map((prod: any) => (
                  <li key={prod.id} style={{ padding: "1rem 0", borderBottom: "1px solid var(--border-color)" }}>
                    <div className={styles.flexBetween} style={{ marginBottom: "0.3rem" }}>
                      <strong style={{ color: "var(--primary-color)" }}>{prod.name}</strong>
                      <span style={{ fontWeight: "bold" }}>₹{prod.price}</span>
                    </div>
                    <div className={styles.flexBetween} style={{ fontSize: "0.9rem", color: "var(--text-light)" }}>
                      <span>Cat: {prod.category?.name}</span>
                      <span>Stock: {prod.stock}</span>
                    </div>
                  </li>
                ))}
                {products.length === 0 && <p style={{ color: "var(--text-light)" }}>No products found in DB.</p>}
              </ul>
            </div>
          </aside>

        </div>
      </section>
    </>
  );
}
