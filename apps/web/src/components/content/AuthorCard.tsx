'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Linkedin, Globe } from 'lucide-react';
import type { Author } from '../../lib/content-api';

interface AuthorCardProps {
  author: Author | {
    id: string;
    name: string;
    slug: string;
    avatarUrl?: string;
    bio?: string;
    twitterHandle?: string;
    linkedinUrl?: string;
    websiteUrl?: string;
  };
  variant?: 'default' | 'compact' | 'inline';
  showSocialLinks?: boolean;
}

export function AuthorCard({
  author,
  variant = 'default',
  showSocialLinks = true,
}: AuthorCardProps) {
  const hasSocialLinks =
    showSocialLinks &&
    (author.twitterHandle || author.linkedinUrl || author.websiteUrl);

  if (variant === 'inline') {
    return (
      <Link
        href={`/blog/author/${author.slug}`}
        className="inline-flex items-center gap-2 group"
      >
        {author.avatarUrl ? (
          <Image
            src={author.avatarUrl}
            alt={author.name}
            width={24}
            height={24}
            className="rounded-full"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-coral-100 flex items-center justify-center">
            <span className="text-coral-600 text-xs font-medium">
              {author.name.charAt(0)}
            </span>
          </div>
        )}
        <span className="text-sm font-medium text-gray-900 group-hover:text-coral-600 transition-colors">
          {author.name}
        </span>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3">
        <Link href={`/blog/author/${author.slug}`}>
          {author.avatarUrl ? (
            <Image
              src={author.avatarUrl}
              alt={author.name}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-coral-100 flex items-center justify-center">
              <span className="text-coral-600 text-base font-medium">
                {author.name.charAt(0)}
              </span>
            </div>
          )}
        </Link>
        <div>
          <Link
            href={`/blog/author/${author.slug}`}
            className="font-medium text-gray-900 hover:text-coral-600 transition-colors"
          >
            {author.name}
          </Link>
        </div>
      </div>
    );
  }

  // Default variant - full author card
  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <Link href={`/blog/author/${author.slug}`} className="shrink-0">
          {author.avatarUrl ? (
            <Image
              src={author.avatarUrl}
              alt={author.name}
              width={64}
              height={64}
              className="rounded-full"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-coral-100 flex items-center justify-center">
              <span className="text-coral-600 text-2xl font-medium">
                {author.name.charAt(0)}
              </span>
            </div>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            href={`/blog/author/${author.slug}`}
            className="text-lg font-semibold text-gray-900 hover:text-coral-600 transition-colors"
          >
            {author.name}
          </Link>
          {author.bio && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {author.bio}
            </p>
          )}
          {hasSocialLinks && (
            <div className="flex items-center gap-3 mt-3">
              {author.twitterHandle && (
                <a
                  href={`https://twitter.com/${author.twitterHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                  aria-label={`Follow ${author.name} on Twitter`}
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {author.linkedinUrl && (
                <a
                  href={author.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                  aria-label={`Connect with ${author.name} on LinkedIn`}
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {author.websiteUrl && (
                <a
                  href={author.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-coral-500 transition-colors"
                  aria-label={`Visit ${author.name}'s website`}
                >
                  <Globe className="w-5 h-5" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
