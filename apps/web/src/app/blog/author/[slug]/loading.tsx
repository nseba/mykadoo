import { ArticleGridSkeleton, Skeleton } from '../../../../components/ui/Skeleton';

export default function AuthorLoading() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white py-16 border-b border-gray-200">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs skeleton */}
          <div className="flex items-center gap-2 mb-8">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>

          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Avatar */}
            <Skeleton className="w-30 h-30 rounded-full" style={{ width: 120, height: 120 }} />

            {/* Author Info */}
            <div className="flex-1">
              {/* Name */}
              <Skeleton className="h-10 w-48 mb-3" />
              {/* Bio */}
              <Skeleton className="h-5 w-full max-w-2xl mb-2" />
              <Skeleton className="h-5 w-3/4 max-w-xl mb-4" />
              {/* Social links */}
              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles */}
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-8 w-48 mb-8" />
        <ArticleGridSkeleton count={9} />
      </div>
    </main>
  );
}
