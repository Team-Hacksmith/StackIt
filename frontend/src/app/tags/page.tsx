import { Navbar } from "@/components/layout/Navbar";
import { TagsList } from "@/components/tags/TagsList";

export default function TagsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
          <p className="text-gray-600 mt-1">Browse tags</p>
        </div>

        <TagsList />
      </div>
    </div>
  );
}
