"use client";

import { useMemo, useState } from "react";
import { getApiUrl } from "@/lib/apiClient";
import styles from "../app/inner.module.css";

type PinApiResponse = {
  success: boolean;
  message?: string;
  data?: {
    pincode: string;
    cities: string[];
    states: string[];
  };
};

export default function IndianAddressForm({
  action,
}: {
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [postalCode, setPostalCode] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupMessage, setLookupMessage] = useState("");

  const canPickCity = useMemo(() => cities.length > 0, [cities]);
  const canPickState = useMemo(() => states.length > 0, [states]);

  async function lookupPincode(pin: string) {
    if (!/^\d{6}$/.test(pin)) {
      setCities([]);
      setStates([]);
      setCity("");
      setState("");
      setLookupMessage("");
      return;
    }

    try {
      setIsLookingUp(true);
      setLookupMessage("");

      const res = await fetch(`/api/postal/pincode/${pin}`);
      const body = (await res.json()) as PinApiResponse;

      if (!res.ok || !body.success || !body.data) {
        setCities([]);
        setStates([]);
        setCity("");
        setState("");
        setLookupMessage(body.message || "Could not find this PIN code.");
        return;
      }

      setCities(body.data.cities);
      setStates(body.data.states);
      setCity(body.data.cities[0] || "");
      setState(body.data.states[0] || "");
      setLookupMessage("PIN verified. City and state loaded.");
    } finally {
      setIsLookingUp(false);
    }
  }

  return (
    <form action={action}>
      <div className={styles.twoColumn} style={{ gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Full Name</label>
          <input className={styles.input} name="fullName" required />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Phone</label>
          <input className={styles.input} name="phone" required />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Address Line 1</label>
        <input className={styles.input} name="line1" required />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Address Line 2</label>
        <input className={styles.input} name="line2" />
      </div>

      <div className={styles.twoColumn} style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.8rem" }}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Postal Code (PIN)</label>
          <input
            className={styles.input}
            name="postalCode"
            value={postalCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 6);
              setPostalCode(value);
              void lookupPincode(value);
            }}
            required
            inputMode="numeric"
            pattern="[0-9]{6}"
            title="Enter a valid 6-digit Indian PIN code"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>City</label>
          {canPickCity ? (
            <select
              className={styles.input}
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            >
              {cities.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          ) : (
            <input className={styles.input} name="city" value={city} onChange={(e) => setCity(e.target.value)} required />
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>State</label>
          {canPickState ? (
            <select
              className={styles.input}
              name="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            >
              {states.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          ) : (
            <input className={styles.input} name="state" value={state} onChange={(e) => setState(e.target.value)} required />
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Country</label>
          <input className={styles.input} name="country" required value="India" readOnly />
        </div>
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: "0.2rem 0 0.75rem" }}>
        {isLookingUp ? "Checking PIN..." : lookupMessage}
      </p>

      <button type="submit" className="btn-primary">
        Save Address
      </button>
    </form>
  );
}
