import ClassDetailsPageContent from './ClassDetailsPageContent';

export async function generateStaticParams() {
  return [{ id: '_' }];
}

export default function Page() {
  return <ClassDetailsPageContent />;
}
