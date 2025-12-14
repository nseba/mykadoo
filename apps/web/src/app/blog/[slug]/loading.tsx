import {
  ArticleContentSkeleton,
  ArticleCardSkeleton,
  AuthorSkeleton,
  Skeleton,
} from '../../../components/ui/Skeleton';

export default function ArticleLoading() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white py-8 border-b border-gray-200">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs skeleton */}
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>

          <div className="max-w-3xl">
            {/* Category */}
            <Skeleton className="h-6 w-24 mb-4 rounded-full" />
            {/* Title */}
            <Skeleton className="h-10 w-full mb-3" />
            <Skeleton className="h-10 w-3/4 mb-6" />
            {/* Excerpt */}
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-5 w-2/3 mb-6" />
            {/* Meta */}
            <div className="flex items-center gap-6">
              <AuthorSkeleton />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      <div className="container mx-auto px-4">
        <Skeleton className="aspect-[21/9] w-full -mt-4 rounded-xl" />
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Table of Contents Skeleton */}
          <aside className="lg:w-1/4 order-2 lg:order-1">
            <div className="lg:sticky lg:top-8">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <article className="lg:w-3/4 order-1 lg:order-2">
            <ArticleContentSkeleton />
          </article>
        </div>
      </div>

      {/* Related Articles */}
      <section className="bg-white py-12 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
