"use server";

import { PROFILES } from "@/lib/profiles";

export type ContactState = {
  status: "idle" | "sent" | "error";
  message: string;
};

const MAX_NAME = 100;
const MAX_MESSAGE = 5000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Sends a contact-form message to Patrícia through Resend
 * (https://resend.com). Needs RESEND_API_KEY on the server; see .env.example.
 * Replying to the email in Gmail goes straight to the visitor.
 */
export async function sendContactMessage(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  // Hidden "website" field: people never see it, spam bots fill it in.
  // Pretend it worked so bots don't retry.
  if (String(formData.get("website") ?? "")) {
    return { status: "sent", message: "Thanks! Your message is on its way." };
  }

  if (!name || name.length > MAX_NAME) {
    return { status: "error", message: "Please add your name." };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { status: "error", message: "Please check your email address." };
  }
  if (!message || message.length > MAX_MESSAGE) {
    return { status: "error", message: `Please write a message (up to ${MAX_MESSAGE} characters).` };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Contact form: RESEND_API_KEY is not set, so the message was not sent.");
    return { status: "error", message: unavailable() };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        // Resend's shared sender works without owning a domain, but only
        // delivers to the email the Resend account was created with.
        from: process.env.CONTACT_FROM_EMAIL || "Contact Form <onboarding@resend.dev>",
        to: [PROFILES.email],
        reply_to: email,
        subject: `[Contact] ${name}`,
        text: `${message}\n\n—\nFrom: ${name} <${email}>\nSent via the contact form on your portfolio.`,
      }),
    });
    if (!res.ok) {
      console.error("Contact form: Resend returned", res.status, await res.text());
      return { status: "error", message: unavailable() };
    }
  } catch (error) {
    console.error("Contact form: could not reach Resend", error);
    return { status: "error", message: unavailable() };
  }

  return { status: "sent", message: "Thanks! Your message is on its way." };
}

function unavailable() {
  return `Sorry, the message couldn't be sent right now. You can email me directly at ${PROFILES.email}.`;
}
