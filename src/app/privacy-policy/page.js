import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export const metadata = {
  title: "Privacy Policy | PEHNAWA BY LAXSHMI",
  description:
    "Privacy Policy for Pehnawa by Laxshmi — how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <CartDrawer />

      <main className="min-h-screen bg-[#131313]">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <section className="pt-36 pb-16 md:pt-44 md:pb-20 px-6 md:px-16 border-b border-white/5 bg-[#0e0e0e]">
          <div className="max-w-3xl mx-auto space-y-4">
            <span className="font-montserrat text-[11px] tracking-[0.35em] text-gold uppercase block">
              Legal
            </span>
            <h1 className="font-playfair text-[36px] md:text-[52px] font-bold text-white tracking-wide leading-tight">
              Privacy Policy
            </h1>
            <p className="font-montserrat text-[13px] text-white/40 tracking-wider pt-1">
              Pehnawa by Laxshmi (House of Couture) &nbsp;·&nbsp; Last updated: July 2, 2026
            </p>
          </div>
        </section>

        {/* ── Intro ────────────────────────────────────────────────────────── */}
        <section className="py-10 px-6 md:px-16 border-b border-white/5 bg-[#131313]">
          <div className="max-w-3xl mx-auto">
            <p className="font-montserrat text-[15px] md:text-[16px] text-white/70 leading-relaxed font-light">
              Pehnawa by Laxshmi ("Pehnawa," "we," "us," or "our") operates the website
              pehnawabylaxshmi.com (the "Site"). This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you visit the Site, browse our
              collections, book a styling consultation, or place an order.
            </p>
            <p className="font-montserrat text-[15px] md:text-[16px] text-white/70 leading-relaxed font-light mt-4">
              By using the Site, you agree to the collection and use of information in
              accordance with this policy.
            </p>
          </div>
        </section>

        {/* ── Policy Sections ──────────────────────────────────────────────── */}
        <section className="py-12 md:py-16 px-6 md:px-16 bg-[#131313]">
          <div className="max-w-3xl mx-auto space-y-14">

            {/* 1. Information We Collect */}
            <PolicySection number="01" heading="Information We Collect">
              <p className="text-white font-semibold text-[14px] tracking-wide mb-3">
                Information you provide to us:
              </p>
              <BulletList items={[
                "Name, phone number, email address, and shipping/billing address",
                "Order details and product preferences",
                "Messages, styling requests, or consultation details shared via WhatsApp, phone, or contact forms",
                "Payment information (processed securely by our third-party payment providers — we do not store full card or UPI credentials on our servers)",
              ]} />
              <p className="text-white font-semibold text-[14px] tracking-wide mb-3 mt-6">
                Information collected automatically:
              </p>
              <BulletList items={[
                "IP address, browser type, device information, and general location",
                "Pages visited, time spent on the Site, and referring/exit pages",
                "Cookies and similar tracking technologies (see Section 5)",
              ]} />
            </PolicySection>

            {/* 2. How We Use Your Information */}
            <PolicySection number="02" heading="How We Use Your Information">
              <p className="font-montserrat text-[15px] text-white/70 leading-relaxed font-light mb-4">
                We use the information we collect to:
              </p>
              <BulletList items={[
                "Process and fulfil orders, including shipping, billing, and customer support",
                "Respond to styling consultation requests and personalise recommendations",
                "Communicate with you about your orders, inquiries, or promotional offers (where you have consented)",
                "Improve the Site, our collections, and overall customer experience",
                "Detect, prevent, and address fraud, technical issues, or security concerns",
                "Comply with applicable legal and regulatory obligations",
              ]} />
            </PolicySection>

            {/* 3. How We Share Your Information */}
            <PolicySection number="03" heading="How We Share Your Information">
              <p className="font-montserrat text-[15px] text-white/70 leading-relaxed font-light mb-4">
                We do not sell your personal information. We may share information with:
              </p>
              <BulletList items={[
                [
                  "Service providers",
                  " who help us operate the Site and business — such as payment processors, delivery and logistics partners, hosting providers, and communication tools (including WhatsApp Business, for consultations you initiate).",
                ],
                [
                  "Legal and safety purposes",
                  " — if required by law, court order, or governmental request, or to protect the rights, property, or safety of Pehnawa, our customers, or others.",
                ],
                [
                  "Business transfers",
                  " — in connection with a merger, acquisition, or sale of assets, subject to standard confidentiality arrangements.",
                ],
              ]} />
              <p className="font-montserrat text-[15px] text-white/70 leading-relaxed font-light mt-4">
                Each third party processes your information in accordance with their own privacy
                practices, and we work only with providers who maintain reasonable data
                protection standards.
              </p>
            </PolicySection>

            {/* 4. Data Retention */}
            <PolicySection number="04" heading="Data Retention">
              <p className="font-montserrat text-[15px] text-white/70 leading-relaxed font-light">
                We retain personal information for as long as necessary to fulfil the purposes
                described in this policy — including order history, warranty/return support, and
                legal or accounting requirements — after which it is securely deleted or
                anonymised.
              </p>
            </PolicySection>

            {/* 5. Cookies */}
            <PolicySection number="05" heading="Cookies and Tracking Technologies">
              <p className="font-montserrat text-[15px] text-white/70 leading-relaxed font-light mb-4">
                The Site uses cookies and similar technologies to:
              </p>
              <BulletList items={[
                "Keep your Atelier Bag (cart) and preferences saved during your visit",
                "Understand how visitors use the Site, to improve performance and content",
                "Support analytics and, where applicable, advertising features",
              ]} />
              <p className="font-montserrat text-[15px] text-white/70 leading-relaxed font-light mt-4">
                You can control or disable cookies through your browser settings. Disabling
                cookies may affect certain features of the Site, such as your saved bag.
              </p>
            </PolicySection>

            {/* 6. Data Security */}
            <PolicySection number="06" heading="Data Security">
              <p className="font-montserrat text-[15px] text-white/70 leading-relaxed font-light">
                We implement reasonable administrative, technical, and physical safeguards
                designed to protect your personal information against unauthorised access,
                alteration, disclosure, or destruction. However, no method of transmission over
                the internet or electronic storage is 100% secure, and we cannot guarantee
                absolute security.
              </p>
            </PolicySection>

            {/* 7. Your Rights */}
            <PolicySection number="07" heading="Your Rights and Choices">
              <p className="font-montserrat text-[15px] text-white/70 leading-relaxed font-light mb-4">
                Depending on your location, you may have the right to:
              </p>
              <BulletList items={[
                "Access, correct, or update your personal information",
                "Request deletion of your personal information",
                'Withdraw consent for marketing communications at any time (e.g., by replying "STOP" or contacting us directly)',
                "Request a copy of the information we hold about you",
              ]} />
              <p className="font-montserrat text-[15px] text-white/70 leading-relaxed font-light mt-4">
                To exercise any of these rights, contact us using the details in Section 10.
              </p>
            </PolicySection>

            {/* 8. Children's Privacy */}
            <PolicySection number="08" heading="Children's Privacy">
              <p className="font-montserrat text-[15px] text-white/70 leading-relaxed font-light">
                The Site is not directed to individuals under the age of 18. We do not knowingly
                collect personal information from children. If you believe a child has provided
                us with personal information, please contact us so we can delete it.
              </p>
            </PolicySection>

            {/* 9. Third-Party Links */}
            <PolicySection number="09" heading="Third-Party Links">
              <p className="font-montserrat text-[15px] text-white/70 leading-relaxed font-light">
                The Site may contain links to third-party websites or services (including
                WhatsApp and social media platforms). We are not responsible for the privacy
                practices or content of these third parties, and we encourage you to review
                their respective privacy policies.
              </p>
            </PolicySection>

            {/* 10. Contact Us */}
            <PolicySection number="10" heading="Contact Us">
              <p className="font-montserrat text-[15px] text-white/70 leading-relaxed font-light mb-4">
                If you have questions, concerns, or requests regarding this Privacy Policy or
                your personal information, please contact us at:
              </p>
              <div className="pl-1 space-y-1 font-montserrat text-[14px] text-white/80">
                <p className="font-semibold text-white">Pehnawa by Laxshmi — House of Couture</p>
                <p className="text-white/60">Lucknow, India</p>
                <a
                  href="tel:+917309336575"
                  className="text-gold hover:text-white transition-colors tracking-widest block pt-1"
                >
                  +91 73093 36575
                </a>
              </div>
            </PolicySection>

            {/* 11. Changes to This Policy */}
            <PolicySection number="11" heading="Changes to This Policy">
              <p className="font-montserrat text-[15px] text-white/70 leading-relaxed font-light">
                We may update this Privacy Policy from time to time to reflect changes in our
                practices or for legal, operational, or regulatory reasons. The "Last updated"
                date at the top of this page indicates when this policy was last revised. We
                encourage you to review this page periodically.
              </p>
            </PolicySection>

          </div>
        </section>

        {/* ── Footer note ──────────────────────────────────────────────────── */}
        <section className="py-10 px-6 md:px-16 border-t border-white/5 bg-[#0e0e0e]">
          <div className="max-w-3xl mx-auto">
            <p className="font-montserrat text-[11px] text-white/30 leading-relaxed italic">
              This policy should be reviewed by a legal professional to ensure compliance with
              applicable laws, including India's Digital Personal Data Protection Act, before
              publishing.
            </p>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}

/* ── Small reusable components scoped to this file ────────────────────────── */

function PolicySection({ number, heading, children }) {
  return (
    <div className="space-y-5 pb-14 border-b border-white/5 last:border-none last:pb-0">
      <div className="flex items-start gap-4">
        <span className="font-montserrat text-[11px] text-gold font-bold tracking-widest shrink-0 mt-1.5">
          {number}
        </span>
        <h2 className="font-playfair text-[20px] md:text-[24px] font-medium text-white tracking-wide">
          {heading}
        </h2>
      </div>
      <div className="pl-8 space-y-3">{children}</div>
    </div>
  );
}

/**
 * items can be plain strings, or [boldPart, restOfText] tuples for bold-prefixed bullets.
 */
function BulletList({ items }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 items-start">
          <span className="mt-2 shrink-0 w-1 h-1 rounded-full bg-gold/50" />
          <p className="font-montserrat text-[14px] md:text-[15px] text-white/65 leading-relaxed font-light">
            {Array.isArray(item) ? (
              <>
                <span className="text-white font-semibold">{item[0]}</span>
                {item[1]}
              </>
            ) : (
              item
            )}
          </p>
        </li>
      ))}
    </ul>
  );
}
