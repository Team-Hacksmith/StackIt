import { PostDetail } from '@/components/posts/PostDetail';
import { Navbar } from '@/components/layout/Navbar';

interface PostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const postId = parseInt(id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PostDetail postId={postId} />
      </div>
    </div>
  );
}
