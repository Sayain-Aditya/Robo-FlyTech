'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');

  return (
    <footer className="bg-[#0a0a0a] text-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-12 md:py-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">

        {/* Newsletter */}
        <div className="md:col-span-1">
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-gray-500 mb-4">
            [ NEWSLETTER / 003 ]
          </p>
          <h3 className="font-black text-[2rem] leading-[0.95] tracking-[-0.02em] mb-6">
            Get drops before <span className="text-[#dc2626]">anyone</span> else.
          </h3>
          <form
            onSubmit={e => { e.preventDefault(); setEmail(''); }}
            className="border-b border-gray-700 pb-4 flex items-center gap-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="bg-transparent border-none outline-none text-sm text-gray-300 placeholder:text-gray-600 flex-1"
            />
            <button type="submit"
              className="text-xs font-semibold tracking-wider text-white hover:text-[#dc2626] transition-colors flex items-center gap-1 shrink-0">
              Subscribe <ArrowRight size={12} />
            </button>
          </form>
        </div>

        {/* Shop */}
        <div>
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-gray-500 mb-4">SHOP</p>
          <div className="space-y-2.5">
            {['Laptops', 'Smartphones', 'Audio', 'Cameras', 'Wearables'].map(l => (
              <Link key={l} href={`/products?category=${l}`}
                className="block text-sm text-gray-400 hover:text-white transition-colors">{l}</Link>
            ))}
          </div>
        </div>

        {/* Support */}
        <div>
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-gray-500 mb-4">SUPPORT</p>
          <div className="space-y-2.5">
            {['Order Tracking', 'Returns', 'Warranty', 'Contact'].map(l => (
              <Link key={l} href="#"
                className="block text-sm text-[#dc2626] hover:text-red-400 transition-colors">{l}</Link>
            ))}
          </div>
        </div>

        {/* Company */}
        <div>
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-gray-500 mb-4">COMPANY</p>
          <div className="space-y-2.5">
            {['About Us', 'Careers', 'Press', 'Sustainability'].map(l => (
              <Link key={l} href="#"
                className="block text-sm text-gray-400 hover:text-white transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-[1400px] mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-gray-600 tracking-widest uppercase">
            © 2026 VOLT. ELECTRONICS / ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-6">
            {['PRIVACY', 'TERMS', 'COOKIES', 'ADMIN'].map(l => (
              <Link key={l} href={l === 'ADMIN' ? '/admin' : '#'}
                className="text-[11px] text-gray-600 hover:text-white tracking-widest uppercase transition-colors">
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
