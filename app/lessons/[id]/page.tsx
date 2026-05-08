import { Suspense } from 'react';
import LessonPlayerPageContent from './LessonPlayerPageContent';

export async function generateStaticParams() {
  return [{ id: '_' }];
}

export default function Page() {
  // Next.js 15: `useSearchParams()` requires a Suspense boundary during prerender.
  return (
    <Suspense fallback={null}>
      <LessonPlayerPageContent />
    </Suspense>
  );
}
