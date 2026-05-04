import SearchBox from '../components/shared/SearchBox';
import ThemeToggle from '../components/shared/ThemeToggle';
import Button from '../components/ui/Button';
import IconButton from '../components/shared/IconButton';
import useLayout from '../features/hooks/useLayout';
import useAuth from '../features/auth/hooks/useAuth';
import WorkspaceSwitcher from '../components/shared/WorkspaceSwitcher';

function Topbar() {
  const { toggleMobileSidebar } = useLayout();
  const { logout } = useAuth();

  return (
    <header className="print:hidden border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <IconButton
            onClick={toggleMobileSidebar}
            className="lg:hidden"
            aria-label="Open menu"
            title="Open menu"
          >
            ☰
          </IconButton>

          <WorkspaceSwitcher />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:block">
            <SearchBox />
          </div>
          <ThemeToggle />
          <Button
            variant="secondary"
            className="hidden sm:inline-flex"
            onClick={logout}
          >
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Topbar;