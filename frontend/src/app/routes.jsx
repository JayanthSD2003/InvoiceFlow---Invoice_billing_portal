import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import AuthLayout from '../layout/AuthLayout';
import AppLayout from '../layout/AppLayout';
import ProtectedRoute from './guards/ProtectedRoute';
import GuestRoute from './guards/GuestRoute';
import { LayoutProvider } from './providers/LayoutProvider';

import LoginPage from '../features/auth/pages/LoginPage';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import ClientsPage from '../features/clients/pages/ClientsPage';
import InvoicesPage from '../features/invoices/pages/InvoicesPage';
import InvoiceFormPage from '../features/invoices/pages/InvoiceFormPage';
import InvoicePrintPage from '../features/invoices/pages/InvoicePrintPage';
import PaymentsPage from '../features/payments/pages/PaymentsPage';
import SettingsPage from '../features/settings/pages/SettingsPage';



function LayoutWrapper() {
  return (
    <LayoutProvider>
      <Outlet />
    </LayoutProvider>
  );
}

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      {
        path: '/login',
        element: <AuthLayout />,
        children: [{ index: true, element: <LoginPage /> }],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <LayoutWrapper />,
        children: [
          {
            path: '/',
            element: <AppLayout />,
            children: [
              { index: true, element: <DashboardPage /> },
              { path: 'clients', element: <ClientsPage /> },
              { path: 'invoices', element: <InvoicesPage /> },
              { path: 'invoices/new', element: <InvoiceFormPage /> },
              { path: 'invoices/:id/print', element: <InvoicePrintPage /> },
              { path: 'payments', element: <PaymentsPage /> },
              { path: 'settings', element: <SettingsPage /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);