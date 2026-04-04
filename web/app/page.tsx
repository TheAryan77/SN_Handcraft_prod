import Link from "next/link";
import {
  ArrowRight,
  ShoppingBag,
  Star,
  Heart,
  Truck,
  RotateCcw,
  Users,
  HandMetal,
  Sparkles,
  Package,
  Gift,
  ChevronRight,
  Quote,
  Camera,
} from "lucide-react";
import styles from "./home.module.css";
import ProductCardGrid from "../components/ProductCardGrid";

/* ——— Wavy SVG Divider component ——— */
function WavyDivider({
  fill = "var(--bg-alt)",
  flip = false,
}: {
  fill?: string;
  flip?: boolean;
}) {
  return (
    <div
      className="wavy-divider"
      style={{ transform: flip ? "rotate(180deg)" : "none" }}
    >
      <svg viewBox="0 0 1440 24" preserveAspectRatio="none">
        <path
          d="M0,12 C120,20 240,4 360,12 C480,20 600,4 720,12 C840,20 960,4 1080,12 C1200,20 1320,4 1440,12 L1440,24 L0,24 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}

/* ——— Star rating helper ——— */
function StarRating({ rating }: { rating: number }) {
  return (
    <div className={styles.starRating}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          fill={i <= rating ? "#d4a96a" : "transparent"}
          stroke={i <= rating ? "#d4a96a" : "#ccc"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

/* ===== Default category images for rendering when db has no images ===== */
const categoryFallbacks: Record<string, { image: string; color: string }> = {
  pottery: { image: "/cat-pottery.png", color: "#e8ddd0" },
  textiles: { image: "/cat-textiles.png", color: "#ede8f5" },
  woodwork: { image: "/cat-woodwork.png", color: "#dde8dd" },
  jewellery: { image: "/cat-jewellery.png", color: "#e8ddd0" },
  "wall art": { image: "/cat-wallart.png", color: "#ede8f5" },
};

const defaultCategories = [
  { id: "pottery", name: "Pottery", image: "/cat-pottery.png" },
  { id: "textiles", name: "Textiles", image: "/cat-textiles.png" },
  { id: "woodwork", name: "Woodwork", image: "/cat-woodwork.png" },
  { id: "jewellery", name: "Jewellery", image: "/cat-jewellery.png" },
  { id: "wall-art", name: "Wall Art", image: "/cat-wallart.png" },
];

export default async function Home() {
  let dbCategories: any[] = [];
  let dbProducts: any[] = [];
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
    // Using fetch directly in the server component
    const [catsRes, prodsRes] = await Promise.all([
      fetch(`${apiUrl}/categories`, { next: { revalidate: 60 } }),
      fetch(`${apiUrl}/products?limit=8`, { next: { revalidate: 60 } })
    ]);
    const catsData = await catsRes.json();
    const prodsData = await prodsRes.json();
    if (catsData.success) dbCategories = catsData.data;
    if (prodsData.success) dbProducts = prodsData.data;
  } catch (e) {
    console.error("Failed to load initial data", e);
  }

  const categories =
    dbCategories.length > 0
      ? dbCategories.map((cat) => {
        const firstProductImage = cat?.products?.[0]?.images?.[0]?.url;
        const key = cat.name.toLowerCase();
        const fallback = categoryFallbacks[key] || {
          image: "/cat-pottery.png",
          color: "#e8ddd0",
        };

        return {
          id: cat.id,
          name: cat.name,
          image: firstProductImage || fallback.image,
        };
      })
      : defaultCategories;

  return (
    <>
      {/* ========================================
          1. HERO — Full-width visual + tagline
          ======================================== */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <img
            src="/hero-artisan.png"
            alt="Indian artisan crafting pottery"
            className={styles.heroBgImage}
          />
          <div className={styles.heroOverlay} />
        </div>
        <div className="pattern-blockprint" />
        <div className={`${styles.heroContent} animate-fade-in`}>
          <div className={`${styles.heroTag} animate-fade-in-down`}>
            <Sparkles size={14} strokeWidth={1.5} />
            <span>Handcrafted in India</span>
          </div>
          <h1 className={`${styles.heroTitle} animate-fade-in-up delay-1`}>
            Handmade with love,
            <br />
            rooted in tradition.
          </h1>
          <p className={`${styles.heroSub} animate-fade-in-up delay-2`}>
            Each piece tells a story — crafted by artisan hands using techniques
            passed down through generations. Discover pottery, textiles,
            woodwork and more.
          </p>
          <div className={`${styles.heroCtas} animate-fade-in-up delay-3`}>
            <Link href="/products" className="btn-primary">
              <ShoppingBag size={18} strokeWidth={1.5} />
              Shop now
            </Link>
            <Link href="/artisan-story" className="btn-secondary">
              Explore our craft
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================
          2. TRUST BAR — Quick stats
          ======================================== */}
      <section className={`${styles.trustBar} animate-fade-in`}>
        <div className={styles.trustBarInner}>
          <div className={`${styles.trustItem} animate-fade-in-up delay-1`}>
            <HandMetal size={22} strokeWidth={1.5} />
            <span>100% Handmade</span>
          </div>
          <div className={styles.trustDivider} />
          <div className={`${styles.trustItem} animate-fade-in-up delay-2`}>
            <Users size={22} strokeWidth={1.5} />
            <span>500+ Artisans</span>
          </div>
          <div className={styles.trustDivider} />
          <div className={`${styles.trustItem} animate-fade-in-up delay-3`}>
            <Truck size={22} strokeWidth={1.5} />
            <span>Ships Across India</span>
          </div>
          <div className={styles.trustDivider} />
          <div className={`${styles.trustItem} animate-fade-in-up delay-4`}>
            <RotateCcw size={22} strokeWidth={1.5} />
            <span>Free Returns</span>
          </div>
        </div>
      </section>

      <WavyDivider fill="var(--bg-alt)" />

      {/* ========================================
          3. SHOP BY CATEGORY — Visual tiles
          ======================================== */}
      <section className={`${styles.sectionAlt} animate-fade-in`}>
        <div className="pattern-warli" />
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <h2 className={`section-title animate-fade-in-down`}>Shop by Category</h2>
          <p className={`section-subtitle animate-fade-in-up delay-1`}>
            Explore our curated collections of authentic Indian handicrafts,
            each made by skilled artisans.
          </p>
          <div className={`${styles.categoryGrid} animate-fade-in-up delay-2`}>
            {categories.map((cat) => (
              <Link
                href={`/products?category=${cat.id}`}
                key={cat.id}
                className={styles.categoryTile}
              >
                <div className={styles.categoryImageWrap}>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className={styles.categoryImage}
                  />
                </div>
                <h3 className={styles.categoryName}>{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <WavyDivider fill="var(--bg-primary)" flip />

      {/* ========================================
          4. FEATURED / BESTSELLER PRODUCTS
          ======================================== */}
      <section className={styles.sectionPrimary}>
        <div className="container">
          <h2 className="section-title">Bestsellers</h2>
          <p className="section-subtitle">
            Our most-loved pieces — handpicked by fellow craft lovers across
            India.
          </p>
          <ProductCardGrid
            products={dbProducts.map((p: any) => ({
              id: p.id,
              name: p.name,
              price: Number(p.price),
              images: p.images?.map((img: any) => ({ id: img.id, url: img.url })) || [],
            }))}
          />
          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <Link href="/products" className="btn-secondary">
              View All Products{" "}
              <ArrowRight size={16} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>

      <WavyDivider fill="var(--bg-alt)" />

      {/* ========================================
          5. OUR STORY — The Artisan Brand
          ======================================== */}
      <section className={styles.storySection}>
        <div className="pattern-honeycomb" />
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div className={styles.storyGrid}>
            <div className={styles.storyImageCol}>
              <div className={styles.storyImageFrame}>
                <img
                  src="/artisan-weaving.png"
                  alt="Indian artisan weaving on a handloom"
                  className={styles.storyImage}
                />
              </div>
            </div>
            <div className={styles.storyTextCol}>
              <p className={styles.storySuptitle}>Our Story</p>
              <h2
                className={styles.storyHeading}
                style={{ textAlign: "left" }}
              >
                Rooted in tradition,
                <br />
                delivered with love.
              </h2>
              <p className={styles.storyText}>
                SN HandCrafts was founded with a simple mission — to bring the
                beauty of India&apos;s handcraft traditions to every home. Made
                by hand in workshops across Rajasthan, Assam, and beyond, every
                product supports local craftspeople and keeps centuries-old
                techniques alive.
              </p>
              <p className={styles.storyText}>
                When you purchase from us, you are not just buying an item; you
                are supporting a family, empowering rural communities, and
                preserving Indian heritage for the next generation.
              </p>
              <p className={styles.storySignature}>
                — SN HandCrafts, est. 2024
              </p>
              <Link href="/about" className="btn-primary">
                Read Our Full Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      <WavyDivider fill="var(--bg-primary)" flip />

      {/* ========================================
          6. HOW IT'S MADE — Craft Process
          ======================================== */}
      <section className={styles.sectionPrimary}>
        <div className="container">
          <h2 className="section-title">How It&apos;s Made</h2>
          <p className="section-subtitle">
            From raw material to your doorstep — every piece passes through
            careful, loving hands.
          </p>
          <div className={styles.processGrid}>
            {[
              {
                step: "01",
                title: "Raw Materials",
                desc: "Natural clay, wood, fibre and metals sourced locally and sustainably.",
                icon: "🪵",
              },
              {
                step: "02",
                title: "Artisan Crafting",
                desc: "Skilled artisans shape, carve and weave using techniques passed down for generations.",
                icon: "🏺",
              },
              {
                step: "03",
                title: "Finishing",
                desc: "Each piece is hand-finished, polished or glazed to perfection.",
                icon: "✨",
              },
              {
                step: "04",
                title: "Delivered to You",
                desc: "Carefully packed and shipped with love straight from our workshop to your home.",
                icon: "📦",
              },
            ].map((item) => (
              <div key={item.step} className={styles.processStep}>
                <div className={styles.processIcon}>{item.icon}</div>
                <span className={styles.processNumber}>{item.step}</span>
                <h3 className={styles.processTitle}>{item.title}</h3>
                <p className={styles.processDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          7. SPECIAL OFFER / SEASONAL BANNER
          ======================================== */}
      <section className={styles.offerBanner}>
        <div className="pattern-blockprint" style={{ opacity: 0.08 }} />
        <div className={styles.offerInner}>
          <div className={styles.offerText}>
            <span className={styles.offerTag}>Limited Time</span>
            <h2 className={styles.offerHeading}>Festive Collection Now Live</h2>
            <p className={styles.offerSub}>
              Free shipping on orders above ₹999 · Handpicked festive specials
            </p>
          </div>
          <Link href="/products" className={styles.offerBtn}>
            Shop the collection <ChevronRight size={18} strokeWidth={1.5} />
          </Link>
        </div>
      </section>

      <WavyDivider fill="var(--bg-alt)" />

      {/* ========================================
          8. CUSTOMER REVIEWS & PHOTOS
          ======================================== */}
      <section className={styles.sectionAlt}>
        <div className="container">
          <h2 className="section-title">Loved by Customers</h2>
          <p className="section-subtitle">
            Real reviews from real people — see why over 5,000 customers trust
            SN HandCrafts.
          </p>
          <div className={styles.reviewGrid}>
            {[
              {
                name: "Priya Sharma",
                loc: "Mumbai",
                rating: 5,
                review:
                  "The blue pottery vase is absolutely stunning. The craftsmanship is impeccable — you can feel the artisan's touch in every detail.",
                product: "Blue Pottery Vase",
              },
              {
                name: "Ankit Mehta",
                loc: "Bangalore",
                rating: 5,
                review:
                  "Ordered a bamboo tray set for our anniversary. Beautifully packaged and the quality is incredible for the price.",
                product: "Bamboo Tray Set",
              },
              {
                name: "Sneha Reddy",
                loc: "Hyderabad",
                rating: 4,
                review:
                  "Love the block print cushion covers! They add such a warm, authentic touch to my living room. Will definitely order more.",
                product: "Block Print Cushions",
              },
              {
                name: "Rajesh Kumar",
                loc: "Delhi",
                rating: 5,
                review:
                  "The brass necklace was a perfect gift for my wife. She absolutely loves it. Great quality, great packaging.",
                product: "Brass Necklace",
              },
            ].map((r, i) => (
              <div key={i} className={styles.reviewCard}>
                <StarRating rating={r.rating} />
                <p className={styles.reviewText}>&ldquo;{r.review}&rdquo;</p>
                <div className={styles.reviewMeta}>
                  <div className={styles.reviewAvatar}>
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <p className={styles.reviewName}>{r.name}</p>
                    <p className={styles.reviewLoc}>
                      {r.loc} · {r.product}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WavyDivider fill="var(--bg-primary)" flip />

      {/* ========================================
          9. INSTAGRAM / UGC GALLERY
          ======================================== */}
      <section className={styles.sectionPrimary}>
        <div className="container">
          <h2 className="section-title">
            <Camera
              size={24}
              strokeWidth={1.5}
              style={{ display: "inline", verticalAlign: "middle" }}
            />{" "}
            @snhandcrafts
          </h2>
          <p className="section-subtitle">
            Tag us in your photos — we love seeing our crafts in your home.
          </p>
          <div className={styles.instaGrid}>
            {[
              "/cat-pottery.png",
              "/craft-flatlay.png",
              "/cat-textiles.png",
              "/cat-woodwork.png",
              "/cat-jewellery.png",
              "/cat-wallart.png",
            ].map((img, i) => (
              <div key={i} className={styles.instaItem}>
                <img src={img} alt={`Customer photo ${i + 1}`} />
                <div className={styles.instaOverlay}>
                  <Heart size={20} fill="white" stroke="white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          10. CUSTOM / BULK ORDER CTA
          ======================================== */}
      <section className={styles.customCta}>
        <div className="pattern-honeycomb" style={{ opacity: 0.04 }} />
        <div className={styles.customCtaInner}>
          <div className={styles.customCtaText}>
            <Gift
              size={28}
              strokeWidth={1.5}
              color="var(--wheat-gold)"
              style={{ marginBottom: "0.75rem" }}
            />
            <h2 className={styles.customCtaHeading}>
              Need a Custom Order?
            </h2>
            <p className={styles.customCtaSub}>
              Corporate gifting, weddings, bulk orders — we handcraft to your
              design. Tell us what you need and our artisans will bring it to
              life.
            </p>
          </div>
          <Link href="/contact" className={styles.customCtaBtn}>
            Get in Touch <ArrowRight size={16} strokeWidth={1.5} />
          </Link>
        </div>
      </section>

      <WavyDivider fill="var(--bg-alt)" />

      {/* ========================================
          11. NEWSLETTER SIGNUP
          ======================================== */}
      <section className={styles.newsletter}>
        <div className="pattern-blockprint" style={{ opacity: 0.06 }} />
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <h2 className={styles.newsletterHeading}>
            Join Our Craft Community
          </h2>
          <p className={styles.newsletterSub}>
            Get 10% off your first order + early access to new collections and
            artisan stories.
          </p>
          <div className={styles.newsletterForm}>
            <input
              type="email"
              placeholder="Enter your email address"
              className={styles.newsletterInput}
            />
            <button className={styles.newsletterBtn}>Subscribe</button>
          </div>
        </div>
      </section>
    </>
  );
}
