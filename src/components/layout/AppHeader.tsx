import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';

interface AppHeaderProps {
  title?: string;
  showBackButton?: boolean;
}

export function AppHeader({ title = '약 조심', showBackButton = false }: AppHeaderProps) {
  const navigate = useNavigate();

  return (
    <header
      data-slot="app-header"
      className="sticky top-0 z-50 flex h-14 items-center gap-1 border-b border-[#EFEFF1] bg-[#FBFBFC]/85 px-3 backdrop-blur-sm"
    >
      {showBackButton && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="grid h-9 w-9 place-items-center rounded-xl text-gray-700 transition-colors hover:bg-black/5"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
        </button>
      )}
      <h1 className="text-[17px] font-semibold tracking-[-0.01em] text-foreground">{title}</h1>
    </header>
  );
}
