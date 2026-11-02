'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MessageCircle, MapPin, Clock, Send, CheckCircle2, Sparkles, HelpCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    orderNumber: '',
    subject: 'General Inquiry',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[var(--color-warm-white)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-xs text-[var(--color-dark)]/50 font-medium" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[var(--color-primary-gold)] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[var(--color-dark)] font-bold">Contact Client Services</span>
        </nav>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-champagne)]/60 text-[var(--color-dark)] text-xs font-bold uppercase tracking-wider mb-4 border border-[var(--color-primary-gold)]/30">
          <Sparkles size={14} className="text-[var(--color-primary-gold)]" /> Dedicated Client Concierge
        </div>

        <h1 className="font-display text-4xl sm:text-6xl font-bold text-[var(--color-dark)] mb-4">
          How Can We Help?
        </h1>

        <p className="text-gray-600 text-sm sm:text-base max-w-xl mx-auto font-sans leading-relaxed">
          Our master concierges and fashion advisors are available 7 days a week for styling advice, order updates, and bespoke couture inquiries.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          <a
            href="https://wa.me/918760890906"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white p-6 rounded-3xl border border-[var(--color-champagne)] shadow-soft-sm hover:shadow-gold-md hover:-translate-y-1 transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <MessageCircle size={24} />
            </div>
            <h3 className="font-display font-bold text-base text-[var(--color-dark)] mb-1">WhatsApp Chat</h3>
            <p className="text-xs text-gray-500 mb-3">Instant answers from styling advisors.</p>
            <span className="text-xs font-bold text-emerald-600 group-hover:underline">Chat on WhatsApp (+91 87608 90906) →</span>
          </a>

          <a
            href="tel:+918760890906"
            className="bg-white p-6 rounded-3xl border border-[var(--color-champagne)] shadow-soft-sm hover:shadow-gold-md hover:-translate-y-1 transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[var(--color-primary-gold)] mb-4 group-hover:bg-[var(--color-primary-gold)] group-hover:text-[var(--color-dark)] transition-colors">
              <Phone size={24} />
            </div>
            <h3 className="font-display font-bold text-base text-[var(--color-dark)] mb-1">Direct Call</h3>
            <p className="text-xs text-gray-500 mb-3">+91 87608 90906</p>
            <span className="text-xs font-bold text-[var(--color-primary-gold)] group-hover:underline">Call Now →</span>
          </a>

          <a
            href="mailto:support@yezbee.com"
            className="bg-white p-6 rounded-3xl border border-[var(--color-champagne)] shadow-soft-sm hover:shadow-gold-md hover:-translate-y-1 transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Mail size={24} />
            </div>
            <h3 className="font-display font-bold text-base text-[var(--color-dark)] mb-1">Email Concierge</h3>
            <p className="text-xs text-gray-500 mb-3">support@yezbee.com</p>
            <span className="text-xs font-bold text-blue-600 group-hover:underline">Send Email →</span>
          </a>

          <div className="bg-white p-6 rounded-3xl border border-[var(--color-champagne)] shadow-soft-sm">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 mb-4">
              <MapPin size={24} />
            </div>
            <h3 className="font-display font-bold text-base text-[var(--color-dark)] mb-1">Main Atelier Boutique</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              YEZ BEE Fashion Tower, Bandra Kurla Complex, Mumbai 400051
            </p>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-[var(--color-champagne)]/80 shadow-soft-md">
            <h2 className="font-display text-2xl font-bold text-[var(--color-dark)] mb-2">Send Us a Message</h2>
            <p className="text-xs text-gray-500 mb-6">Fill out your details below and our client advisor will contact you within 2-4 business hours.</p>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center space-y-4"
                >
                  <CheckCircle2 size={56} className="mx-auto text-emerald-500" />
                  <h3 className="font-display text-2xl font-bold text-[var(--color-dark)]">Message Received!</h3>
                  <p className="text-sm text-gray-600 max-w-md mx-auto">
                    Thank you, <span className="font-bold text-black">{formData.name}</span>. We&apos;ve received your request regarding <span className="font-bold text-[var(--color-primary-gold)]">{formData.subject}</span>. A luxury fashion consultant will get in touch shortly.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', orderNumber: '', subject: 'General Inquiry', message: '' }); }}
                    className="px-8 py-3 bg-[var(--color-dark)] text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-[var(--color-darker)]"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-bold uppercase tracking-wider text-[var(--color-dark)] mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        placeholder="e.g. Ananya Roy"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50/50 outline-none focus:border-[var(--color-primary-gold)]"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-bold uppercase tracking-wider text-[var(--color-dark)] mb-1.5">
                        Email Address *
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        placeholder="ananya@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50/50 outline-none focus:border-[var(--color-primary-gold)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-phone" className="block text-xs font-bold uppercase tracking-wider text-[var(--color-dark)] mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50/50 outline-none focus:border-[var(--color-primary-gold)]"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-order" className="block text-xs font-bold uppercase tracking-wider text-[var(--color-dark)] mb-1.5">
                        Order Number (Optional)
                      </label>
                      <input
                        id="contact-order"
                        type="text"
                        placeholder="e.g. YEZ12345"
                        value={formData.orderNumber}
                        onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                        className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50/50 outline-none focus:border-[var(--color-primary-gold)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="block text-xs font-bold uppercase tracking-wider text-[var(--color-dark)] mb-1.5">
                      Subject
                    </label>
                    <select
                      id="contact-subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 text-sm font-medium rounded-xl border border-gray-200 bg-gray-50/50 outline-none focus:border-[var(--color-primary-gold)]"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Order Status & Delivery">Order Status & Delivery</option>
                      <option value="Returns & Exchanges">Returns & Exchanges</option>
                      <option value="Custom Size & Bespoke Stitching">Custom Size & Bespoke Stitching</option>
                      <option value="Franchise & Retail Collaboration">Franchise & Retail Collaboration</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-bold uppercase tracking-wider text-[var(--color-dark)] mb-1.5">
                      Your Message *
                    </label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      required
                      placeholder="How can we assist your fashion journey today?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50/50 outline-none focus:border-[var(--color-primary-gold)] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-gold-light)] text-[var(--color-dark)] font-bold text-xs uppercase tracking-[0.18em] rounded-xl hover:shadow-gold-md transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-[var(--color-dark)] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={16} /> Submit Request
                      </>
                    )}
                  </button>
                </form>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-[var(--color-champagne)] shadow-soft-sm space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="text-[var(--color-primary-gold)]" size={22} />
                <h3 className="font-display font-bold text-lg text-[var(--color-dark)]">Concierge Hours</h3>
              </div>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span>Monday - Saturday:</span>
                  <span className="font-bold text-black">10:00 AM - 8:00 PM IST</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span>Sunday:</span>
                  <span className="font-bold text-black">11:00 AM - 6:00 PM IST</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span>Online Orders:</span>
                  <span className="font-bold text-emerald-600">24/7 Active</span>
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-darker)] text-white p-8 rounded-3xl space-y-4 shadow-dark-md">
              <h3 className="font-display font-bold text-lg text-[var(--color-gold-light)] flex items-center gap-2">
                <HelpCircle size={20} /> Looking for Quick Info?
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Check our self-service tools for instant answers regarding shipping, size customization, and order tracking.
              </p>
              <div className="space-y-2 pt-2 text-xs">
                <Link href="/track-order" className="block py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors">
                  📦 Track Existing Order Status →
                </Link>
                <Link href="/sale" className="block py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors">
                  🏷️ View Active Sale & Special Offers →
                </Link>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
