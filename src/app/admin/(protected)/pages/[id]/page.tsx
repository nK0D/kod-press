import PostEditorScreen from '@/components/admin/content/PostEditorScreen';

export default function EditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <PostEditorScreen type="page" params={params} searchParams={searchParams} />;
}
