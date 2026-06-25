import type { ReactNode } from 'react';
import { AppHeader } from './AppHeader';
import { BottomNav } from './BottomNav';

interface PageContainerProps {
  title?: string;
  showBackButton?: boolean;
  showBottomNav?: boolean;
  children: ReactNode;
  className?: string;
  /** Override the root background. Defaults to the legacy gray surface. */
  containerClassName?: string;
}

export function PageContainer({
  title,
  showBackButton = false,
  showBottomNav = true,
  children,
  className = '',
  containerClassName = 'bg-[#FBFBFC]',
}: PageContainerProps) {
  return (
    <div className={`flex min-h-screen flex-col ${containerClassName}`}>
      <AppHeader title={title} showBackButton={showBackButton} />
      {/* When bottom nav is visible, reserve vertical space for it here.
          Pages with their own fixed CTA still need extra bottom padding in page content. */}
      <main
        data-slot="app-main"
        className={`mx-auto w-full max-w-lg flex-1 px-5 py-5 ${showBottomNav ? 'pb-24' : ''} ${className}`}
      >
        {children}
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
}
