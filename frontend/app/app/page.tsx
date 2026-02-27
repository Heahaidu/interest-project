'use client';

import { redirect, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/app/discover');
  }, [])

  return null;
}
