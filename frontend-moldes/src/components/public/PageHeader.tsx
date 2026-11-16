import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}

export function PageHeader({ eyebrow, title, children }: PageHeaderProps) {
  return (
    <section className="border-b border-line bg-white">
      <div className="container-page py-12 sm:py-16">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-[2.75rem] sm:leading-[1.08]">
          {title}
        </h1>
        {children && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">{children}</p>
        )}
      </div>
    </section>
  );
}
