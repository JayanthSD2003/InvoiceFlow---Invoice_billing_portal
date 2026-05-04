import { Outlet } from 'react-router-dom';

function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}

export default AuthLayout;