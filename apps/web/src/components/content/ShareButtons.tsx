'use client';

import { useState } from 'react';
import {
  Twitter,
  Facebook,
  Linkedin,
  Link2,
  Mail,
  Check,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
  variant?: 'default' | 'compact';
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mykadoo.com';

export function ShareButtons({
  url,
  title,
  description = '',
  className,
  variant = 'default',
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const fullUrl = url.startsWith('http') ? url : `${SITE_URL}${url}`;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const buttonClasses = cn(
    'flex items-center justify-center transition-colors',
    variant === 'compact'
      ? 'w-8 h-8 rounded-full'
      : 'w-10 h-10 rounded-lg'
  );

  const iconSize = variant === 'compact' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {variant === 'default' && (
        <span className="text-sm text-gray-500 mr-2">Share:</span>
      )}

      {/* Twitter */}
      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          buttonClasses,
          'bg-gray-100 text-gray-600 hover:bg-[#1DA1F2] hover:text-white'
        )}
        aria-label="Share on Twitter"
      >
        <Twitter className={iconSize} />
      </a>

      {/* Facebook */}
      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          buttonClasses,
          'bg-gray-100 text-gray-600 hover:bg-[#4267B2] hover:text-white'
        )}
        aria-label="Share on Facebook"
      >
        <Facebook className={iconSize} />
      </a>

      {/* LinkedIn */}
      <a
        href={shareLinks.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          buttonClasses,
          'bg-gray-100 text-gray-600 hover:bg-[#0077B5] hover:text-white'
        )}
        aria-label="Share on LinkedIn"
      >
        <Linkedin className={iconSize} />
      </a>

      {/* Email */}
      <a
        href={shareLinks.email}
        className={cn(
          buttonClasses,
          'bg-gray-100 text-gray-600 hover:bg-gray-700 hover:text-white'
        )}
        aria-label="Share via Email"
      >
        <Mail className={iconSize} />
      </a>

      {/* Copy Link */}
      <button
        onClick={copyToClipboard}
        className={cn(
          buttonClasses,
          copied
            ? 'bg-green-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-coral-500 hover:text-white'
        )}
        aria-label={copied ? 'Link copied!' : 'Copy link'}
        title={copied ? 'Link copied!' : 'Copy link'}
      >
        {copied ? (
          <Check className={iconSize} />
        ) : (
          <Link2 className={iconSize} />
        )}
      </button>
    </div>
  );
}

export default ShareButtons;
