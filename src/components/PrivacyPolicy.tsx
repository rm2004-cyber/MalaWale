"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

export default function PrivacyPolicy() {
  // Scroll to top when policy page is loaded
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const sections = [
    {
      id: "introduction",
      title: "1. Introduction",
      content: (
        <p className="leading-relaxed">
          Welcome to <strong>MalaWale</strong> ("we," "us," or "our"), operated under <strong>Sanwariya Handicraft</strong>. 
          We respect your privacy and are committed to protecting the personal data of our devotees, patrons, and customers ("you" or "user"). 
          This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, 
          purchase our sacred treasures, or interact with our spiritual items services. This policy is designed in compliance with the 
          <strong> Information Technology Act, 2000</strong>, the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong>, and other applicable laws in India.
        </p>
      ),
    },
    {
      id: "data-collection",
      title: "2. Data We Collect",
      content: (
        <div className="space-y-4">
          <p className="leading-relaxed">
            To serve you and deliver the divine energy of our handcrafted malas and spiritual treasures, we collect various types of information:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>
              <strong className="text-[#9B1B1B]">Personal Identification Information:</strong> Full name, phone number, email address, and complete shipping address (including street, city, state, and pincode).
            </li>
            <li>
              <strong className="text-[#9B1B1B]">Technical Data:</strong> IP address, device type, browser cookies, browser version, and website usage statistics collected automatically via log files and analytics.
            </li>
            <li>
              <strong className="text-[#9B1B1B]">Transactional Data:</strong> Details of the purchases you make. 
              <span className="block mt-1 font-semibold text-amber-900 bg-amber-50/70 p-2 rounded-lg border border-amber-100/60 text-xs">
                🔒 Safe Checkout Guarantee: All payment processing is securely managed by Razorpay. We do NOT collect or store credit/debit card numbers, CVV codes, net banking credentials, or UPI PINs on our servers.
              </span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "purpose-of-data",
      title: "3. Purpose of Processing Your Data",
      content: (
        <div className="space-y-3">
          <p className="leading-relaxed">
            We process your data based on lawful grounds for the following specific purposes:
          </p>
          <ul className="list-decimal pl-6 space-y-2 text-gray-700">
            <li>To process your orders, manufacture customized items, and fulfill shipments of your sacred tools.</li>
            <li>To send WhatsApp messages, SMS, and email notifications for order status, tracking updates, and delivery alerts.</li>
            <li>To establish, secure, and maintain your user account, including managing your digital shopping cart.</li>
            <li>To provide customer service, resolve support inquiries, and obtain feedback on your spiritual purchase.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "third-party-sharing",
      title: "4. Third-Party Sharing & Transfers",
      content: (
        <div className="space-y-3">
          <p className="leading-relaxed">
            We value your trust above all else. <strong>We explicitly state that we never sell, rent, trade, or monetize your personal data.</strong> 
            We share your data only with trusted third-party service providers who assist us in operating our business:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>
              <strong className="text-[#9B1B1B]">Razorpay:</strong> To process payments securely through certified payment gateways.
            </li>
            <li>
              <strong className="text-[#9B1B1B]">Courier Partners:</strong> Standard postal services and courier companies (like Delhivery, Shiprocket, Blue Dart) to dispatch and deliver your orders.
            </li>
            <li>
              <strong className="text-[#9B1B1B]">Cloudinary:</strong> For hosting and delivery of high-resolution product images and review pictures securely.
            </li>
            <li>
              <strong className="text-[#9B1B1B]">Legal Disclosures:</strong> We may share data if required by law enforcement, judicial orders, or to protect the safety and rights of MalaWale and its customers.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "cookies",
      title: "5. Cookies and Trackers",
      content: (
        <p className="leading-relaxed">
          Cookies are small text files placed on your device to enhance your browsing experience. We use functional cookies to save your cart items, remember your session, and understand how you interact with our website to optimize page load speeds. You can disable cookies in your browser settings, though doing so might disrupt certain e-commerce functionalities (like keeping items in your cart).
        </p>
      ),
    },
    {
      id: "security",
      title: "6. Data Security",
      content: (
        <p className="leading-relaxed">
          We implement industry-standard physical, electronic, and administrative safeguards to secure your personal data. 
          All communication between your browser and our servers is encrypted using <strong>secure HTTPS/SSL (Secure Socket Layer) protocols</strong>. 
          While we make every effort to secure our databases, please note that no system is 100% secure, and you are advised to maintain the confidentiality of your account credentials.
        </p>
      ),
    },
    {
      id: "user-rights",
      title: "7. Your Rights",
      content: (
        <div className="space-y-3">
          <p className="leading-relaxed">
            Under Indian personal data protection regulations, you possess the following rights regarding your data:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Right to Access:</strong> Request a copy of the personal data we store about you.</li>
            <li><strong>Right to Correction:</strong> Request that we update or correct inaccurate details.</li>
            <li><strong>Right to Erasure (Deletion):</strong> Request the permanent deletion of your account and personal details from our databases (subject to standard regulatory retention mandates for tax and transaction records).</li>
            <li><strong>Right to Withdraw Consent:</strong> Revoke consent for direct notifications (e.g., newsletters or marketing) at any time.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "children-privacy",
      title: "8. Children's Privacy (Under 18)",
      content: (
        <p className="leading-relaxed">
          Our services and products are not targeted toward individuals under the age of 18. We do not knowingly collect personal information from minors. 
          If a parent or legal guardian believes that their child has provided us with personal information, please contact us immediately, and we will take prompt steps to remove such details from our databases.
        </p>
      ),
    },
    {
      id: "changes",
      title: "9. Changes to this Policy",
      content: (
        <p className="leading-relaxed">
          We may update this Privacy Policy from time to time to reflect operational, legal, or regulatory modifications. 
          The date at the top of this page indicates when it was last updated. We encourage you to review this page periodically to stay informed about how we protect your sacred information.
        </p>
      ),
    },
    {
      id: "contact",
      title: "10. Contact & Grievance Redressal",
      content: (
        <div className="bg-amber-50/40 border border-[#D4AF37]/20 p-5 rounded-2xl">
          <p className="font-semibold text-[#9B1B1B] mb-2">Grievance Officer</p>
          <p className="text-sm text-gray-700 leading-relaxed">
            In accordance with the Information Technology Act, 2000, and the Digital Personal Data Protection Act, 2023, the contact details of our Grievance Officer are listed below for any queries, concerns, or requests regarding data removal:
          </p>
          <div className="mt-3 text-xs space-y-1 font-medium text-amber-950">
            <p>📧 Email: <a href="mailto:hello@malawale.in" className="underline hover:text-[#9B1B1B]">hello@malawale.in</a></p>
            <p>🏢 Address: Sanwariya Handicraft, Sector 22-C, Chandigarh, Punjab — 160022, India</p>
            <p>📞 Phone: +91 98765 43210</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="w-full py-10 px-4 max-w-4xl mx-auto min-h-[75vh]" style={{ fontFamily: "'Jost', sans-serif" }}>
      <div className="text-center mb-12">
        <span
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
          className="text-xs uppercase tracking-widest text-[#E65100] font-medium italic block mb-1"
        >
          Spiritual Safety & trust
        </span>
        <h1
          style={{ fontFamily: "'Playfair Display', serif" }}
          className="text-3xl sm:text-4xl font-black text-[#9B1B1B]"
        >
          Privacy Policy
        </h1>
        <p className="text-xs text-amber-800/60 mt-2">Last Updated: June 9, 2026</p>
        <div className="w-24 h-0.5 mx-auto mt-4 bg-gradient-to-r from-transparent via-[#E65100] to-transparent opacity-60" />
      </div>

      <div className="bg-white/95 p-6 sm:p-10 rounded-3xl border border-[#D4AF37]/20 shadow-md relative overflow-hidden">
        {/* Background OM Symbol */}
        <div className="absolute top-8 right-8 text-[12rem] opacity-[0.015] select-none pointer-events-none font-serif">
          ॐ
        </div>

        <p className="italic text-gray-600 mb-8 pb-6 border-b border-orange-100/60 text-sm leading-relaxed">
          At MalaWale, we believe the path to devotion should be built on pure transparency and trust. 
          We protect your personal data as a sacred trust, ensuring that your spiritual journey is completely safe and respected. 
          Please read this Privacy Policy carefully to understand our practices regarding your data.
        </p>

        {/* Quick links Table of Contents */}
        <div className="mb-10 p-5 rounded-2xl bg-[#FCF8F2]/60 border border-amber-100/40">
          <p className="font-bold text-[#9B1B1B] text-xs uppercase tracking-wider mb-3 font-serif">Table of Contents</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {sections.map((sec) => (
              <a
                key={sec.id}
                href={`#sec-${sec.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(`sec-${sec.id}`)?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-amber-800 hover:text-[#9B1B1B] hover:underline transition font-medium flex items-center gap-1.5"
              >
                <span>✦</span> {sec.title}
              </a>
            ))}
          </div>
        </div>

        {/* Sections content */}
        <div className="space-y-10 text-sm text-gray-800">
          {sections.map((sec) => (
            <div key={sec.id} id={`sec-${sec.id}`} className="scroll-mt-24">
              <h2
                style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-lg font-bold text-[#9B1B1B] mb-3 flex items-center gap-2 border-b border-orange-50/50 pb-1"
              >
                {sec.title}
              </h2>
              <div className="text-gray-700 leading-relaxed font-normal">{sec.content}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
