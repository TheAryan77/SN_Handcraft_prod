"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "@/providers/AuthProvider";
import { ChevronDown, Filter, ShoppingBag, Package } from "lucide-react";
import { getApiUrl, authHeaders } from "@/lib/apiClient";
import styles from "../inner.module.css";
import AddToCartModal from "../../components/AddToCartModal";
import WishlistToggleButton from "../../components/WishlistToggleButton";

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  category?: { id: string; name: string };
  images: Array<{ id: string; url: string }>;
};

export function ProductsClient({
  categories,
  products,
}: {
  categories: Category[];
  products: Product[];
}) {
  const { status } = useSession();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [notice, setNotice] = useState<string>("");
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadWishlist() {
      if (status !== "authenticated") {
        setWishlistProductIds([]);
        return;
      }

      const res = await fetch(`${getApiUrl()}/wishlist`, { method: "GET", headers: authHeaders() });
      if (!res.ok) return;
      const body = (await res.json()) as { success: boolean; data?: string[] };
      if (body.success && Array.isArray(body.data)) {
        setWishlistProductIds(body.data);
      }
    }

    void loadWishlist();
  }, [status]);

  const filteredProducts = useMemo(() => {
    if (selectedCategoryId === "all") {
      return products;
    }
    return products.filter(
      (product) => product.categoryId === selectedCategoryId
    );
  }, [products, selectedCategoryId]);

  function openModal(product: Product) {
    if (status !== "authenticated") {
      setNotice("Please login first to add items to cart.");
      return;
    }
    setModalProduct(product);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setModalProduct(null);
  }

  return (
    <>
      <section className={styles.pageHeader}>
        <div className="pattern-weave" style={{ opacity: 0.06 }}></div>
        <h1 className={styles.pageTitle}>Our Handicraft Collection</h1>
        <p className={styles.pageSubtitle}>
          Browse through our curated selection of authentic Indian ethnic crafts.
          Each piece is unique and tells a story of heritage and masterful
          artistry.
        </p>
      </section>

      <section className={styles.pageContent}>
        <div className={`container ${styles.twoColumn}`}>
          <aside className={styles.card} style={{ height: "fit-content" }}>
            <div
              className={styles.flexBetween}
              style={{ marginBottom: "1rem" }}
            >
              <h2
                className={styles.cardTitle}
                style={{ border: "none", margin: 0 }}
              >
                Filters
              </h2>
              <Filter size={18} color="var(--terracotta)" strokeWidth={1.5} />
            </div>

            <div className={styles.formGroup}>
              <h3 className={styles.label}>Category</h3>
              <ul
                style={{ listStyle: "none", padding: 0, marginTop: "0.5rem" }}
              >
                <li
                  style={{
                    margin: "0.6rem 0",
                    color: "var(--text-secondary)",
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                  }}
                >
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategoryId === "all"}
                    onChange={() => setSelectedCategoryId("all")}
                    style={{ accentColor: "var(--terracotta)" }}
                  />
                  All Products
                </li>
                {categories.map((cat) => (
                  <li
                    key={cat.id}
                    style={{
                      margin: "0.6rem 0",
                      color: "var(--text-secondary)",
                      display: "flex",
                      gap: "0.5rem",
                      alignItems: "center",
                      cursor: "pointer",
                      textTransform: "capitalize",
                      fontSize: "0.9rem",
                    }}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={cat.id}
                      checked={selectedCategoryId === cat.id}
                      onChange={() => setSelectedCategoryId(cat.id)}
                      style={{ accentColor: "var(--terracotta)" }}
                    />
                    {cat.name}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div>
            <div
              className={styles.flexBetween}
              style={{
                marginBottom: "1.5rem",
                backgroundColor: "var(--surface)",
                padding: "0.85rem 1rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
              }}
            >
              <span
                style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}
              >
                Showing {filteredProducts.length} Authentic Pieces
              </span>
              <div
                className="btn-secondary"
                style={{
                  padding: "0.4rem 0.85rem",
                  fontSize: "0.8rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                }}
              >
                Sort by: Featured <ChevronDown size={14} />
              </div>
            </div>

            {notice ? (
              <div
                style={{
                  marginBottom: "1rem",
                  padding: "0.75rem 1rem",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  background: "var(--surface)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                }}
              >
                {notice}
              </div>
            ) : null}

            <div className={styles.grid}>
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className={styles.productCard}
                  style={{ position: "relative" }}
                >
                  {status === "authenticated" ? (
                    <WishlistToggleButton
                      productId={prod.id}
                      initialActive={wishlistProductIds.includes(prod.id)}
                      onChanged={(active) => {
                        setWishlistProductIds((prev) => {
                          if (active && !prev.includes(prod.id)) {
                            return [...prev, prod.id];
                          }
                          if (!active) {
                            return prev.filter((id) => id !== prod.id);
                          }
                          return prev;
                        });
                      }}
                    />
                  ) : null}

                  <Link href={`/products/${prod.id}`}>
                    <div
                      className={styles.productImage}
                      style={{
                        backgroundColor: "var(--linen)",
                        backgroundImage: prod.images[0]
                          ? `url(${prod.images[0].url})`
                          : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {!prod.images[0] && (
                        <Package
                          size={32}
                          strokeWidth={1}
                          color="var(--text-muted)"
                        />
                      )}
                    </div>
                    <h3
                      className={styles.productName}
                      style={{ textTransform: "capitalize" }}
                    >
                      {prod.name}
                    </h3>
                    <p className={styles.productPrice}>
                      ₹{Number(prod.price).toLocaleString()}
                    </p>
                  </Link>
                  <button
                    className="btn-primary"
                    style={{
                      width: "100%",
                      marginTop: "0.25rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.4rem",
                      fontSize: "0.85rem",
                    }}
                    onClick={() => openModal(prod)}
                  >
                    <ShoppingBag size={16} strokeWidth={1.5} />
                    Add to Cart
                  </button>
                </div>
              ))}

              {filteredProducts.length === 0 && (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    padding: "4rem",
                    color: "var(--text-muted)",
                  }}
                >
                  <p>No products found for this category.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <AddToCartModal
        product={modalProduct}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
}
