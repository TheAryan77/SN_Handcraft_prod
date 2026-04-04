import Link from "next/link";
import { Sparkles, Globe, HeartHandshake } from "lucide-react";
import styles from "../inner.module.css";
import homeStyles from "../home.module.css"; // Reuse some home styles

export default function AboutPage() {
  return (
    <>
      <section className={styles.pageHeader} style={{ backgroundImage: "linear-gradient(rgba(61, 43, 31, 0.8), rgba(61, 43, 31, 0.9)), url('/image.png')", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="mandala-bg" style={{ opacity: 0.1 }}></div>
        <h1 className={styles.pageTitle} style={{ color: "var(--background-color)" }}>Our Heritage</h1>
        <p className={styles.pageSubtitle} style={{ color: "var(--border-color)" }}>
          Preserving the soul of India through timeless authentic craftsmanship.
        </p>
      </section>

      <section className={styles.pageContent} style={{ backgroundColor: "var(--background-color)" }}>
        <div className="pattern2-bg"></div>
        <div className={`container ${styles.twoColumn}`} style={{ gap: "4rem", gridTemplateColumns: "1fr 1fr", alignItems: "center" }}>
          
          <div>
            <h2 className="section-title" style={{ textAlign: "left", left: 0, transform: "none", margin: "0 0 2rem" }}>A Decades-Old Legacy</h2>
            <p style={{ fontSize: "1.1rem", lineHeight: 1.8, marginBottom: "1rem", color: "var(--text-light)" }}>
              Founded with a passion for traditional art, SN Handcrafts has grown from a small family initiative into a sprawling platform celebrating India's incredibly diverse ethnic craftsmanship.
            </p>
            <p style={{ fontSize: "1.1rem", lineHeight: 1.8, color: "var(--text-light)" }}>
              Our mission is to bring beautifully wrought, handcrafted treasures directly to your door, cutting out the middlemen. We specialize in everything from intricate antique silver and luxurious velvet boxes to earthy terracotta and royal ethnic apparel.
            </p>
          </div>
          
          <div style={{ position: "relative" }}>
            <div style={{ width: "100%", height: "400px", borderRadius: "8px", backgroundColor: "var(--primary-color)", overflow: "hidden" }}>
                <div style={{ width: "100%", height: "100%", backgroundImage: "linear-gradient(rgba(179, 65, 53, 0.5), rgba(179, 65, 53, 0.9)), url('/mandala.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
            </div>
          </div>

        </div>
      </section>

      <section style={{ backgroundColor: "var(--text-dark)", padding: "4rem 0", color: "var(--white)", position: "relative" }}>
        <div className="mandala-bg" style={{ opacity: 0.1 }}></div>
        <div className={`container ${styles.grid}`} style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            
            <div style={{ textAlign: "center", padding: "2rem" }}>
                <Sparkles size={48} color="var(--accent-color)" style={{ marginBottom: "1rem" }} />
                <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "var(--accent-color)" }}>Authenticity</h3>
                <p style={{ color: "var(--border-color)", lineHeight: 1.6 }}>Every piece is 100% genuine, handcrafted using generations-old traditions.</p>
            </div>
            
            <div style={{ textAlign: "center", padding: "2rem" }}>
                <HeartHandshake size={48} color="var(--accent-color)" style={{ marginBottom: "1rem" }} />
                <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "var(--accent-color)" }}>Fair Trade</h3>
                <p style={{ color: "var(--border-color)", lineHeight: 1.6 }}>We ensure our master artisans receive fair compensation and sustainable livelihoods.</p>
            </div>
            
            <div style={{ textAlign: "center", padding: "2rem" }}>
                <Globe size={48} color="var(--accent-color)" style={{ marginBottom: "1rem" }} />
                <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "var(--accent-color)" }}>Global Reach</h3>
                <p style={{ color: "var(--border-color)", lineHeight: 1.6 }}>Taking the majestic beauty of Indian handcrafted artifacts to the world.</p>
            </div>

        </div>
      </section>
    </>
  );
}
