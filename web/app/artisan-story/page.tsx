import Link from "next/link";
import { HandHeart, Quote, PlayCircle } from "lucide-react";
import styles from "../inner.module.css";
import homeStyles from "../home.module.css"; // Reuse home styles like artisanGrid

export default function ArtisanStoryPage() {
  return (
    <>
      <section className={styles.pageHeader} style={{ backgroundColor: "#8c5b52" }}>
        <div className="mandala-bg" style={{ opacity: 0.2 }}></div>
        <h1 className={styles.pageTitle} style={{ color: "var(--background-color)" }}>The Heart of Creating</h1>
        <p className={styles.pageSubtitle} style={{ color: "var(--background-color)" }}>
          Meet the extraordinary hands and minds behind our collections. Every piece carries the signature of an artisan fighting to keep their ancestral heritage alive.
        </p>
      </section>

      <section className={styles.pageContent} style={{ backgroundColor: "var(--background-color)" }}>
        <div className="pattern2-bg"></div>
        <div className={`container ${styles.grid}`} style={{ gap: "4rem" }}>
          
          <div className={styles.card} style={{ textAlign: "center", border: "none", backgroundColor: "transparent", boxShadow: "none" }}>
            <div style={{ width: "200px", height: "200px", borderRadius: "50%", backgroundColor: "#3d2b1f", margin: "0 auto 1.5rem", overflow: "hidden", border: "4px solid var(--accent-color)" }}>
                <div style={{ width: "100%", height: "100%", backgroundImage: "linear-gradient(rgba(179, 65, 53, 0.4), rgba(179, 65, 53, 0.8)), url('/image.png')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
            </div>
            <h2 className={styles.productName} style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>Lakshmi Devi</h2>
            <p style={{ color: "var(--primary-color)", fontWeight: "bold", marginBottom: "1rem" }}>Master Terracotta Potter</p>
            <p style={{ color: "var(--text-light)", lineHeight: 1.6, marginBottom: "1rem" }}>
              <Quote size={20} style={{ color: "var(--border-color)", marginRight: "10px", display: "inline" }} />
              I was taught to mold clay by my father when I was six. It's not just mud; it's the earth speaking our language. 
            </p>
          </div>

          <div className={styles.card} style={{ textAlign: "center", border: "none", backgroundColor: "transparent", boxShadow: "none" }}>
            <div style={{ width: "200px", height: "200px", borderRadius: "50%", backgroundColor: "#786552", margin: "0 auto 1.5rem", overflow: "hidden", border: "4px solid var(--accent-color)" }}>
                <div style={{ width: "100%", height: "100%", backgroundImage: "linear-gradient(rgba(120, 101, 82, 0.4), rgba(120, 101, 82, 0.8)), url('/mandala.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
            </div>
            <h2 className={styles.productName} style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>Ramesh Kumar</h2>
            <p style={{ color: "var(--primary-color)", fontWeight: "bold", marginBottom: "1rem" }}>Antique Silver Engraver</p>
            <p style={{ color: "var(--text-light)", lineHeight: 1.6, marginBottom: "1rem" }}>
              <Quote size={20} style={{ color: "var(--border-color)", marginRight: "10px", display: "inline" }} />
              Every hammer strike is deliberate. My grandfather used the exact same anvil. That's what gives genuine antique silver its soul.
            </p>
          </div>
          
          <div className={styles.card} style={{ textAlign: "center", border: "none", backgroundColor: "transparent", boxShadow: "none" }}>
            <div style={{ width: "200px", height: "200px", borderRadius: "50%", backgroundColor: "#c6a461", margin: "0 auto 1.5rem", overflow: "hidden", border: "4px solid var(--accent-color)" }}>
                <div style={{ width: "100%", height: "100%", backgroundImage: "linear-gradient(rgba(198, 164, 97, 0.4), rgba(198, 164, 97, 0.8)), url('/pattern2.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
            </div>
            <h2 className={styles.productName} style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>Asha Weavers Collective</h2>
            <p style={{ color: "var(--primary-color)", fontWeight: "bold", marginBottom: "1rem" }}>Ethnic Textiles & Apparel</p>
            <p style={{ color: "var(--text-light)", lineHeight: 1.6, marginBottom: "1rem" }}>
              <Quote size={20} style={{ color: "var(--border-color)", marginRight: "10px", display: "inline" }} />
              We weave the stories of our village into these threads. Partnering with SN Handcrafts allows our women's collective to be independent.
            </p>
          </div>

        </div>
      </section>

      <section style={{ backgroundColor: "var(--primary-color)", padding: "5rem 0", color: "var(--background-color)", position: "relative", textAlign: "center" }}>
          <div className="mandala-bg" style={{ opacity: 0.1 }}></div>
          <div className="container" style={{ position: "relative", zIndex: 2 }}>
            <HandHeart size={64} style={{ color: "var(--accent-color)", margin: "0 auto 2rem" }} />
            <h2 style={{ fontSize: "2.5rem", marginBottom: "1rem", fontFamily: "var(--font-heading)" }}>Support the Artisans directly</h2>
            <p style={{ fontSize: "1.2rem", maxWidth: "600px", margin: "0 auto 2rem", opacity: 0.9 }}>
              When you purchase our authentic pieces, you bypass commercial wholesalers, letting us pass the majority of the profit straight back to these master creators.
            </p>
            <Link href="/products" className="btn-secondary" style={{ borderColor: "var(--accent-color)", color: "var(--accent-color)" }}>
                Explore Handicrafts
            </Link>
          </div>
      </section>
    </>
  );
}
