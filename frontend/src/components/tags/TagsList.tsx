'use client';

import { useTags } from '@/hooks/useTags';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export function TagsList() {
  const { data: tags, isLoading, error } = useTags();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load tags. Please try again.</p>
      </div>
    );
  }

  if (!tags?.data?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No tags available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tags.data.map((tag) => (
        <Card key={tag.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <Link href={`/?tag=${tag.title}`}>
              <Badge variant="secondary" className="mb-2 text-sm">
                {tag.title}
              </Badge>
              <p className="text-sm text-gray-600">
                Questions tagged with {tag.title}
              </p>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
