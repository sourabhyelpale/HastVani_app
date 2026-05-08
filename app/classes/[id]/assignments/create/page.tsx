import CreateAssignmentPageContent from './CreateAssignmentPageContent';

export async function generateStaticParams() {
  return [{ id: '_' }];
}

export default function Page() {
  return <CreateAssignmentPageContent />;
}
