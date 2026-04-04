"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Package, ShoppingCart, LogOut, Plus, Search, Loader2,
  CheckCircle2, AlertCircle, Edit3, Layers, BarChart3,
  ArrowRight, Eye, EyeOff,
} from "lucide-react";

type Category = { id: string; name: string; slug: string };
type Product = {
  id: string; name: string; slug: string; description: string;
  price: number; stock: number; categoryId: string;
  category?: { id: string; name: string };
  images: Array<{ id: string; url: string }>;
};
type OrderItem = { id: string; quantity: number; price: number; product: { id: string; name: string } };
type Order = {
  id: string;
  status: "PLACED" | "CONFIRMED" | "PACKED" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  totalAmount: number; createdAt: string;
  user: { id: string; name: string; email: string };
  items: OrderItem[];
};
type ApiSuccess<T> = { success: true; message: string; data: T; meta?: Record<string, unknown> };
type Tab = "products" | "orders";

const ORDER_STATUS_VALUES: Order["status"][] = ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];
const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

function getAuthHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

function statusChipClass(status: string) {
  if (["DELIVERED", "PAID"].includes(status)) return "chip chip-success";
  if (["CANCELLED", "FAILED"].includes(status)) return "chip chip-danger";
  if (["SHIPPED", "OUT_FOR_DELIVERY"].includes(status)) return "chip chip-warning";
  return "chip chip-default";
}

