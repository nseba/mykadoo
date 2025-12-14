import {
  ArticleGridSkeleton,
  FeaturedArticleSkeleton,
  SidebarSkeleton,
} from '../../components/ui/Skeleton';

export default function BlogLoading() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section Skeleton */}
      <section className="bg-gradient-to-br from-coral-500 to-coral-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-12 bg-white/20 rounded w-1/2 mb-4" />
            <div className="h-6 bg-white/20 rounded w-2/3 max-w-xl" />
          </div>
        </div>
      </section>

      {/* Featured Article Skeleton */}
      <section className="container mx-auto px-4 -mt-8">
        <FeaturedArticleSkeleton />
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Articles Grid */}
          <div className="lg:w-2/3">
            <div className="h-8 w-32 bg-gray-200 animate-pulse rounded mb-6" />
            <ArticleGridSkeleton count={6} />
          </div>

          {/* Sidebar */}
          <aside className="lg:w-1/3">
            <SidebarSkeleton />
          </aside>
        </div>
      </div>
    </main>
  );
}
