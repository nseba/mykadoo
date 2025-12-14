'use client';

import { useEffect, useState } from 'react';
import { List } from 'lucide-react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
}

export function TableOfContents({ content, className = '' }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Extract headings from HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headingElements = doc.querySelectorAll('h2, h3');

    const items: TOCItem[] = [];
    headingElements.forEach((heading) => {
      const text = heading.textContent || '';
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      const level = parseInt(heading.tagName[1], 10);

      items.push({ id, text, level });
    });

    setHeadings(items);
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -80% 0px' }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 3) return null; // Only show TOC for articles with 3+ headings

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <nav
      aria-label="Table of contents"
      className={`bg-gray-50 rounded-xl p-5 ${className}`}
    >
      <div className="flex items-center gap-2 mb-4 text-gray-900 font-semibold">
        <List className="w-5 h-5" />
        <span>Table of Contents</span>
      </div>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={heading.level === 3 ? 'ml-4' : ''}
          >
            <button
              onClick={() => scrollToHeading(heading.id)}
              className={`text-left text-sm hover:text-coral-600 transition-colors ${
                activeId === heading.id
                  ? 'text-coral-600 font-medium'
                  : 'text-gray-600'
              }`}
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
