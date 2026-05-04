import NavItem from './NavItem';
import useLayout from '../features/hooks/useLayout';

function Sidebar() {
  const { mobileSidebarOpen, closeMobileSidebar } = useLayout();

  return (
    <>
      <aside className="print:hidden hidden w-72 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex lg:flex-col">
        <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">InvoiceFlow</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Billing Portal</p>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <NavItem to="/" label="Dashboard" end />
          <NavItem to="/clients" label="Clients" />
          <NavItem to="/invoices" label="Invoices" />
          <NavItem to="/payments" label="Payments" />
          <NavItem to="/settings" label="Settings" />
        </nav>
      </aside>

      <aside
        className={`print:hidden fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:hidden transform transition-transform duration-200 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">InvoiceFlow</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Billing Portal</p>
          </div>

          <button
            type="button"
            onClick={closeMobileSidebar}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="space-y-1 p-4">
          <NavItem to="/" label="Dashboard" end />
          <NavItem to="/clients" label="Clients" />
          <NavItem to="/invoices" label="Invoices" />
          <NavItem to="/payments" label="Payments" />
          <NavItem to="/settings" label="Settings" />
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;