import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, Truck, Shield, Package } from "lucide-react";
import styles from "../../inner.module.css";
import ProductDetailActions from "../../../components/ProductDetailActions";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let product: any = null;
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
    // Assuming API accepts ID or slug on this endpoint
    const res = await fetch(`${apiUrl}/products/${id}`, { next: { revalidate: 60 } });
    const data = await res.json();
    if (data.success) {
      product = data.data;
    }
  } catch (e) {
    console.error("Failed to fetch product details", e);
  }

  if (!product) {
    notFound();
  }

  const heroImage = product.images[0]?.url;

  return (
    <>
      <section
        className={styles.pageContent}
        style={{ paddingTop: "7rem", paddingBottom: "3rem", backgroundColor: "var(--background-color)" }}
      >
        <div className="pattern2-bg"></div>
        <div className={`container ${styles.threeColumn}`}>
          <div>
            <div
              className={styles.productImage}
              style={{
                height: "500px",
                borderRadius: "12px",
                backgroundColor: "var(--linen)",
                backgroundImage: heroImage ? `url(${heroImage})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {!heroImage ? <Package size={38} color="var(--text-muted)" /> : null}
            </div>
            {product.images.length > 1 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.65rem", marginTop: "0.75rem" }}>
                {product.images.slice(0, 4).map((img: any) => (
                  <div
                    key={img.id}
                    style={{
                      height: "80px",
                      borderRadius: "8px",
                      backgroundImage: `url(${img.url})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      border: "1px solid var(--border)",
                    }}
                  ></div>
                ))}
              </div>
            ) : null}
          </div>

          <div className={styles.card} style={{ backgroundColor: "rgba(253, 251, 247, 0.95)" }}>
            <div className={styles.flexBetween} style={{ marginBottom: "0.5rem" }}>
              <span style={{ color: "var(--text-light)", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "1px" }}>
                {product.category?.name ?? "Handcrafted"}
              </span>
              <div style={{ display: "flex", color: "#d4af37" }}>
                <Star size={16} />
                <Star size={16} />
                <Star size={16} />
                <Star size={16} />
                <Star size={16} />
              </div>
            </div>

            <h1 className={styles.productName} style={{ fontSize: "2.1rem", marginBottom: "0.75rem" }}>
              {product.name}
            </h1>
            <p className={styles.productPrice} style={{ fontSize: "1.8rem" }}>
              ₹{Number(product.price).toLocaleString()}
            </p>

            <p style={{ color: "var(--text-light)", lineHeight: 1.6, marginBottom: "1.5rem" }}>
              {product.description}
            </p>

            <p style={{ marginBottom: "1.25rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              In stock: <strong>{product.stock}</strong>
            </p>

            <ProductDetailActions
              product={{
                id: product.id,
                name: product.name,
                price: Number(product.price),
                images: product.images.map((image: any) => ({ id: image.id, url: image.url })),
              }}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                borderTop: "1px solid var(--border)",
                paddingTop: "1.25rem",
              }}
            >
              <div style={{ display: "flex", gap: "0.65rem", alignItems: "center", color: "var(--text-dark)" }}>
                <Truck size={20} color="var(--terracotta)" />
                <span>Free shipping across India on orders above ₹2000</span>
              </div>
              <div style={{ display: "flex", gap: "0.65rem", alignItems: "center", color: "var(--text-dark)" }}>
                <Shield size={20} color="var(--terracotta)" />
                <span>Authenticity assurance with every handcrafted piece</span>
              </div>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <Link href="/products" style={{ color: "var(--terracotta)", textDecoration: "underline" }}>
                Back to all products
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
