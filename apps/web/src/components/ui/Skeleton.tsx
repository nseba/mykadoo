import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 rounded',
        className
      )}
      style={style}
    />
  );
}

export function ArticleCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
      {/* Image placeholder */}
      <Skeleton className="aspect-[16/10]" />
      <div className="p-5">
        {/* Category/date */}
        <Skeleton className="h-4 w-1/4 mb-3" />
        {/* Title */}
        <Skeleton className="h-6 w-3/4 mb-2" />
        {/* Excerpt */}
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-4" />
        {/* Author */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

export function ArticleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function FeaturedArticleSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 md:flex">
      {/* Image placeholder */}
      <Skeleton className="aspect-[16/10] md:w-1/2 md:aspect-auto" />
      <div className="p-6 md:w-1/2 flex flex-col justify-center">
        {/* Category */}
        <Skeleton className="h-5 w-20 mb-3" />
        {/* Title */}
        <Skeleton className="h-8 w-full mb-2" />
        <Skeleton className="h-8 w-3/4 mb-4" />
        {/* Excerpt */}
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-6" />
        {/* Author and meta */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ArticleContentSkeleton() {
  return (
    <div className="prose prose-lg max-w-none">
      {/* Intro paragraph */}
      <Skeleton className="h-5 w-full mb-2" />
      <Skeleton className="h-5 w-full mb-2" />
      <Skeleton className="h-5 w-3/4 mb-6" />

      {/* Heading */}
      <Skeleton className="h-8 w-1/2 mb-4" />

      {/* Paragraph */}
      <Skeleton className="h-5 w-full mb-2" />
      <Skeleton className="h-5 w-full mb-2" />
      <Skeleton className="h-5 w-full mb-2" />
      <Skeleton className="h-5 w-2/3 mb-6" />

      {/* Image placeholder */}
      <Skeleton className="aspect-video w-full mb-6 rounded-lg" />

      {/* Another heading */}
      <Skeleton className="h-8 w-2/5 mb-4" />

      {/* List items */}
      <div className="space-y-2 mb-6">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
      </div>

      {/* Final paragraph */}
      <Skeleton className="h-5 w-full mb-2" />
      <Skeleton className="h-5 w-full mb-2" />
      <Skeleton className="h-5 w-1/2" />
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="space-y-8">
      {/* Categories section */}
      <div>
        <Skeleton className="h-6 w-24 mb-4" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </div>

      {/* Popular tags section */}
      <div>
        <Skeleton className="h-6 w-28 mb-4" />
        <div className="flex flex-wrap gap-2">
          {[...Array(8)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-8 rounded-full"
              style={{ width: `${60 + Math.random() * 40}px` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AuthorSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div>
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 p-4">
      <Skeleton className="aspect-square w-full mb-4 rounded-lg" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-3" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default Skeleton;
