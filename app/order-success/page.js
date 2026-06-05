import Link from 'next/link';
import { CheckCircle, ShoppingBag, Package } from 'lucide-react';

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col items-center justify-center text-center gap-5 px-4">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle size={40} className="text-green-600" />
      </div>
      <h1 className="classic-heading text-3xl text-gray-900">Order Placed!</h1>
      <p className="text-gray-500 text-sm max-w-xs">
        Thank you for your purchase. We'll process and ship your order shortly.
      </p>
      <div className="flex gap-4 mt-2 flex-wrap justify-center">
        <Link href="/products"
          className="btn-primary px-6 py-2.5 flex items-center gap-2">
          <ShoppingBag size={14} /> Continue Shopping
        </Link>
        <Link href="/orders"
          className="btn-outline px-6 py-2.5 flex items-center gap-2">
          <Package size={14} /> My Orders
        </Link>
      </div>
    </div>
  );
}
