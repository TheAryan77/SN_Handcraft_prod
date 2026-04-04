"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Package } from "lucide-react";
import AddToCartModal from "./AddToCartModal";
import styles from "../app/home.module.css";

type Product = {
  id: string;
  name: string;
  price: number;
  images: Array<{ id: string; url: string }>;
};

export default function ProductCardGrid({
  products,
}: {
  products: Product[];
}) {
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function openModal(product: Product) {
    setModalProduct(product);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setModalProduct(null);
  }

  return (
    <>
      <div className={styles.productGrid}>
        {products.map((prod) => (
          <div key={prod.id} className={styles.productCard}>
            <Link
              href={`/products/${prod.id}`}
              className={styles.productLink}
            >
              <div className={styles.productImageWrap}>
                {prod.images[0] ? (
                  <img
                    src={prod.images[0].url}
                    alt={prod.name}
                    className={styles.productImage}
                  />
                ) : (
                  <div className={styles.productPlaceholder}>
                    <Package
                      size={32}
                      strokeWidth={1}
                      color="var(--text-muted)"
                    />
                  </div>
                )}
                <span className={styles.productBadge}>Handmade</span>
              </div>
              <div className={styles.productInfo}>
                <h3
                  className={styles.productName}
                  style={{ textTransform: "capitalize" }}
                >
                  {prod.name}
                </h3>
                <p className={styles.productPrice}>
                  ₹{prod.price.toLocaleString()}
                </p>
              </div>
            </Link>
            <button
              className={styles.addToCartBtn}
              onClick={() => openModal(prod)}
            >
              <ShoppingBag size={16} strokeWidth={1.5} />
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      <AddToCartModal
        product={modalProduct}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
}
