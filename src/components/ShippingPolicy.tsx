"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

export default function ShippingPolicy() {
  // Scroll to top when page is loaded
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const sections = [
    {
      id: "partners",
      title: "1. Trusted Delivery Partners",
      content: (
        <p className="leading-relaxed">
          To ensure that your sacred treasures and spiritual items reach you in pristine, spiritually pure condition, 
          we partner exclusively with trusted, high-reliability domestic logistics and courier agencies (such as Delhivery, 
          Blue Dart, Shiprocket, and India Post). Every shipment is handled carefully to respect the sanctity of the items inside.
        </p>
      ),
    },
    {
      id: "timeline",
      title: "2. Processing & Delivery Timelines",
      content: (
        <div className="space-y-3">
          <p className="leading-relaxed">
            We work efficiently to prepare and handcraft your orders as quickly as possible:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>
              <strong className="text-[#9B1B1B]">Order Processing Time:</strong> Orders are verified, customized, packaged, and dispatched from our Chandigarh workshop within <strong>1 to 2 business days</strong> (excluding Sundays and national holidays).
            </li>
            <li>
              <strong className="text-[#9B1B1B]">Delivery Estimate:</strong> Once handed over to our courier partners, shipping typically takes approximately <strong>3 to 5 business days</strong> depending on your delivery location. Remote areas or specific regions may require additional transit days.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "tracking",
      title: "3. Real-Time Shipping Updates & Tracking",
      content: (
        <p className="leading-relaxed">
          We believe in complete transparency during your purchase journey. The moment your parcel is registered with our courier partner, 
          a shipping confirmation containing your unique tracking number (AWB) and a live tracking link will be sent to you directly 
          via <strong>WhatsApp and Email</strong>. You can monitor your shipment's journey in real-time or log into your account on 
          our website to check the live order status.
        </p>
      ),
    },
    {
      id: "charges",
      title: "4. Shipping Charges",
      content: (
        <p className="leading-relaxed">
          Shipping fees are dynamically calculated at the time of checkout based on the final shipping address, pincode, and package weight. 
          Any applicable shipping charges will be clearly displayed in your order summary before you make the final payment. From time to time, 
          we may offer free shipping promotions on cart totals exceeding a specified amount, which will be applied automatically at checkout.
        </p>
      ),
    },
    {
      id: "areas",
      title: "5. Served Delivery Areas",
      content: (
        <p className="leading-relaxed">
          MalaWale currently delivers to pin codes and locations **across all states and union territories of India**. 
          At this moment, we do not support automated checkout for international shipments. If you wish to place an order from outside of India, 
          please reach out to our team at <a href="mailto:hello@malawale.in" className="underline hover:text-[#9B1B1B]">hello@malawale.in</a> or through WhatsApp to arrange custom shipping.
        </p>
      ),
    },
    {
      id: "responsibility",
      title: "6. Address Accuracy & User Responsibility",
      content: (
        <p className="leading-relaxed">
          To ensure timely and safe delivery, it is your responsibility to provide a complete and accurate shipping address (including the exact street name, apartment/house number, landmark, city, state, and <strong>correct 6-digit Pincode</strong>) along with an active <strong>mobile contact number</strong>. MalaWale/Sanwariya Handicraft will not be held liable for delivery failures, delays, or returned shipments resulting from incorrect, incomplete, or unreachable address coordinates. Any additional shipping charges incurred for re-dispatching returned orders must be borne by the customer.
        </p>
      ),
    },
    {
      id: "assistance",
      title: "7. Contact for Help & Delayed Shipments",
      content: (
        <p className="leading-relaxed">
          If your shipment has not arrived within the estimated 3-5 business days window, or if you face any issues with tracking updates, 
          our support family is ready to assist you. Please write to us at <strong>hello@malawale.in</strong> or contact us via WhatsApp 
          at <strong>+91 98765 43210</strong>, mentioning your unique Order ID, and we will coordinate with the courier company immediately 
          to expedite delivery.
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
          Delivery Integrity & Speed
        </span>
        <h1
          style={{ fontFamily: "'Playfair Display', serif" }}
          className="text-3xl sm:text-4xl font-black text-[#9B1B1B]"
        >
          Shipping & Delivery Policy
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
          At MalaWale, we understand the anticipation of receiving sacred tools that aid your spiritual practices. 
          We handle every order as a blessing, ensuring it is packaged securely and delivered safely to your doorstep. 
          Please review our shipping policies to understand delivery timelines and parameters.
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
