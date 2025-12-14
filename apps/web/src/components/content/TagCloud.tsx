import Link from 'next/link';
import { Tag } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TagItem {
  id: string;
  name: string;
  slug: string;
  articleCount?: number;
}

interface TagCloudProps {
  tags: TagItem[];
  currentSlug?: string;
  title?: string;
  maxTags?: number;
  showCount?: boolean;
  className?: string;
}

export function TagCloud({
  tags,
  currentSlug,
  title = 'Popular Tags',
  maxTags = 15,
  showCount = false,
  className,
}: TagCloudProps) {
  if (tags.length === 0) {
    return null;
  }

  // Sort by article count if available, then slice to max
  const displayTags = [...tags]
    .sort((a, b) => (b.articleCount || 0) - (a.articleCount || 0))
    .slice(0, maxTags);

  return (
    <div className={cn('', className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Tag className="w-5 h-5 text-coral-500" />
        {title}
      </h3>
      <div className="flex flex-wrap gap-2" role="list" aria-label="Tags">
        {displayTags.map((tag) => {
          const isActive = tag.slug === currentSlug;
          return (
            <Link
              key={tag.id}
              href={`/blog/tag/${tag.slug}`}
              className={cn(
                'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors',
                isActive
                  ? 'bg-coral-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-coral-50 hover:text-coral-700'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {tag.name}
              {showCount && tag.articleCount !== undefined && (
                <span
                  className={cn(
                    'text-xs',
                    isActive ? 'text-coral-100' : 'text-gray-400'
                  )}
                >
                  ({tag.articleCount})
                </span>
              )}
            </Link>
          );
        })}
      </div>
      {tags.length > maxTags && (
        <Link
          href="/blog/tags"
          className="text-sm text-coral-600 hover:text-coral-700 mt-3 inline-block"
        >
          View all tags
        </Link>
      )}
    </div>
  );
}

export default TagCloud;
