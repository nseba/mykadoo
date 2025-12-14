import { ArticleGridSkeleton, Skeleton } from '../../../../components/ui/Skeleton';

export default function TagLoading() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-gray-700 to-gray-800 text-white py-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs skeleton */}
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-4 w-12 bg-white/30" />
            <Skeleton className="h-4 w-4 rounded-full bg-white/30" />
            <Skeleton className="h-4 w-24 bg-white/30" />
          </div>
          {/* Tag label */}
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-5 w-12 bg-white/30" />
            <Skeleton className="h-8 w-24 rounded-full bg-coral-500/50" />
          </div>
          {/* Title */}
          <Skeleton className="h-12 w-1/2 bg-white/30" />
        </div>
      </section>

      {/* Articles */}
      <div className="container mx-auto px-4 py-12">
        <ArticleGridSkeleton count={9} />
      </div>
    </main>
  );
}
