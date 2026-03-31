'use client';

import { useState, useEffect } from 'react';

interface TableOfContentsProps {
  headings: Array<{
    level: string;
    text: string;
    id: string;
  }>;
  activeId?: string;
}

export default function TableOfContents({ headings, activeId }: TableOfContentsProps) {
  const [currentActiveId, setCurrentActiveId] = useState(activeId);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCurrentActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0% -35% 0%' }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      headings.forEach((heading) => {
        const element = document.getElementById(heading.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!headings || headings.length === 0) {
    return null;
  }

  return (
    <nav className="hidden xl:block xl:w-64 xl:flex-shrink-0">
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm sticky top-8">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
          Table of Contents
        </h3>
        <ul className="space-y-2 text-sm">
          {headings.map((heading) => {
            const isActive = currentActiveId === heading.id;
            const paddingLeft = heading.level === 'H3' ? 'pl-4' : '';
            
            return (
              <li key={heading.id}>
                <button
                  onClick={() => scrollToHeading(heading.id)}
                  className={`w-full text-left transition-colors duration-200 ${
                    isActive
                      ? 'text-blue-600 font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  } ${paddingLeft}`}
                >
                  {heading.text}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
