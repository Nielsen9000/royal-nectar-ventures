// Vercel serverless function: receives the contact-form POST and emails the
// enquiry to the inbox via Resend. The API key comes from the RESEND_API_KEY
// environment variable (set in Vercel) — never hardcoded.
const { Resend } = require("resend");

const TO = "spirits@royalnectarventures.com";
const FROM = "Royal Nectar Ventures <noreply@royalnectarventures.com>";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Vercel parses application/json bodies automatically; guard for strings too.
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (err) {
      return res.status(400).json({ error: "Invalid JSON body." });
    }
  }
  body = body || {};

  const name = (body.name || "").trim();
  const company = (body.company || "").trim();
  const email = (body.email || "").trim();
  const phone = (body.phone || "").trim();
  const message = (body.message || "").trim();

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Please fill in your name, email and message." });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("[contact] RESEND_API_KEY is not set");
    return res.status(500).json({ error: "Sorry, something went wrong. Please email us directly." });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const fields = [
    ["Name", name],
    ["Business", company || "—"],
    ["Email", email],
    ["Phone", phone || "—"],
    ["Message", message],
  ];

  const text = fields.map(([label, value]) => `${label}: ${value}`).join("\n");
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a1a1a;line-height:1.6">
      <h2 style="margin:0 0 12px">New trade enquiry</h2>
      <table style="border-collapse:collapse">
        ${fields
          .map(
            ([label, value]) =>
              `<tr><td style="padding:4px 16px 4px 0;color:#7a6a3a;font-weight:bold;vertical-align:top">${label}</td><td style="padding:4px 0;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`
          )
          .join("")}
      </table>
    </div>`;

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: TO,
      replyTo: email,
      subject: `New trade enquiry — ${name}`,
      text,
      html,
    });

    if (error) {
      console.error("[contact] Resend error:", error);
      return res.status(500).json({ error: "Sorry, we couldn't send your message. Please email us directly." });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("[contact] Unexpected error:", err);
    return res.status(500).json({ error: "Sorry, something went wrong. Please email us directly." });
  }
};
