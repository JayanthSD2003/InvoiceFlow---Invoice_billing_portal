import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../../layout/PageHeader';

const API_BASE = 'http://localhost/invoice-billing-portal/backend/routes/api.php';

function PaymentsPage() {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);

  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [paymentForm, setPaymentForm] = useState({
    payment_date: new Date().toISOString().slice(0, 10),
    amount_paid: '',
    payment_method: '',
    reference_note: '',
  });

  const fieldClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-500';

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    if (selectedInvoiceId) {
      fetchPayments(selectedInvoiceId);
    } else {
      setPayments([]);
      setSummary(null);
    }
  }, [selectedInvoiceId]);

  async function fetchInvoices() {
    setLoadingInvoices(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}?route=invoices`, {
        credentials: 'include',
      });
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || 'Failed to fetch invoices');
      }

      const invoiceList = Array.isArray(json.data) ? json.data : [];
      setInvoices(invoiceList);

      if (invoiceList.length > 0) {
        setSelectedInvoiceId(String(invoiceList[0].id));
      }
    } catch (err) {
      setError(err.message || 'Failed to load invoices');
    } finally {
      setLoadingInvoices(false);
    }
  }

  async function fetchPayments(invoiceId) {
    setLoadingPayments(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(
        `${API_BASE}?route=payments&invoice_id=${encodeURIComponent(invoiceId)}`,
        { credentials: 'include' }
      );
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || 'Failed to fetch payments');
      }

      setPayments(json.data?.payments || []);
      setSummary(json.data?.summary || null);
    } catch (err) {
      setError(err.message || 'Failed to load payments');
      setPayments([]);
      setSummary(null);
    } finally {
      setLoadingPayments(false);
    }
  }

  const selectedInvoice = useMemo(() => {
    return invoices.find((inv) => String(inv.id) === String(selectedInvoiceId)) || null;
  }, [invoices, selectedInvoiceId]);

  const balanceDue = Number(summary?.balance_due ?? selectedInvoice?.total_amount ?? 0);
  const totalAmount = Number(summary?.total_amount ?? selectedInvoice?.total_amount ?? 0);
  const totalPaid = Number(summary?.total_paid ?? 0);

  function handleFormChange(e) {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!selectedInvoiceId) {
      setError('Please select an invoice first.');
      return;
    }

    const amount = parseFloat(paymentForm.amount_paid || '0');

    if (!paymentForm.payment_date || amount <= 0) {
      setError('Payment date and valid amount are required.');
      return;
    }

    if (balanceDue <= 0) {
      setError('This invoice is already fully paid.');
      return;
    }

    if (amount > balanceDue) {
      setError(`Amount exceeds current balance of ₹${balanceDue.toFixed(2)}.`);
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_BASE}?route=payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          invoice_id: Number(selectedInvoiceId),
          payment_date: paymentForm.payment_date,
          amount_paid: amount,
          payment_method: paymentForm.payment_method,
          reference_note: paymentForm.reference_note,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || 'Failed to record payment');
      }

      setSuccess('Payment recorded successfully.');

      setPaymentForm((prev) => ({
        ...prev,
        amount_paid: '',
        reference_note: '',
      }));

      await fetchPayments(selectedInvoiceId);
      await fetchInvoices();
    } catch (err) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Payments"
        title="Payment records"
        description="Monitor collections, partial payments, and payment history for each invoice."
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="grid gap-4 lg:grid-cols-[minmax(260px,340px)_1fr] lg:items-end">
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Select invoice
            </label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => setSelectedInvoiceId(e.target.value)}
              disabled={loadingInvoices}
              className={fieldClass}
            >
              {loadingInvoices ? (
                <option value="">Loading invoices...</option>
              ) : invoices.length === 0 ? (
                <option value="">No invoices found</option>
              ) : (
                invoices.map((invoice) => (
                  <option key={invoice.id} value={invoice.id}>
                    {invoice.invoice_number} — {invoice.client_name}
                  </option>
                ))
              )}
            </select>
          </div>

          {selectedInvoice && (
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {selectedInvoice.invoice_number}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {selectedInvoice.client_name}
                    {selectedInvoice.company_name ? ` · ${selectedInvoice.company_name}` : ''}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Invoice date: {selectedInvoice.invoice_date} · Due date: {selectedInvoice.due_date || '—'}
                  </p>
                </div>

                <StatusBadge status={summary?.status || selectedInvoice.status} />
              </div>
            </div>
          )}
        </div>

        {(error || success) && (
          <div className="mt-4 space-y-2">
            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                {success}
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Invoice total" value={totalAmount} />
        <SummaryCard label="Total paid" value={totalPaid} />
        <SummaryCard label="Balance due" value={balanceDue} tone={balanceDue > 0 ? 'warning' : 'success'} />
        <SummaryCard label="Payments count" value={payments.length} isCurrency={false} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Record payment</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Add a payment for the selected invoice. Invoice status will refresh automatically.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Payment date
              </label>
              <input
                type="date"
                name="payment_date"
                value={paymentForm.payment_date}
                onChange={handleFormChange}
                className={`${fieldClass} dark:[color-scheme:dark]`}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Amount paid
              </label>
              <input
                type="number"
                name="amount_paid"
                min="0.01"
                step="0.01"
                value={paymentForm.amount_paid}
                onChange={handleFormChange}
                placeholder="0.00"
                className={fieldClass}
                required
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Current balance: ₹{balanceDue.toFixed(2)}
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Payment method
              </label>
              <select
                name="payment_method"
                value={paymentForm.payment_method}
                onChange={handleFormChange}
                className={fieldClass}
              >
                <option value="">Select method</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank transfer</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Reference note
              </label>
              <textarea
                name="reference_note"
                value={paymentForm.reference_note}
                onChange={handleFormChange}
                rows={4}
                placeholder="Transaction ID, note, bank reference..."
                className={fieldClass}
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedInvoiceId}
              className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {submitting ? 'Recording payment...' : 'Record payment'}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Payment history</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Latest payments for the selected invoice.
              </p>
            </div>
          </div>

          {loadingPayments ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading payment records...</p>
          ) : payments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center dark:border-slate-700 dark:bg-slate-900">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">No payments recorded yet</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Add the first payment using the form on the left.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <th className="px-0 py-3 pr-4 font-medium">Date</th>
                    <th className="px-0 py-3 pr-4 font-medium">Amount</th>
                    <th className="px-0 py-3 pr-4 font-medium">Method</th>
                    <th className="px-0 py-3 pr-4 font-medium">Reference</th>
                    <th className="px-0 py-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-slate-100 last:border-b-0 dark:border-slate-800">
                      <td className="px-0 py-3 pr-4 text-sm text-slate-700 dark:text-slate-300">
                        {payment.payment_date}
                      </td>
                      <td className="px-0 py-3 pr-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        ₹{Number(payment.amount_paid).toFixed(2)}
                      </td>
                      <td className="px-0 py-3 pr-4 text-sm text-slate-700 dark:text-slate-300">
                        {formatPaymentMethod(payment.payment_method)}
                      </td>
                      <td className="px-0 py-3 pr-4 text-sm text-slate-600 dark:text-slate-400">
                        {payment.reference_note || '—'}
                      </td>
                      <td className="px-0 py-3 text-sm text-slate-500 dark:text-slate-400">
                        {payment.created_at}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, isCurrency = true, tone = 'default' }) {
  const tones = {
    default: 'text-slate-900 dark:text-slate-100',
    warning: 'text-amber-700 dark:text-amber-400',
    success: 'text-emerald-700 dark:text-emerald-400',
  };

  const displayValue = isCurrency
    ? `₹${Number(value || 0).toFixed(2)}`
    : String(value ?? 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-semibold ${tones[tone]}`}>
        {displayValue}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60',
    partially_paid: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60',
    sent: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/60',
    draft: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700',
    overdue: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/60',
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
        styles[status] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700'
      }`}
    >
      {String(status || 'unknown').replace('_', ' ')}
    </span>
  );
}

function formatPaymentMethod(method) {
  const map = {
    cash: 'Cash',
    bank_transfer: 'Bank transfer',
    upi: 'UPI',
    card: 'Card',
    cheque: 'Cheque',
  };
  return map[method] || method || '—';
}

export default PaymentsPage;