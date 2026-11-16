import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}

export function PageHeader({ eyebrow, title, children }: PageHeaderProps) {
  return (
    <header className="container-page pb-8 pt-10 sm:pb-12 sm:pt-16">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="heading-1 mt-3 max-w-3xl">{title}</h1>
      {children && (
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">{children}</p>
      )}
    </header>
  );
}
