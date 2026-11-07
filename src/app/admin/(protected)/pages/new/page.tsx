import PostEditorScreen from '@/components/admin/content/PostEditorScreen';

export default function NewPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <PostEditorScreen type="page" searchParams={searchParams} />;
}