export default function Page() {
  const [token, setToken] = useState<string>("");
  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingProductId, setEditingProductId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(false);

  const [newProduct, setNewProduct] = useState({ name: "", slug: "", description: "", price: "", stock: "", categoryId: "" });
  const [newProductImages, setNewProductImages] = useState<FileList | null>(null);
  const [newCategory, setNewCategory] = useState({ name: "", slug: "" });
  const [editProduct, setEditProduct] = useState({ name: "", slug: "", description: "", price: "", stock: "", categoryId: "" });
  const [editProductImages, setEditProductImages] = useState<FileList | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("admin_token");
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (!token) return;
    void loadAll(token);
  }, [token]);

  // Auto-clear notices
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter((p) =>
      p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q) || (p.category?.name || "").toLowerCase().includes(q)
    );
  }, [products, search]);

  const stats = useMemo(() => ({
    totalProducts: products.length,
    totalOrders: orders.length,
    revenue: orders.filter(o => o.paymentStatus === "PAID").reduce((s, o) => s + o.totalAmount, 0),
    lowStock: products.filter(p => p.stock < 5).length,
  }), [products, orders]);

  function flash(text: string, type: "success" | "error" | "info" = "info") {
    setNotice({ text, type });
  }

  async function apiGet<T>(path: string, authToken?: string): Promise<T> {
    if (!apiBase) throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
    const res = await fetch(`${apiBase}${path}`, { headers: authToken ? getAuthHeaders(authToken) : undefined, cache: "no-store" });
    const body = (await res.json()) as ApiSuccess<T> | { message?: string };
    if (!res.ok || !("success" in body && body.success)) throw new Error((body as { message?: string }).message || "Request failed");
    return body.data;
  }

  async function apiPatch<T>(path: string, payload: unknown, authToken: string): Promise<T> {
    if (!apiBase) throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
    const res = await fetch(`${apiBase}${path}`, { method: "PATCH", headers: { "Content-Type": "application/json", ...getAuthHeaders(authToken) }, body: JSON.stringify(payload) });
    const body = (await res.json()) as ApiSuccess<T> | { message?: string };
    if (!res.ok || !("success" in body && body.success)) throw new Error((body as { message?: string }).message || "Request failed");
    return body.data;
  }

  async function apiPost<T>(path: string, payload: unknown, authToken: string): Promise<T> {
    if (!apiBase) throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
    const res = await fetch(`${apiBase}${path}`, { method: "POST", headers: { "Content-Type": "application/json", ...getAuthHeaders(authToken) }, body: JSON.stringify(payload) });
    const body = (await res.json()) as ApiSuccess<T> | { message?: string };
    if (!res.ok || !("success" in body && body.success)) throw new Error((body as { message?: string }).message || "Request failed");
    return body.data;
  }

  async function apiPostForm<T>(path: string, form: FormData, authToken: string, method = "POST") {
    if (!apiBase) throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
    const res = await fetch(`${apiBase}${path}`, { method, headers: getAuthHeaders(authToken), body: form });
    const body = (await res.json()) as ApiSuccess<T> | { message?: string };
    if (!res.ok || !("success" in body && body.success)) throw new Error((body as { message?: string }).message || "Request failed");
    return body.data;
  }

  async function loadAll(authToken: string) {
    try {
      setLoading(true);
      const [productsData, ordersData, categoriesData] = await Promise.all([
        apiGet<Product[]>("/admin/products?limit=200", authToken),
        apiGet<Order[]>("/admin/orders?limit=200", authToken),
        apiGet<Category[]>("/categories?limit=200"),
      ]);
      setProducts(productsData);
      setOrders(ordersData);
      setCategories(categoriesData);
      setDataLoaded(true);
    } catch (error) {
      flash((error as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function login() {
    try {
      if (!apiBase) throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
      setLoading(true);
      const res = await fetch(`${apiBase}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const body = (await res.json()) as ApiSuccess<{ user: { role: string }; accessToken: string }> | { message?: string };
      if (!res.ok || !("success" in body && body.success)) throw new Error((body as { message?: string }).message || "Login failed");
      if (body.data.user.role !== "ADMIN") throw new Error("Only ADMIN users can access this panel");
      window.localStorage.setItem("admin_token", body.data.accessToken);
      setToken(body.data.accessToken);
    } catch (error) {
      flash((error as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function createProduct() {
    try {
      if (!token) return;
      setLoading(true);
      const form = new FormData();
      form.append("name", newProduct.name); form.append("slug", newProduct.slug);
      form.append("description", newProduct.description); form.append("price", newProduct.price);
      form.append("stock", newProduct.stock); form.append("categoryId", newProduct.categoryId);
      if (newProductImages) Array.from(newProductImages).forEach((file) => form.append("images", file));
      await apiPostForm("/admin/products", form, token, "POST");
      setNewProduct({ name: "", slug: "", description: "", price: "", stock: "", categoryId: "" });
      setNewProductImages(null); setShowCreateProduct(false);
      await loadAll(token);
      flash("Product created successfully!", "success");
    } catch (error) { flash((error as Error).message, "error"); }
    finally { setLoading(false); }
  }

  async function createCategory() {
    try {
      if (!token || !newCategory.name.trim() || !newCategory.slug.trim()) throw new Error("Name and slug are required");
      setLoading(true);
      await apiPost<Category>("/categories", { name: newCategory.name.trim(), slug: newCategory.slug.trim() }, token);
      setNewCategory({ name: "", slug: "" }); setShowCreateCategory(false);
      await loadAll(token);
      flash("Category created!", "success");
    } catch (error) { flash((error as Error).message, "error"); }
    finally { setLoading(false); }
  }

  function startEdit(product: Product) {
    setEditingProductId(product.id);
    setEditProduct({ name: product.name, slug: product.slug, description: product.description, price: String(product.price), stock: String(product.stock), categoryId: product.categoryId });
    setEditProductImages(null);
  }

  async function saveEdit(productId: string) {
    try {
      if (!token) return;
      setLoading(true);
      const form = new FormData();
      form.append("name", editProduct.name); form.append("slug", editProduct.slug);
      form.append("description", editProduct.description); form.append("price", editProduct.price);
      form.append("stock", editProduct.stock); form.append("categoryId", editProduct.categoryId);
      if (editProductImages) Array.from(editProductImages).forEach((file) => form.append("images", file));
      await apiPostForm(`/admin/products/${productId}`, form, token, "PATCH");
      setEditingProductId(""); setEditProductImages(null);
      await loadAll(token);
      flash("Product updated!", "success");
    } catch (error) { flash((error as Error).message, "error"); }
    finally { setLoading(false); }
  }

  async function updateStock(productId: string, stock: number) {
    try { if (!token) return; await apiPatch(`/admin/products/${productId}/stock`, { stock }, token); await loadAll(token); flash("Stock updated", "success"); }
    catch (error) { flash((error as Error).message, "error"); }
  }

  async function updateOrderStatus(orderId: string, status: Order["status"]) {
    try { if (!token) return; await apiPatch(`/admin/orders/${orderId}/status`, { status }, token); await loadAll(token); flash(`Order status → ${status}`, "success"); }
    catch (error) { flash((error as Error).message, "error"); }
  }

  function logout() {
    window.localStorage.removeItem("admin_token");
    setToken(""); setProducts([]); setOrders([]); setDataLoaded(false);
  }

  // ═══════════ LOGIN SCREEN ═══════════
  if (!token) {
    return (
      <main className="login-screen">
        <div className="login-card">
          <h1 style={{ fontFamily: "'Playfair Display', serif" }}>SN HandCrafts</h1>
          <p className="login-card-sub">Admin Dashboard</p>
          <div className="glass-card" style={{ padding: "2rem" }}>
            {loading && <div className="progress-bar" style={{ position: "absolute", top: 0, left: 0, right: 0, borderRadius: 0 }} />}
            <div style={{ marginBottom: "1rem" }}>
              <label className="form-label" style={{ color: "var(--text-2)" }}>Email</label>
              <input type="email" placeholder="admin@snhandcrafts.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <label className="form-label" style={{ color: "var(--text-2)" }}>Password</label>
              <div style={{ position: "relative" }}>
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && login()}
                  style={{ paddingRight: "2.5rem" }}
                />
                <button onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button className="btn-primary" onClick={login} disabled={loading} style={{ width: "100%", padding: "0.8rem", justifyContent: "center" }}>
              {loading ? <><span className="spinner spinner-white" style={{ width: 18, height: 18 }} /> Signing in…</> : <>Sign In <ArrowRight size={16} /></>}
            </button>
            {notice && (
              <div className="banner" style={{ marginTop: "1rem", borderLeft: `3px solid ${notice.type === "error" ? "var(--danger)" : "var(--ok)"}` }}>
                {notice.type === "error" ? <AlertCircle size={16} color="var(--danger)" /> : <CheckCircle2 size={16} color="var(--ok)" />}
                {notice.text}
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  // ═══════════ ADMIN DASHBOARD ═══════════
  return (
    <main>
      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar-brand">SN HandCrafts</div>
          <div className="admin-sidebar-sub">Admin Panel</div>
          <nav className="admin-nav">
            <button className={`admin-nav-item ${activeTab === "products" ? "active" : ""}`} onClick={() => setActiveTab("products")}>
              <Package size={18} /> Products
            </button>
            <button className={`admin-nav-item ${activeTab === "orders" ? "active" : ""}`} onClick={() => setActiveTab("orders")}>
              <ShoppingCart size={18} /> Orders
            </button>
          </nav>
          <button className="admin-logout-btn" onClick={logout}>
            <LogOut size={18} /> Logout
          </button>
        </aside>

        {/* Main content */}
        <div className="admin-main">
          {/* Global loading bar */}
          {loading && <div className="progress-bar" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100 }} />}

          {/* Toast */}
          {notice && (
            <div style={{
              position: "fixed", bottom: 24, right: 24, zIndex: 1000,
              padding: "0.8rem 1.25rem", borderRadius: "var(--radius-sm)",
              background: "var(--surface-dark)", color: "#f2efe9", fontSize: "0.85rem",
              fontWeight: 500, boxShadow: "var(--shadow-lg)",
              animation: "fadeInUp 0.35s var(--ease) both",
              borderLeft: `4px solid ${notice.type === "error" ? "var(--danger)" : notice.type === "success" ? "var(--ok)" : "var(--brand-2)"}`,
              display: "flex", alignItems: "center", gap: "0.5rem", maxWidth: 360,
            }}>
              {notice.type === "success" ? <CheckCircle2 size={16} /> : notice.type === "error" ? <AlertCircle size={16} /> : <Loader2 size={16} />}
              {notice.text}
            </div>
          )}

          {/* Top bar */}
          <div className="admin-topbar">
            <div>
              <h1>{activeTab === "products" ? "Products" : "Orders"}</h1>
              <p className="admin-topbar-sub">
                {activeTab === "products" ? "Manage your product catalog, stock, and categories." : "Track and manage customer orders."}
              </p>
            </div>
            {activeTab === "products" && (
              <div className="btn-group">
                <button className="btn-secondary" onClick={() => { setShowCreateCategory(!showCreateCategory); setShowCreateProduct(false); }}>
                  <Layers size={15} /> Category
                </button>
                <button className="btn-primary" onClick={() => { setShowCreateProduct(!showCreateProduct); setShowCreateCategory(false); }}>
                  <Plus size={15} /> Product
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          {dataLoaded && (
            <div className="stat-grid">
              <div className="stat-card" style={{ animationDelay: "0.05s" }}>
                <div className="stat-card-label">Total Products</div>
                <div className="stat-card-value">{stats.totalProducts}</div>
              </div>
              <div className="stat-card" style={{ animationDelay: "0.1s" }}>
                <div className="stat-card-label">Total Orders</div>
                <div className="stat-card-value">{stats.totalOrders}</div>
              </div>
              <div className="stat-card" style={{ animationDelay: "0.15s" }}>
                <div className="stat-card-label">Revenue</div>
                <div className="stat-card-value">₹{stats.revenue.toLocaleString()}</div>
              </div>
              <div className="stat-card" style={{ animationDelay: "0.2s" }}>
                <div className="stat-card-label">Low Stock</div>
                <div className="stat-card-value" style={{ color: stats.lowStock > 0 ? "var(--danger)" : "var(--ok)" }}>{stats.lowStock}</div>
              </div>
            </div>
          )}

          {/* ═══ PRODUCTS TAB ═══ */}
          {activeTab === "products" && (
            <>
              {/* Create category */}
              {showCreateCategory && (
                <div className="card" style={{ marginBottom: "1rem", animation: "slideDown 0.3s var(--ease) both" }}>
                  <div className="card-header"><h2>New Category</h2></div>
                  <div className="card-body">
                    <div className="form-grid">
                      <div className="form-group"><label className="form-label">Name</label><input placeholder="e.g. Pottery" value={newCategory.name} onChange={(e) => setNewCategory((p) => ({ ...p, name: e.target.value }))} /></div>
                      <div className="form-group"><label className="form-label">Slug</label><input placeholder="e.g. pottery" value={newCategory.slug} onChange={(e) => setNewCategory((p) => ({ ...p, slug: e.target.value }))} /></div>
                      <div className="form-group" style={{ justifyContent: "flex-end" }}><button className="btn-accent" onClick={createCategory} disabled={loading}>{loading ? <span className="spinner spinner-white" style={{ width: 16, height: 16 }} /> : <Plus size={15} />} Create</button></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Create product */}
              {showCreateProduct && (
                <div className="card" style={{ marginBottom: "1rem", animation: "slideDown 0.3s var(--ease) both" }}>
                  <div className="card-header"><h2>New Product</h2></div>
                  <div className="card-body">
                    <div className="form-grid">
                      <div className="form-group"><label className="form-label">Name</label><input placeholder="Product name" value={newProduct.name} onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))} /></div>
                      <div className="form-group"><label className="form-label">Slug</label><input placeholder="product-slug" value={newProduct.slug} onChange={(e) => setNewProduct((p) => ({ ...p, slug: e.target.value }))} /></div>
                      <div className="form-group"><label className="form-label">Price (₹)</label><input type="number" placeholder="0" value={newProduct.price} onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))} /></div>
                      <div className="form-group"><label className="form-label">Stock</label><input type="number" placeholder="0" value={newProduct.stock} onChange={(e) => setNewProduct((p) => ({ ...p, stock: e.target.value }))} /></div>
                      <div className="form-group"><label className="form-label">Category</label>
                        <select value={newProduct.categoryId} onChange={(e) => setNewProduct((p) => ({ ...p, categoryId: e.target.value }))}>
                          <option value="">Select category</option>
                          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-group" style={{ marginTop: "0.85rem" }}>
                      <label className="form-label">Description</label>
                      <textarea placeholder="Product description..." value={newProduct.description} onChange={(e) => setNewProduct((p) => ({ ...p, description: e.target.value }))} />
                    </div>
                    <div className="row" style={{ marginTop: "0.85rem", justifyContent: "space-between" }}>
                      <input type="file" multiple accept="image/*" onChange={(e) => setNewProductImages(e.target.files)} style={{ flex: 1 }} />
                      <button className="btn-primary" onClick={createProduct} disabled={loading}>
                        {loading ? <span className="spinner spinner-white" style={{ width: 16, height: 16 }} /> : <Plus size={15} />} Create Product
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Products table */}
              <div className="card">
                <div className="card-header">
                  <h2>All Products</h2>
                  <div className="search-input" style={{ width: 240 }}>
                    <Search size={16} />
                    <input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>
                </div>
                <div className="tableWrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Images</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product, i) => (
                        <tr key={product.id} style={{ animationDelay: `${i * 0.03}s` }}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{product.name}</div>
                            <div style={{ color: "var(--muted)", fontSize: "0.75rem" }}>{product.slug}</div>
                          </td>
                          <td><span className="chip chip-brand">{product.category?.name || "—"}</span></td>
                          <td style={{ fontWeight: 600 }}>₹{product.price.toLocaleString()}</td>
                          <td>
                            <span className={`chip ${product.stock < 5 ? "chip-danger" : product.stock < 20 ? "chip-warning" : "chip-success"}`}>
                              {product.stock}
                            </span>
                          </td>
                          <td>{product.images.length}</td>
                          <td>
                            <div className="btn-group">
                              <button className="btn-icon" title="Edit" onClick={() => startEdit(product)}><Edit3 size={15} /></button>
                              <button className="btn-secondary" style={{ fontSize: "0.78rem", padding: "0.45rem 0.75rem" }}
                                onClick={() => {
                                  const val = window.prompt("Enter new stock", String(product.stock));
                                  if (val === null) return;
                                  const stock = Number(val);
                                  if (!Number.isInteger(stock) || stock < 0) { flash("Stock must be a non-negative integer", "error"); return; }
                                  void updateStock(product.id, stock);
                                }}>
                                Update Stock
                              </button>
                            </div>
                            {editingProductId === product.id && (
                              <div className="card" style={{ marginTop: 12, padding: "1rem", animation: "slideDown 0.3s var(--ease) both" }}>
                                <div className="form-grid">
                                  <div className="form-group"><label className="form-label">Name</label><input value={editProduct.name} onChange={(e) => setEditProduct((p) => ({ ...p, name: e.target.value }))} /></div>
                                  <div className="form-group"><label className="form-label">Slug</label><input value={editProduct.slug} onChange={(e) => setEditProduct((p) => ({ ...p, slug: e.target.value }))} /></div>
                                  <div className="form-group"><label className="form-label">Price</label><input type="number" value={editProduct.price} onChange={(e) => setEditProduct((p) => ({ ...p, price: e.target.value }))} /></div>
                                  <div className="form-group"><label className="form-label">Stock</label><input type="number" value={editProduct.stock} onChange={(e) => setEditProduct((p) => ({ ...p, stock: e.target.value }))} /></div>
                                  <div className="form-group"><label className="form-label">Category</label>
                                    <select value={editProduct.categoryId} onChange={(e) => setEditProduct((p) => ({ ...p, categoryId: e.target.value }))}>
                                      <option value="">Select</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                  </div>
                                </div>
                                <div className="form-group" style={{ marginTop: "0.75rem" }}>
                                  <textarea value={editProduct.description} onChange={(e) => setEditProduct((p) => ({ ...p, description: e.target.value }))} />
                                </div>
                                <div className="row" style={{ marginTop: "0.75rem", justifyContent: "space-between" }}>
                                  <input type="file" multiple accept="image/*" onChange={(e) => setEditProductImages(e.target.files)} />
                                  <div className="btn-group">
                                    <button className="btn-secondary" onClick={() => setEditingProductId("")}>Cancel</button>
                                    <button className="btn-primary" onClick={() => saveEdit(product.id)}>Save Changes</button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredProducts.length === 0 && (
                        <tr><td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>
                          {loading ? <span className="spinner spinner-lg" /> : "No products found."}
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ═══ ORDERS TAB ═══ */}
          {activeTab === "orders" && (
            <div className="card">
              <div className="card-header"><h2>All Orders</h2></div>
              <div className="tableWrap">
                <table>
                  <thead>
                    <tr>
                      <th>Order</th><th>Customer</th><th>Amount</th><th>Payment</th><th>Status</th><th>Items</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, i) => (
                      <tr key={order.id} style={{ animationDelay: `${i * 0.03}s` }}>
                        <td>
                          <div style={{ fontWeight: 600, fontFamily: "monospace", fontSize: "0.8rem" }}>{order.id.slice(0, 10)}…</div>
                          <div style={{ color: "var(--muted)", fontSize: "0.75rem" }}>{new Date(order.createdAt).toLocaleString()}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{order.user.name}</div>
                          <div style={{ color: "var(--muted)", fontSize: "0.75rem" }}>{order.user.email}</div>
                        </td>
                        <td style={{ fontWeight: 600 }}>₹{order.totalAmount.toLocaleString()}</td>
                        <td><span className={statusChipClass(order.paymentStatus)}>{order.paymentStatus}</span></td>
                        <td><span className={statusChipClass(order.status)}>{order.status}</span></td>
                        <td>
                          {order.items.map((item) => (
                            <div key={item.id} style={{ fontSize: "0.78rem", color: "var(--text-2)" }}>
                              {item.product.name} × {item.quantity}
                            </div>
                          ))}
                        </td>
                        <td>
                          <select value={order.status} onChange={(e) => void updateOrderStatus(order.id, e.target.value as Order["status"])} style={{ fontSize: "0.82rem", padding: "0.4rem 0.6rem" }}>
                            {ORDER_STATUS_VALUES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr><td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>
                        {loading ? <span className="spinner spinner-lg" /> : "No orders yet."}
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
