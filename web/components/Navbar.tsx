"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingBag,
  User,
  Heart,
  Settings,
  LogOut,
  Package,
  Menu,
  X,
} from "lucide-react";
import { useSession, signOut } from "@/providers/AuthProvider";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`}>
      <div className={styles.navInner}>
        {/* Mobile hamburger */}
        <button
          className={styles.mobileMenuBtn}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Menu"
        >
          {isMobileMenuOpen ? (
            <X size={22} strokeWidth={1.5} />
          ) : (
            <Menu size={22} strokeWidth={1.5} />
          )}
        </button>

        {/* Brand */}
        <div className={styles.brand}>
          <Link href="/">
            SN <span className={styles.brandAccent}>HandCrafts</span>
          </Link>
        </div>

        {/* Nav links */}
        <div
          className={`${styles.links} ${isMobileMenuOpen ? styles.linksOpen : ""}`}
        >
          <Link
            href="/products"
            className={styles.link}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Shop
          </Link>
          <Link
            href="/about"
            className={styles.link}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About
          </Link>
          <Link
            href="/artisan-story"
            className={styles.link}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Our Craft
          </Link>
          <Link
            href="/contact"
            className={styles.link}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Contact
          </Link>
        </div>

        {/* Icons */}
        <div className={styles.icons}>
          {/* Search */}
          <div className={styles.searchContainer} ref={searchRef}>
            <button
              className={styles.iconBtn}
              aria-label="Search"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
            {isSearchOpen && (
              <div className={styles.searchDropdown}>
                <input
                  type="text"
                  placeholder="Search for pottery, weaves..."
                  className={styles.searchInput}
                  autoFocus
                />
              </div>
            )}
          </div>

          <Link
            href="/wishlist"
            className={styles.iconBtn}
            aria-label="Wishlist"
          >
            <Heart size={20} strokeWidth={1.5} />
          </Link>

          <Link href="/cart" className={styles.cartBtn} aria-label="Cart">
            <ShoppingBag size={20} strokeWidth={1.5} />
            <span className={styles.cartLabel}>Cart</span>
          </Link>

          {/* Profile dropdown */}
          <div className={styles.profileContainer} ref={dropdownRef}>
            <button
              className={styles.iconBtn}
              aria-label="Profile"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              style={{
                overflow: "hidden",
                borderRadius: "50%",
                backgroundColor: session?.user?.image
                  ? "transparent"
                  : session
                    ? "var(--action-primary)"
                    : "transparent",
                color:
                  session && !session?.user?.image
                    ? "var(--cream)"
                    : "inherit",
              }}
            >
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt="Profile"
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : session?.user?.name ? (
                <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                  {session.user.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User size={20} strokeWidth={1.5} />
              )}
            </button>

            {isProfileOpen && (
              <div className={styles.dropdown}>
                {session ? (
                  <>
                    <div className={styles.dropdownHeader}>
                      <p className={styles.dropdownName}>
                        {session.user?.name}
                      </p>
                      <p className={styles.dropdownEmail}>
                        {session.user?.email}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      className={styles.dropdownItem}
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings size={16} strokeWidth={1.5} /> My Profile
                    </Link>
                    <Link
                      href="/orders"
                      className={styles.dropdownItem}
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Package size={16} strokeWidth={1.5} /> Order History
                    </Link>
                    <div className={styles.dropdownDivider}></div>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        signOut();
                      }}
                      className={styles.dropdownItem}
                      style={{
                        color: "var(--rust-accent)",
                        width: "100%",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      <LogOut size={16} strokeWidth={1.5} /> Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth"
                    className={styles.dropdownItem}
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User size={16} strokeWidth={1.5} /> Sign In / Sign Up
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
}
