'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/store/Navbar';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { createOrder } from '@/lib/api';
import Link from 'next/link';
import { ChevronRight, Lock } from 'lucide-react';
import Footer from '@/components/store/Footer';

const STEPS = ['Shipping', 'Payment', 'Review'];

export default function CheckoutPage() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [shipping, setShipping] = useState({
    fullName: '', address: '', city: '', pin: '', country: 'India',
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const shippingCost = totalPrice > 999 ? 0 : 99;
  const total = totalPrice + shippingCost;

  if (!user) return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen">
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-6">
            <span>Home</span>
            <ChevronRight size={10} />
            <span className="text-[#0a0a0a]">Checkout</span>
          </div>

          <div className="flex items-end justify-between mb-10 border-b border-gray-200 pb-6">
            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-1">[ CHECKOUT / AUTH ]</p>
              <h1 className="font-black text-[3.5rem] tracking-[-0.04em] leading-none text-[#0a0a0a]">Checkout</h1>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <Lock size={40} className="text-gray-300" />
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-gray-400">[ LOGIN REQUIRED ]</p>
            <p className="font-black text-2xl text-[#0a0a0a]">Please log in to checkout</p>
            <p className="text-sm text-gray-500">You need an account to complete your purchase.</p>
            <Link href="/login"
              className="mt-2 bg-[#0a0a0a] text-white text-xs font-bold tracking-widest uppercase px-8 py-3 hover:bg-[#dc2626] transition-colors">
              Login →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );

  if (cartItems.length === 0) {
    router.push('/cart');
    return null;
  }

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');
    try {
      await createOrder({
        items: cartItems.map(i => ({
          product: i._id, name: i.name, image: i.image,
          price: i.price, quantity: i.qty,
        })),
        shippingAddress: shipping,
        paymentMethod,
        itemsPrice: totalPrice,
        shippingPrice: shippingCost,
        totalPrice: total,
      });
      clearCart();
      router.push('/order-success');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen">
        <div className="max-w-[1400px] mx-auto px-6 py-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-6">
            <span>Home</span>
            <ChevronRight size={10} />
            <span>Cart</span>
            <ChevronRight size={10} />
            <span className="text-[#0a0a0a]">Checkout</span>
          </div>

          {/* Header */}
          <div className="flex items-end justify-between mb-8 border-b border-gray-200 pb-6">
            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-1">
                [ CHECKOUT / STEP {step + 1} OF {STEPS.length} ]
              </p>
              <h1 className="font-black text-[3.5rem] tracking-[-0.04em] leading-none text-[#0a0a0a]">
                {STEPS[step]}
              </h1>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-0">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center">
                  <div className={`flex items-center gap-2 px-4 py-2 border text-xs font-bold tracking-widest uppercase transition-colors ${
                    i === step
                      ? 'bg-[#0a0a0a] text-white border-[#0a0a0a]'
                      : i < step
                        ? 'bg-[#dc2626] text-white border-[#dc2626]'
                        : 'bg-white text-gray-400 border-gray-200'
                  }`}>
                    <span>{i < step ? '✓' : String(i + 1).padStart(2, '0')}</span>
                    <span>{s}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`h-px w-6 ${i < step ? 'bg-[#dc2626]' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-10">

            {/* ── LEFT PANEL ── */}
            <div className="flex-1 min-w-0">

              {/* STEP 0 — Shipping */}
              {step === 0 && (
                <div className="border border-gray-200 p-8">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-6">Shipping Address</p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      ['fullName', 'Full Name', 'col-span-2'],
                      ['address',  'Street Address', 'col-span-2'],
                      ['city',     'City', ''],
                      ['pin',      'PIN Code', ''],
                      ['country',  'Country', ''],
                    ].map(([k, ph, span]) => (
                      <input key={k} placeholder={ph} required
                        className={`${span} border border-gray-200 px-4 py-3 text-sm font-medium text-[#0a0a0a] placeholder:text-gray-400 outline-none focus:border-[#0a0a0a] transition-colors`}
                        value={shipping[k]}
                        onChange={e => setShipping(s => ({ ...s, [k]: e.target.value }))} />
                    ))}
                  </div>
                  {error && <p className="text-[#dc2626] text-xs font-semibold mt-4">{error}</p>}
                  <button
                    onClick={() => {
                      if (Object.values(shipping).some(v => !v)) return setError('Please fill all fields');
                      setError(''); setStep(1);
                    }}
                    className="mt-8 w-full bg-[#0a0a0a] text-white text-xs font-bold tracking-widest uppercase py-4 hover:bg-[#dc2626] transition-colors">
                    Continue to Payment →
                  </button>
                </div>
              )}

              {/* STEP 1 — Payment */}
              {step === 1 && (
                <div className="border border-gray-200 p-8">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-6">Payment Method</p>
                  <div className="space-y-3">
                    {[
                      { id: 'COD',         label: 'Cash on Delivery',    sub: 'Pay when your order arrives' },
                      { id: 'UPI',         label: 'UPI',                  sub: 'GPay, PhonePe, Paytm & more' },
                      { id: 'Card',        label: 'Credit / Debit Card',  sub: 'Visa, Mastercard, RuPay' },
                      { id: 'NetBanking',  label: 'Net Banking',           sub: 'All major banks supported' },
                    ].map(m => (
                      <label key={m.id}
                        className={`flex items-center gap-4 p-4 border cursor-pointer transition-colors ${
                          paymentMethod === m.id
                            ? 'border-[#0a0a0a] bg-[#0a0a0a] text-white'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}>
                        <input type="radio" name="payment" value={m.id}
                          checked={paymentMethod === m.id}
                          onChange={() => setPaymentMethod(m.id)}
                          className="sr-only" />
                        <div className={`w-4 h-4 border-2 rounded-full flex items-center justify-center shrink-0 ${
                          paymentMethod === m.id ? 'border-white' : 'border-gray-400'
                        }`}>
                          {paymentMethod === m.id && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{m.label}</p>
                          <p className={`text-xs mt-0.5 ${paymentMethod === m.id ? 'text-gray-300' : 'text-gray-400'}`}>{m.sub}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-8">
                    <button onClick={() => setStep(0)}
                      className="flex-1 border border-gray-200 text-xs font-bold tracking-widest uppercase py-4 hover:border-[#0a0a0a] transition-colors">
                      ← Back
                    </button>
                    <button onClick={() => setStep(2)}
                      className="flex-1 bg-[#0a0a0a] text-white text-xs font-bold tracking-widest uppercase py-4 hover:bg-[#dc2626] transition-colors">
                      Review Order →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2 — Review */}
              {step === 2 && (
                <div className="border border-gray-200 p-8">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-6">Review Order</p>

                  {/* Shipping summary */}
                  <div className="border border-gray-100 p-5 mb-6">
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-3">Shipping To</p>
                    <p className="text-sm font-bold text-[#0a0a0a]">{shipping.fullName}</p>
                    <p className="text-sm text-gray-500 mt-1">{shipping.address}</p>
                    <p className="text-sm text-gray-500">{shipping.city} — {shipping.pin}, {shipping.country}</p>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mt-3">
                      Payment: <span className="text-[#0a0a0a]">{paymentMethod}</span>
                    </p>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-gray-100">
                    {cartItems.map(item => (
                      <div key={item._id} className="flex justify-between items-center py-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <img src={item.image || 'https://placehold.co/48x48?text=...'} alt=""
                            className="w-12 h-12 object-cover border border-gray-100 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#0a0a0a] truncate">{item.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">Qty: {item.qty}</p>
                          </div>
                        </div>
                        <span className="text-sm font-black text-[#0a0a0a] shrink-0 ml-4">
                          ₹{(item.price * item.qty).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {error && <p className="text-[#dc2626] text-xs font-semibold mt-4">{error}</p>}

                  <div className="flex gap-3 mt-8">
                    <button onClick={() => setStep(1)}
                      className="flex-1 border border-gray-200 text-xs font-bold tracking-widest uppercase py-4 hover:border-[#0a0a0a] transition-colors">
                      ← Back
                    </button>
                    <button onClick={handlePlaceOrder} disabled={loading}
                      className="flex-1 bg-[#dc2626] text-white text-xs font-bold tracking-widest uppercase py-4 hover:bg-[#b91c1c] transition-colors disabled:opacity-50">
                      {loading ? 'Placing Order...' : 'Place Order →'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── ORDER SUMMARY SIDEBAR ── */}
            <aside className="w-72 shrink-0">
              <div className="border border-gray-200 p-6 sticky top-24">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-4">Order Summary</p>

                <div className="space-y-3 mb-4">
                  {cartItems.map(i => (
                    <div key={i._id} className="flex justify-between items-start gap-2">
                      <span className="text-xs text-gray-500 leading-relaxed flex-1">{i.name} <span className="text-gray-400">×{i.qty}</span></span>
                      <span className="text-xs font-bold text-[#0a0a0a] shrink-0">₹{(i.price * i.qty).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Subtotal</span>
                    <span>₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Shipping</span>
                    <span className={shippingCost === 0 ? 'text-green-600 font-bold' : ''}>
                      {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                    </span>
                  </div>
                  {shippingCost === 0 && (
                    <p className="text-[10px] text-gray-400">Free shipping on orders over ₹999</p>
                  )}
                </div>

                <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-baseline">
                  <span className="text-xs font-bold tracking-widest uppercase text-gray-400">Total</span>
                  <span className="font-black text-xl text-[#0a0a0a]">₹{total.toLocaleString()}</span>
                </div>
              </div>
            </aside>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
