"use client";

import { useActionState } from "react";
import { sendContactMessage, type ContactState } from "./actions";
import styles from "./page.module.css";

const initialState: ContactState = { status: "idle", message: "" };

/**
 * Name / email / message form. Submitting sends the message to Patrícia's
 * inbox from the server (see actions.ts); the visitor stays on the page.
 */
export default function ContactForm() {
  const [state, formAction, pending] = useActionState(
    async (previous: ContactState, formData: FormData) => {
      const result = await sendContactMessage(previous, formData);
      // React clears the form after submitting; on an error, refill it so the
      // visitor doesn't lose what they wrote.
      return result.status === "error"
        ? { ...result, fields: Object.fromEntries(formData) as Record<string, string> }
        : result;
    },
    initialState,
  );
  const fields = "fields" in state ? (state.fields as Record<string, string>) : undefined;

  return (
    <form className={styles.form} action={formAction}>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>Name</span>
        <input
          className={styles.input}
          name="name"
          autoComplete="name"
          maxLength={100}
          defaultValue={fields?.name}
          required
        />
      </label>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>Email Address</span>
        <input
          className={styles.input}
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={fields?.email}
          required
        />
      </label>
      <label className={`${styles.field} ${styles.fieldWide}`}>
        <span className={styles.fieldLabel}>Message</span>
        <textarea
          className={`${styles.input} ${styles.textarea}`}
          name="message"
          rows={4}
          maxLength={5000}
          defaultValue={fields?.message}
          required
        />
      </label>
      {/* Spam trap: hidden from people, filled in by bots (see actions.ts). */}
      <input
        className={styles.honeypot}
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <div className={styles.formFooter}>
        <p
          className={`${styles.formNote} ${state.status === "error" ? styles.formError : ""}`}
          aria-live="polite"
        >
          {state.message}
        </p>
        <button type="submit" className={styles.submit} disabled={pending}>
          {pending ? "Sending…" : "Submit"}
        </button>
      </div>
    </form>
  );
}
