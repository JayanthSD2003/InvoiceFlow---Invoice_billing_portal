import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../layout/PageHeader';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import PillFilter from '../../../components/shared/PillFilter';

const API_BASE = 'http://localhost/invoice-billing-portal/backend/routes/api.php';

const FILTERS = ['all', 'draft', 'sent', 'partially_paid', 'paid', 'overdue'];

function statusLabel(status) {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'sent':
      return 'Sent';
    case 'partially_paid':
      return 'Partially Paid';
    case 'paid':
      return 'Paid';
    case 'overdue':
      return 'Overdue';
    default:
      return status || 'Unknown';
  }
}

function statusTone(status) {
  switch (status) {
    case 'paid':
      return 'success';
    case 'overdue':
      return 'danger';
    case 'partially_paid':
      return 'warning';
    case 'draft':
      return 'neutral';
    case 'sent':
      return 'info';
    default:
      return 'neutral';
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
}

function formatDate(dateString) {
  if (!dateString) return '—';

  const [year, month, day] = dateString.split('-').map(Number);
  const safeDate = new Date(year, month - 1, day);

  return safeDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function InvoicesPage() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_BASE}?route=invoices`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        credentials: 'include',
      });

      const text = await response.text();

      let result = {};
      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Invalid server response: ${text}`);
      }

      if (!response.ok || result.success === false) {
        throw new Error(result.message || 'Failed to load invoices');
      }

      setInvoices(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(err.message || 'Failed to load invoices');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const matchesFilter = filter === 'all' || invoice.status === filter;

      const searchableText = [
        invoice.invoice_number,
        invoice.client_name,
        invoice.company_name,
        invoice.status,
        invoice.notes,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesQuery =
        !normalizedQuery || searchableText.includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [invoices, filter, query]);

  const stats = useMemo(() => {
    return invoices.reduce(
      (acc, invoice) => {
        const total = Number(invoice.total_amount || 0);
        acc.totalValue += total;

        if (invoice.status === 'paid') acc.paid += 1;
        if (invoice.status === 'overdue') acc.overdue += 1;
        if (invoice.status === 'sent') acc.sent += 1;
        if (invoice.status === 'draft') acc.draft += 1;
        if (invoice.status === 'partially_paid') acc.partiallyPaid += 1;

        return acc;
      },
      {
        totalValue: 0,
        paid: 0,
        overdue: 0,
        sent: 0,
        draft: 0,
        partiallyPaid: 0,
      }
    );
  }, [invoices]);

  const handleNewInvoice = () => {
    // FIX: route matches routes.jsx → '/invoices/new'
    navigate('/invoices/new');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Invoices"
        title="Invoice management"
        description="Track issued invoices, payment status, and outstanding balances."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Total value
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
            {formatCurrency(stats.totalValue)}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Paid
          </p>
          <p className="mt-3 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
            {stats.paid}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Sent
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
            {stats.sent}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Overdue
          </p>
          <p className="mt-3 text-2xl font-semibold text-rose-600 dark:text-rose-400">
            {stats.overdue}
          </p>
        </Card>
      </section>

      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Status
            </span>
            {FILTERS.map((item) => (
              <PillFilter
                key={item}
                label={item === 'all' ? 'All' : statusLabel(item)}
                active={filter === item}
                onClick={() => setFilter(item)}
              />
            ))}
          </div>

          <div className="w-full max-w-md">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by invoice number, client, company, notes..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-teal-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleNewInvoice}
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            New invoice
          </button>

          <button
            type="button"
            onClick={fetchInvoices}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Refresh
          </button>
        </div>
      </section>

      <Card className="p-0">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <p className="font-medium text-slate-800 dark:text-slate-100">
            {loading
              ? 'Loading invoices...'
              : `${filteredInvoices.length} invoice${filteredInvoices.length === 1 ? '' : 's'}`}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {filter === 'all'
              ? 'Showing all statuses'
              : `Filtered by ${statusLabel(filter).toLowerCase()}`}
          </p>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-sm text-slate-500 dark:text-slate-400">
            Loading invoice data...
          </div>
        ) : error ? (
          <div className="px-6 py-10">
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              No invoices found
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Try a different filter or search term.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Issued</th>
                  <th className="px-4 py-3">Due</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-50">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                      {invoice.client_name || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                      {invoice.company_name || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                      {formatDate(invoice.invoice_date)}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                      {formatDate(invoice.due_date)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums text-slate-900 dark:text-slate-50">
                      {formatCurrency(invoice.total_amount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge tone={statusTone(invoice.status)}>
                        {statusLabel(invoice.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => navigate(`/invoices/${invoice.id}/print`)}
                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 font-medium text-sm transition"
                        title="View & Print"
                      >
                        Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default InvoicesPage;