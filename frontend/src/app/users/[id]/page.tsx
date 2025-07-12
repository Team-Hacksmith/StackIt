import { UserProfile } from '@/components/users/UserProfile';
import { Navbar } from '@/components/layout/Navbar';

interface UserPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UserPage({ params }: UserPageProps) {
  const { id } = await params;
  const userId = parseInt(id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserProfile userId={userId} />
      </div>
    </div>
  );
}
