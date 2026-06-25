import type { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function SectionCard({ title, children, className = '' }: SectionCardProps) {
  return (
    <section className={className}>
      <p className="mb-2.5 px-1 text-[13px] font-semibold tracking-[-0.01em] text-foreground">
        {title}
      </p>
      <div className="rounded-2xl border border-[#ECEFF3] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        {children}
      </div>
    </section>
  );
}
