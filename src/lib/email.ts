import { Resend } from "resend";

export type InviteEmailInput = {
  to: string;
  tripTitle: string;
  shareUrl: string;
};

export async function sendShareInvite(input: InviteEmailInput) {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    return { sent: false, reason: "RESEND_API_KEY is not configured." };
  }

  const resend = new Resend(key);
  const from = process.env.RESEND_FROM_EMAIL ?? "Traveloop <onboarding@resend.dev>";

  await resend.emails.send({
    from,
    to: input.to,
    subject: `You're invited to view ${input.tripTitle}`,
    text: `Open this Traveloop itinerary: ${input.shareUrl}`,
  });

  return { sent: true };
}

export async function sendPasswordResetEmail(input: { to: string }) {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    return { sent: false, reason: "RESEND_API_KEY is not configured." };
  }

  const resend = new Resend(key);
  const from = process.env.RESEND_FROM_EMAIL ?? "Traveloop <onboarding@resend.dev>";

  await resend.emails.send({
    from,
    to: input.to,
    subject: "Reset your Traveloop password",
    text: "A password reset was requested for your Traveloop account. Configure a token-backed reset flow before enabling password changes in production."
  });

  return { sent: true };
}
