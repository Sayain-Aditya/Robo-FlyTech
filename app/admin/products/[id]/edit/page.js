'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getProduct } from '@/lib/api';
import ProductForm from '@/components/admin/ProductForm';

export default function EditProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    getProduct(id).then(r => setProduct(r.data));
  }, [id]);

  if (!product) return <p className="p-8 text-gray-500">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <ProductForm initial={product} />
    </div>
  );
}
