"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

export default function TermsOfUse() {
  // Scroll to top when page is loaded
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const sections = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      content: (
        <p className="leading-relaxed">
          By accessing, browsing, or using the <strong>MalaWale</strong> website (the "Site") or purchasing our sacred items, 
          you agree to be bound by these Terms of Use (the "Terms") and all applicable laws and regulations. If you do not agree 
          with any part of these Terms, you are prohibited from using or accessing this Site. The services are operated under 
          the parent brand <strong>Sanwariya Handicraft</strong>.
        </p>
      ),
    },
    {
      id: "accounts",
      title: "2. User Accounts & Security",
      content: (
        <p className="leading-relaxed">
          To access certain features of the Site or complete purchases, you may be required to register for an account. 
          You agree to provide accurate, current, and complete information. You are solely responsible for maintaining the 
          confidentiality of your account password and username, and for all activities that occur under your account. 
          You must immediately notify us of any unauthorized use or security breach of your account. MalaWale cannot and will 
          not be liable for any loss or damage arising from your failure to comply with this security obligation.
        </p>
      ),
    },
    {
      id: "orders-payments",
      title: "3. Orders, Pricing, and Payments",
      content: (
        <div className="space-y-4">
          <p className="leading-relaxed">
            All orders placed through the Site are subject to acceptance by us. 
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>
              <strong className="text-[#9B1B1B]">Order Cancellation:</strong> We reserve the right to refuse or cancel any order at any time for reasons including but not limited to: product availability (stock issues), errors in product description or pricing, errors in your order, or suspected fraudulent activity. If your order is cancelled after your payment is processed, we will issue a full refund to your original payment method.
            </li>
            <li>
              <strong className="text-[#9B1B1B]">Secure Payment Processing:</strong> All transactions are processed securely through <strong>Razorpay</strong>. We do not store or process your credit/debit card numbers, UPI PINs, or net banking passwords on our servers. You agree to provide valid billing and card details and authorize us to charge the order amount through our payment gateway.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "product-info",
      title: "4. Product Information and Variations",
      content: (
        <p className="leading-relaxed">
          We sell sacred treasures and spiritual tools crafted primarily from natural materials, including raw woods (such as sandalwood and rudraksha beads), pure stones, and crystals. Because these items are handcrafted using natural materials, <strong>minor variations in color, size, texture, bead shape, and natural characteristics are normal and expected</strong>. While we strive to display our products as accurately as possible, your screen settings may affect how colors appear, and we cannot guarantee that the product received will be an exact replica of the catalog image.
        </p>
      ),
    },
    {
      id: "shipping-delivery",
      title: "5. Shipping and Delivery",
      content: (
        <p className="leading-relaxed">
          Shipping and delivery timelines are estimated in good faith and are not guaranteed. Delivery times depend on third-party logistics partners, customs procedures, and regional logistics factors. MalaWale/Sanwariya Handicraft is not responsible for courier delays, transit damage, or delivery failures resulting from incorrect addresses provided by the user. Once shipped, you will receive tracking coordinates to monitor your parcel.
        </p>
      ),
    },
    {
      id: "returns-refunds",
      title: "6. Return and Refund Policy",
      content: (
        <div className="space-y-3">
          <p className="leading-relaxed">
            We inspect every sacred item with absolute devotion before dispatch to ensure its spiritual purity and physical completeness. 
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Returns:</strong> Acceptance of returns depends on the specific condition of the item upon delivery. Requests for returns must be initiated within 48 hours of delivery by emailing us with unboxing photographs/videos demonstrating any transit damage or defects. Natural variations in stones or wood do not qualify as defects.</li>
            <li><strong>Refunds:</strong> Approved refunds will be processed back to the original payment source. The refund processing time is typically <strong>5 to 7 working days</strong>, depending on bank clearance timelines and Razorpay processing schedules.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "intellectual-property",
      title: "7. Intellectual Property Rights",
      content: (
        <p className="leading-relaxed">
          All content on this website, including but not limited to texts, logos, icons, graphics, images, brand names, product titles, designs, and software, is the exclusive property of <strong>MalaWale / Sanwariya Handicraft</strong> and is protected by Indian and international copyright, trademark, and intellectual property laws. You may not copy, reproduce, republish, distribute, modify, or exploit any content without our prior written consent.
        </p>
      ),
    },
    {
      id: "limitation-liability",
      title: "8. Limitation of Liability",
      content: (
        <p className="leading-relaxed">
          To the maximum extent permitted by applicable law, <strong>MalaWale / Sanwariya Handicraft</strong> shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, goodwill, use, or data, resulting from (i) the use or inability to use our products or website; (ii) any unauthorized access to our databases; or (iii) any modifications, variations, or handling of our spiritual items by the customer.
        </p>
      ),
    },
    {
      id: "governing-law",
      title: "9. Governing Law and Jurisdiction",
      content: (
        <p className="leading-relaxed">
          These Terms of Use shall be governed by and construed in accordance with the laws of India. Any disputes, claims, or controversies arising out of or relating to your use of the website or purchases made through the Site shall be subject to the exclusive jurisdiction of the competent courts in <strong>Chandigarh, India</strong>.
        </p>
      ),
    },
    {
      id: "changes-terms",
      title: "10. Changes to These Terms",
      content: (
        <p className="leading-relaxed">
          We reserve the right, at our sole discretion, to modify or replace these Terms of Use at any time. The date of the latest update will be indicated at the top of this page. Your continued use of the website following any changes constitutes your formal acceptance of the revised Terms.
        </p>
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
          Terms & Code of Conduct
        </span>
        <h1
          style={{ fontFamily: "'Playfair Display', serif" }}
          className="text-3xl sm:text-4xl font-black text-[#9B1B1B]"
        >
          Terms of Use
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
          Welcome to MalaWale. These Terms of Use govern your access to and usage of our online platform. 
          By interacting with our platform, you join our spiritual community under mutual respect and legal alignment. 
          Please read these terms carefully before engaging in transactions or account creations.
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
