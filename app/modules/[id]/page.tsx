import ModuleDetailPageContent from './ModuleDetailPageContent';

export async function generateStaticParams() {
  return [{ id: '_' }];
}

export default function Page() {
  return <ModuleDetailPageContent />;
}
