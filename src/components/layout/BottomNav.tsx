import { useLocation, useNavigate } from 'react-router';
import { Home, Search, ClipboardList, Settings } from 'lucide-react';

const navItems = [
  { path: '/home', label: '홈', icon: Home },
  { path: '/search', label: '검색', icon: Search },
  { path: '/combine', label: '분석', icon: ClipboardList },
  { path: '/settings', label: '설정', icon: Settings },
] as const;

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      data-slot="bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#EFEFF1] bg-[#FBFBFC]/90 backdrop-blur-sm"
    >
      <div
        data-slot="bottom-nav-inner"
        className="mx-auto flex h-16 max-w-lg items-center justify-around"
      >
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <button
              data-slot="bottom-nav-button"
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-1 px-3 py-2 text-[11px] font-medium tracking-[-0.01em] transition-colors ${
                isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
              }`}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2 : 1.75} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
