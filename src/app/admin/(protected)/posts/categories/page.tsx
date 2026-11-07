import TermsScreen from '@/components/admin/content/TermsScreen';

export default function TermsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <TermsScreen taxonomy="category" searchParams={searchParams} />;
}
