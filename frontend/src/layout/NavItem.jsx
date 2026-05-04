import { NavLink } from 'react-router-dom';
import useLayout from '../features/hooks/useLayout';

function NavItem({ to, label, end = false }) {
  const { closeMobileSidebar } = useLayout();

  return (
    <NavLink
      to={to}
      end={end}
      onClick={closeMobileSidebar}
      className={({ isActive }) =>
        `block rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default NavItem;