import Link from 'next/link';
import { ChevronRight, FolderOpen } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  articleCount?: number;
}

interface CategoryListProps {
  categories: Category[];
  currentSlug?: string;
  title?: string;
  showCount?: boolean;
  className?: string;
}

export function CategoryList({
  categories,
  currentSlug,
  title = 'Categories',
  showCount = true,
  className,
}: CategoryListProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className={cn('', className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FolderOpen className="w-5 h-5 text-coral-500" />
        {title}
      </h3>
      <nav aria-label="Categories">
        <ul className="space-y-1">
          {categories.map((category) => {
            const isActive = category.slug === currentSlug;
            return (
              <li key={category.id}>
                <Link
                  href={`/blog/category/${category.slug}`}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors group',
                    isActive
                      ? 'bg-coral-50 text-coral-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="flex items-center gap-2">
                    <ChevronRight
                      className={cn(
                        'w-4 h-4 transition-transform',
                        isActive
                          ? 'text-coral-500'
                          : 'text-gray-400 group-hover:translate-x-0.5'
                      )}
                    />
                    {category.name}
                  </span>
                  {showCount && category.articleCount !== undefined && (
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        isActive
                          ? 'bg-coral-100 text-coral-700'
                          : 'bg-gray-100 text-gray-500'
                      )}
                    >
                      {category.articleCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export default CategoryList;
