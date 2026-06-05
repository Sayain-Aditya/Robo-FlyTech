'use client';
import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import Link from 'next/link';
import { ArrowRight, Zap, Package, Shield } from 'lucide-react';
import { PageTransition, FadeInView, StaggerContainer, StaggerItem } from '@/components/Motion';

// ── Number counter hook ──────────────────────────────────────────────────────
function useCountUp(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

// ── Stat item with counter ───────────────────────────────────────────────────
function StatItem({ value, label, index }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  // Parse numeric part and suffix (e.g. "5K+" → 5, "K+") ("98%" → 98, "%")
  const match = value.match(/^(\d+)(.*)$/);
  const numeric = match ? parseInt(match[1]) : 0;
  const suffix = match ? match[2] : value;

  const count = useCountUp(numeric, 1600, visible);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
      className="px-6 py-10"
    >
      <p className="font-black text-[2.5rem] md:text-[3.5rem] leading-none tracking-[-0.04em] text-[#dc2626]">
        {visible ? `${count}${suffix}` : `0${suffix}`}
      </p>
      <p className="mt-2 text-xs font-semibold tracking-widest uppercase text-gray-500">{label}</p>
    </motion.div>
  );
}

// ── Data ─────────────────────────────────────────────────────────────────────
const STATS = [
  { value: '5K+',  label: 'Products in stock' },
  { value: '12K+', label: 'Happy customers' },
  { value: '98%',  label: 'Satisfaction rate' },
  { value: '2Day', label: 'Express shipping' },
];

const PILLARS = [
  {
    icon: Package,
    title: 'Our Mission',
    body: 'We make it easy to find the right drone, replacement part, or accessory for your next flight. Whether you are building, repairing, or upgrading, Robo Flytech delivers trusted products and friendly support.',
  },
  {
    icon: Zap,
    title: 'What We Offer',
    list: [
      'Drones for hobbyists, pros, and FPV pilots',
      'Propellers, motors, frames, and batteries',
      'Cameras, controllers, and flight electronics',
      'Voci Toci gadgets, smart accessories, and repair kits',
    ],
  },
  {
    icon: Shield,
    title: 'Why Choose Us',
    body: 'Robo Flytech combines curated products with fast shipping and dependable service. We focus on high-performance drone hardware and genuine replacement parts so your fleet stays airborne.',
  },
];

const DNA = [
  { label: 'Innovation', desc: 'Constantly expanding our catalogue with the latest flight tech.' },
  { label: 'Quality',    desc: 'Every product is selected for reliability and performance.' },
  { label: 'Support',    desc: 'Real expertise from people who fly and build drones.' },
  { label: 'Speed',      desc: 'Fast dispatch and express delivery so you never wait.' },
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <>
      <Navbar />
      <PageTransition variant="fadeUp">
        <main className="bg-white min-h-screen">

          {/* ── HERO ── */}
          <section className="border-b border-gray-200">
            <div className="max-w-[1400px] mx-auto px-6 py-16 md:py-24">
              <motion.p
                className="section-label mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                [ 001 / ABOUT US ]
              </motion.p>
              <div className="grid md:grid-cols-2 gap-10 items-end">
                <motion.h1
                  className="font-black text-[2.8rem] md:text-[4.5rem] leading-[0.9] tracking-[-0.04em] text-[#0a0a0a]"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
                >
                  Drone parts,<br />gear &amp; gadgets<br />for modern <span className="text-[#dc2626] italic">flyers.</span>
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                >
                  <p className="text-gray-500 text-base leading-relaxed mb-6">
                    Robo Flytech is the destination for drone enthusiasts, pilots, and builders. We specialize in high-quality drones, replacement components, flight accessories, and unique Voci Toci gadgets for every mission.
                  </p>
                  <Link href="/products" className="btn-primary inline-flex items-center gap-2">
                    Shop now <ArrowRight size={15} />
                  </Link>
                </motion.div>
              </div>
            </div>
          </section>

          {/* ── STATS (number counters) ── */}
          <section className="border-b border-gray-200">
            <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200">
              {STATS.map((s, i) => (
                <StatItem key={s.label} value={s.value} label={s.label} index={i} />
              ))}
            </div>
          </section>

          {/* ── THREE PILLARS ── */}
          <section className="border-b border-gray-200">
            <div className="max-w-[1400px] mx-auto px-6 py-14">
              <FadeInView>
                <p className="section-label mb-8">[ 002 / WHAT WE STAND FOR ]</p>
              </FadeInView>
              <StaggerContainer className="grid md:grid-cols-3 gap-0 border-l border-t border-gray-200">
                {PILLARS.map(({ icon: Icon, title, body, list }) => (
                  <StaggerItem key={title}>
                    <div className="border-r border-b border-gray-200 p-8 group hover:bg-gray-50 transition-colors h-full">
                      <div className="w-9 h-9 bg-[#0a0a0a] flex items-center justify-center mb-5 group-hover:bg-[#dc2626] transition-colors">
                        <Icon size={17} className="text-white" />
                      </div>
                      <h2 className="font-black text-xl tracking-[-0.02em] text-[#0a0a0a] mb-3">{title}</h2>
                      {body && <p className="text-sm text-gray-500 leading-relaxed">{body}</p>}
                      {list && (
                        <ul className="space-y-2 text-sm text-gray-500">
                          {list.map(item => (
                            <li key={item} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-[#dc2626] mt-1.5 shrink-0 inline-block" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </section>

          {/* ── DNA ── */}
          <section className="border-b border-gray-200">
            <div className="max-w-[1400px] mx-auto px-6 py-14 grid md:grid-cols-2 gap-10 items-center">
              <FadeInView>
                <p className="section-label mb-4">[ 003 / OUR DNA ]</p>
                <h2 className="font-black text-[2rem] md:text-[3rem] leading-[0.92] tracking-[-0.03em] text-[#0a0a0a] mb-5">
                  Driven by<br />innovation &amp;<br />built for <span className="text-[#dc2626] italic">performance.</span>
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
                  From beginner kits to advanced racing drones, Robo Flytech is built for people who love technology, flight, and the future of drone mobility. Every item meets demanding standards for reliability, performance, and value.
                </p>
              </FadeInView>
              <StaggerContainer className="grid grid-cols-2 gap-0 border-l border-t border-gray-200">
                {DNA.map(({ label, desc }) => (
                  <StaggerItem key={label}>
                    <div className="border-r border-b border-gray-200 p-6 h-full">
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#dc2626] mb-2">{label}</p>
                      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </section>

          {/* ── CTA ── */}
          <FadeInView>
            <section className="bg-[#0a0a0a]">
              <div className="max-w-[1400px] mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-500 mb-3">[ 004 / GET STARTED ]</p>
                  <h2 className="font-black text-[2rem] md:text-[3rem] leading-[0.92] tracking-[-0.03em] text-white">
                    Ready to take<br />flight?
                  </h2>
                </div>
                <div className="flex gap-3">
                  <Link href="/products"
                    className="flex items-center gap-2 bg-white text-[#0a0a0a] px-7 py-3.5 text-sm font-bold hover:bg-[#dc2626] hover:text-white transition-colors">
                    Shop now <ArrowRight size={15} />
                  </Link>
                  <Link href="/products?deals=true"
                    className="flex items-center gap-2 border border-white/20 text-white px-7 py-3.5 text-sm font-semibold hover:border-white transition-colors">
                    Today's deals <Zap size={13} />
                  </Link>
                </div>
              </div>
            </section>
          </FadeInView>

        </main>
      </PageTransition>
      <Footer />
    </>
  );
}
