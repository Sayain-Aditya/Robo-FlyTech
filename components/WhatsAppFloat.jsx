'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

const PHONE = '918765034655';

// Pages where floaters should be visible
const ALLOWED = ['/', '/products', '/about', '/profile', '/orders'];

export default function FloatButtons() {
  const pathname = usePathname();
  const { totalItems } = useCart();

  const show = ALLOWED.some(p =>
    p === '/' ? pathname === '/' : pathname === p || pathname.startsWith(p + '/')
  );

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-5 z-50 flex flex-col items-center gap-3">

      {/* Cart floater */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
            <Link href="/cart"
              className="relative w-13 h-13 w-[52px] h-[52px] rounded-full bg-[#0a0a0a] flex items-center justify-center shadow-lg hover:bg-[#dc2626] transition-colors">
              <ShoppingBag size={22} className="text-white" />
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#dc2626] text-white text-[10px] font-black flex items-center justify-center">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp floater */}
      <motion.a
        href={`https://wa.me/${PHONE}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-[52px] h-[52px] rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:bg-[#1ebe5d] transition-colors">
        <svg viewBox="0 0 32 32" width="26" height="26" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2C8.268 2 2 8.268 2 16c0 2.494.651 4.836 1.788 6.865L2 30l7.347-1.768A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.6a11.55 11.55 0 0 1-5.89-1.608l-.422-.25-4.36 1.05 1.082-4.243-.276-.437A11.535 11.535 0 0 1 4.4 16C4.4 9.593 9.593 4.4 16 4.4S27.6 9.593 27.6 16 22.407 27.6 16 27.6zm6.33-8.61c-.347-.174-2.055-1.013-2.374-1.129-.319-.116-.55-.174-.782.174-.231.347-.897 1.129-1.1 1.36-.202.232-.405.26-.752.087-.347-.174-1.464-.54-2.788-1.72-1.03-.918-1.726-2.052-1.928-2.399-.202-.347-.022-.535.152-.708.156-.155.347-.405.52-.608.174-.202.232-.347.347-.578.116-.232.058-.434-.029-.608-.087-.174-.782-1.884-1.072-2.58-.282-.677-.569-.585-.782-.595l-.666-.011c-.231 0-.608.087-.927.434-.318.347-1.215 1.187-1.215 2.895s1.244 3.357 1.417 3.588c.174.232 2.448 3.736 5.93 5.239.829.358 1.476.572 1.98.732.832.265 1.589.228 2.188.138.667-.1 2.055-.84 2.345-1.651.29-.811.29-1.507.203-1.651-.086-.145-.318-.232-.665-.405z"/>
        </svg>
      </motion.a>
    </div>
  );
}
