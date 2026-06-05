'use client';
import { useEffect, useState } from 'react';
import { getProductsWithOffers, getActiveOffers, getCategories } from '@/lib/api';
import ProductCard from '@/components/store/ProductCard';
import Navbar from '@/components/store/Navbar';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import Footer from '@/components/store/Footer';

const BRANDS = ['APPLE', 'SONY', 'SAMSUNG', 'CANON', 'BOSE', 'DELL', 'LOGITECH', 'DJI', 'APPLE', 'SONY', 'SAMSUNG', 'CANON', 'BOSE', 'DELL', 'LOGITECH', 'DJI'];

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=85',
    label: 'FEATURED / TECH ESSENTIALS',
    tag: 'NEW SEASON',
  },
  {
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=85',
    label: 'FEATURED / AUDIO',
    tag: 'BEST SELLER',
  },
  {
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=85',
    label: 'FEATURED / LAPTOPS',
    tag: 'TOP RATED',
  },
  {
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=85',
    label: 'FEATURED / ACCESSORIES',
    tag: 'LIMITED',
  },
];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flashOffer, setFlashOffer] = useState(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroSlides, setHeroSlides] = useState(HERO_SLIDES);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getProductsWithOffers({ sort: 'newest', limit: 8 }).then(r => {
      const prods = r.data || [];
      setProducts(prods);
      setLoading(false);
      // Build hero slides from product images — shuffle and pick up to 6
      const withImages = prods.filter(p => p.image);
      if (withImages.length > 0) {
        const shuffled = [...withImages].sort(() => Math.random() - 0.5).slice(0, 6);
        setHeroSlides(shuffled.map(p => ({
          image: p.image,
          label: `FEATURED / ${(p.category || 'PRODUCT').toUpperCase()}`,
          tag: p.brand?.toUpperCase() || 'NEW',
        })));
      }
    });
    const heroTimer = setInterval(() => setHeroIndex(i => (i + 1) % heroSlides.length), 4000);
    getCategories().then(r => setCategories(r.data || [])).catch(() => {});
    getActiveOffers().then(r => {
      const offers = r.data || [];
      // pick the offer with highest value for the flash banner
      const best = offers.sort((a, b) => b.value - a.value)[0] || null;
      setFlashOffer(best);
    }).catch(() => {});
    return () => clearInterval(heroTimer);
  }, []);

  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen">

        {/* ── HERO ── */}
        <section className="border-b border-gray-200">

          {/* ── MOBILE HERO (< md) ── */}
          <div className="relative md:hidden h-[88vh] min-h-[500px] overflow-hidden">
            {/* Slideshow bg */}
            {heroSlides.map((slide, i) => (
              <motion.div key={i} initial={false}
                animate={{ opacity: heroIndex === i ? 1 : 0 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="absolute inset-0">
                <img src={slide.image} alt={slide.label} className="w-full h-full object-cover" />
              </motion.div>
            ))}
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-between h-full px-5 py-8">
              {/* Top tag */}
              <div className="flex items-center justify-between">
                <span className="bg-[#dc2626] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5">
                  {heroSlides[heroIndex]?.label}
                </span>
                <span className="bg-white/10 backdrop-blur-sm text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5">
                  {heroSlides[heroIndex]?.tag}
                </span>
              </div>

              {/* Center text */}
              <div>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/60 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#dc2626] inline-block" />
                  VOL.04 / FEB 2026 / <span className="text-[#dc2626]">NEW SEASON</span>
                </motion.p>
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="font-black text-[3.2rem] leading-[0.9] tracking-[-0.04em] text-white mb-5">
                  Built for<br />the <span className="text-[#dc2626] italic">signal.</span>
                </motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                  className="text-white/70 text-sm mb-7 leading-relaxed max-w-xs">
                  Premium electronics curated for those who demand performance.
                </motion.p>
                <div className="flex gap-3">
                  <Link href="/products"
                    className="flex items-center gap-2 bg-white text-[#0a0a0a] px-5 py-3 text-sm font-bold hover:bg-[#dc2626] hover:text-white transition-colors">
                    Shop <ArrowRight size={14} />
                  </Link>
                  <Link href="/products?deals=true"
                    className="flex items-center gap-2 border border-white/50 text-white px-5 py-3 text-sm font-semibold hover:bg-white/10 transition-colors">
                    Deals <Zap size={13} />
                  </Link>
                </div>
              </div>

              {/* Dots + progress */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  {heroSlides.map((_, i) => (
                    <button key={i} onClick={() => setHeroIndex(i)}
                      className={`transition-all duration-300 rounded-full ${
                        heroIndex === i ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/30'
                      }`} />
                  ))}
                </div>
                <div className="h-[2px] bg-white/20">
                  <motion.div key={heroIndex} initial={{ width: '0%' }} animate={{ width: '100%' }}
                    transition={{ duration: 4, ease: 'linear' }} className="h-full bg-[#dc2626]" />
                </div>
              </div>
            </div>
          </div>

          {/* ── DESKTOP HERO (>= md) ── */}
          <div className="hidden md:grid md:grid-cols-2 max-w-[1400px] mx-auto min-h-[560px]">
            {/* Left */}
            <div className="flex flex-col justify-center py-16 px-6 border-r border-gray-200">
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-500 mb-6 flex items-center gap-3">
                <span className="w-2 h-2 bg-[#dc2626] inline-block" />
                VOL.04 / FEB 2026 / <span className="text-[#dc2626]">NEW SEASON</span>
              </motion.p>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="font-black text-[4rem] lg:text-[5.5rem] leading-[0.88] tracking-[-0.04em] text-[#0a0a0a] mb-8">
                Built for<br />the <span className="text-[#dc2626] italic">signal.</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                className="text-gray-500 text-base mb-10 max-w-sm leading-relaxed">
                Premium electronics curated for those who demand performance. No compromises.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="flex gap-3 flex-wrap">
                <Link href="/products"
                  className="flex items-center gap-2 bg-[#0a0a0a] text-white px-7 py-3.5 text-sm font-semibold hover:bg-[#dc2626] transition-colors">
                  Shop everything <ArrowRight size={15} />
                </Link>
                <Link href="/products?deals=true"
                  className="flex items-center gap-2 border-[1.5px] border-[#0a0a0a] text-[#0a0a0a] px-7 py-3.5 text-sm font-semibold hover:bg-[#0a0a0a] hover:text-white transition-colors">
                  Today's deals <Zap size={14} />
                </Link>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                className="mt-12 text-[10px] font-mono text-gray-400 space-y-0.5">
                <p>LAT 40.7128°N</p>
                <p>LNG 74.0060°W</p>
                <p className="text-[#dc2626]">NYC HQ</p>
              </motion.div>
            </div>

            {/* Right — slideshow */}
            <div className="relative overflow-hidden bg-gray-100">
              {heroSlides.map((slide, i) => (
                <motion.div key={i} initial={false}
                  animate={{ opacity: heroIndex === i ? 1 : 0 }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                  className="absolute inset-0">
                  <img src={slide.image} alt={slide.label} className="w-full h-full object-cover" />
                </motion.div>
              ))}
              <div className="absolute top-4 left-4 z-10 bg-[#dc2626] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5">
                {heroSlides[heroIndex]?.label}
              </div>
              <div className="absolute top-4 right-4 z-10 bg-[#0a0a0a] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5">
                {heroSlides[heroIndex]?.tag}
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
                {heroSlides.map((_, i) => (
                  <button key={i} onClick={() => setHeroIndex(i)}
                    className={`transition-all duration-300 rounded-full ${
                      heroIndex === i ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                    }`} />
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 z-10 h-[2px] bg-white/20">
                <motion.div key={heroIndex} initial={{ width: '0%' }} animate={{ width: '100%' }}
                  transition={{ duration: 4, ease: 'linear' }} className="h-full bg-[#dc2626]" />
              </div>
            </div>
          </div>

        </section>

        {/* ── BRAND TICKER ── */}
        <section className="border-b border-gray-200 py-5 overflow-hidden bg-white">
          <div className="ticker-wrap">
            <div className="ticker-track">
              {BRANDS.map((b, i) => (
                <span key={i} className="inline-flex items-center gap-5 mx-8">
                  <span className="text-base font-black tracking-widest text-[#0a0a0a] uppercase">{b}</span>
                  <span className="text-[#dc2626] font-black text-xl leading-none">/</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── SHOP BY CATEGORY ── */}
        {categories.length > 0 && (
          <section className="border-b border-gray-200">
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-10 pb-12">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="section-label mb-2">[ 002 / CATEGORIES ]</p>
                  <h2 className="font-black text-[1.8rem] md:text-[2.8rem] tracking-[-0.03em] leading-none text-[#0a0a0a]">
                    Shop by category.
                  </h2>
                </div>
                <Link href="/products"
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#dc2626] transition-colors">
                  All products <ArrowRight size={14} />
                </Link>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 border-l border-t border-gray-200">
                {categories.map((cat, i) => (
                  <motion.div
                    key={cat._id}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="border-r border-b border-gray-200"
                  >
                    <Link
                      href={`/products?category=${cat.name}`}
                      className="group relative flex flex-col justify-end overflow-hidden min-h-[140px] md:min-h-[160px]"
                    >
                      {/* Image */}
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-100" />
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      {/* Content */}
                      <div className="relative z-10 p-5">
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#dc2626] mb-1">
                          {String(i + 1).padStart(2, '0')}
                        </p>
                        <h3 className="font-black text-lg md:text-xl tracking-[-0.02em] text-white leading-tight">
                          {cat.name}
                        </h3>
                        <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-white/60 group-hover:text-white transition-colors">
                          Shop <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── NEW & TRENDING ── */}
        <section className="max-w-[1400px] mx-auto px-4 md:px-6 pb-16 pt-10">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="section-label mb-2">[ 003 / CATALOGUE ]</p>
              <h2 className="font-black text-[1.8rem] md:text-[2.8rem] tracking-[-0.03em] leading-none text-[#0a0a0a]">
                New &amp; trending.
              </h2>
            </div>
            <Link href="/products"
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#dc2626] transition-colors">
              See full catalogue <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-l border-t border-gray-200">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="border-r border-b border-gray-200">
                  <div className="skeleton h-56 w-full" />
                  <div className="p-4 space-y-2">
                    <div className="skeleton h-3 w-16" />
                    <div className="skeleton h-4 w-full" />
                    <div className="skeleton h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 border-l border-t border-gray-200">
              {products.map((p, i) => (
                <motion.div key={p._id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="border-r border-b border-gray-200">
                  <ProductCard product={p} index={i} />
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* ── FLASH SALE BANNER ── */}
        {flashOffer && (
        <section className="bg-[#dc2626] text-white">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-12 md:py-16 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-red-200 mb-4">
                [ {flashOffer.badge || 'FLASH'} / {Math.ceil((new Date(flashOffer.endDate) - new Date()) / 3600000)}H ONLY ]
              </p>
              <h2 className="font-black text-[2.5rem] md:text-[4rem] leading-[0.9] tracking-[-0.03em] mb-3">
                Up to -{flashOffer.type === 'percentage' ? `${flashOffer.value}%` : `₹${flashOffer.value}`}<br />this weekend.
              </h2>
              <p className="text-red-200 text-sm mb-6">{flashOffer.description}</p>
              <Link href="/products"
                className="inline-flex items-center gap-2 bg-white text-[#dc2626] px-8 py-3.5 text-sm font-bold hover:bg-gray-100 transition-colors">
                Shop the sale <ArrowRight size={14} />
              </Link>
            </div>

            {/* Featured deal cards */}
            <div className="grid grid-cols-2 gap-3">
              {!loading && products.filter(p => p.offerPrice).slice(0, 2).concat(
                products.filter(p => !p.offerPrice).slice(0, 2)
              ).slice(0, 2).map(p => (
                <Link key={p._id} href={`/products/${p._id}`}
                  className="bg-white group overflow-hidden">
                  <img src={p.image || 'https://placehold.co/300x200'} alt={p.name}
                    className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="p-3">
                    <p className="text-[10px] font-semibold tracking-widest text-gray-500 uppercase">{p.brand}</p>
                    <p className="text-sm font-bold text-[#0a0a0a] truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm font-black text-[#0a0a0a]">
                        ₹{(p.offerPrice || p.price)?.toLocaleString()}
                      </p>
                      {p.offerPrice && (
                        <p className="text-xs text-gray-400 line-through">₹{p.price?.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
              {loading && Array(2).fill(0).map((_, i) => (
                <div key={i} className="bg-white">
                  <div className="skeleton h-36 w-full" />
                  <div className="p-3 space-y-2">
                    <div className="skeleton h-3 w-16" />
                    <div className="skeleton h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        )}

      </main>
      <Footer />
    </>
  );
}
