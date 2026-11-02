'use client';

import { useParams } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';

export default function EditProductPage() {
  const params = useParams();
  const id = (params?.id as string) || '';

  return <ProductForm mode="edit" productId={id} />;
}
