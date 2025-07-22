'use client';

import { useParams } from 'next/navigation';
import dynamicImport from 'next/dynamic';

// Import dynamique pour éviter les erreurs de rendu côté serveur avec QRCode
const PresentationHostWithNoSSR = dynamicImport(
  () => import('@/components/Quiz/PresentationHost'),
  { 
    ssr: false,
    loading: () => (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }
);

export default function PresentationHostPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <PresentationHostWithNoSSR sessionId={sessionId} />
    </div>
  );
}