import PostListScreen from '@/components/admin/content/PostListScreen';

export default function ListPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <PostListScreen type="post" searchParams={searchParams} />;
}
