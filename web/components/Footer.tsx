import Link from "next/link";
import styles from "./Footer.module.css";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Diagonal weave pattern */}
      <div className="pattern-weave" />

      <div className={styles.container}>
        {/* Brand column */}
        <div className={styles.brand}>
          <h2>
            SN <span className={styles.brandAccent}>HandCrafts</span>
          </h2>
          <p>
            Authentic Indian handcrafted products — made by artisan hands,
            delivered to your door. Supporting 500+ artisans across India.
          </p>
          <div className={styles.socials}>
            <Link href="#" aria-label="Facebook">
              <Facebook size={18} strokeWidth={1.5} />
            </Link>
            <Link href="#" aria-label="Instagram">
              <Instagram size={18} strokeWidth={1.5} />
            </Link>
            <Link href="#" aria-label="Twitter">
              <Twitter size={18} strokeWidth={1.5} />
            </Link>
            <Link href="#" aria-label="YouTube">
              <Youtube size={18} strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        {/* Shop */}
        <div className={styles.linkCol}>
          <h3>Shop</h3>
          <Link href="/products" className={styles.linkItem}>
            All Products
          </Link>
          <Link href="/products?category=pottery" className={styles.linkItem}>
            Pottery
          </Link>
          <Link href="/products?category=textiles" className={styles.linkItem}>
            Textiles
          </Link>
          <Link href="/products?category=woodwork" className={styles.linkItem}>
            Woodwork
          </Link>
          <Link href="/products?category=jewellery" className={styles.linkItem}>
            Jewellery
          </Link>
        </div>

        {/* Company */}
        <div className={styles.linkCol}>
          <h3>Company</h3>
          <Link href="/about" className={styles.linkItem}>
            About Us
          </Link>
          <Link href="/artisan-story" className={styles.linkItem}>
            Our Craft
          </Link>
          <Link href="/contact" className={styles.linkItem}>
            Contact
          </Link>
        </div>

        {/* Support */}
        <div className={styles.linkCol}>
          <h3>Support</h3>
          <Link href="/faq" className={styles.linkItem}>
            FAQs
          </Link>
          <Link href="/shipping" className={styles.linkItem}>
            Shipping Policy
          </Link>
          <Link href="/returns" className={styles.linkItem}>
            Returns
          </Link>
          <Link href="/terms" className={styles.linkItem}>
            Terms &amp; Conditions
          </Link>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <p>
            &copy; {new Date().getFullYear()} SN HandCrafts. All rights
            reserved.
          </p>
          <div className={styles.paymentLogos}>
            {/* UPI */}
            <span className={styles.payBadge}>UPI</span>
            <span className={styles.payBadge}>Visa</span>
            <span className={styles.payBadge}>Mastercard</span>
            <span className={styles.payBadge}>Razorpay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
