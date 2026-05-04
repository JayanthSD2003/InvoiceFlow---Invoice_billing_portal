import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../layout/PageHeader';
import Card from '../../../components/ui/Card';

const API_BASE = 'http://localhost/invoice-billing-portal/backend/routes/api.php';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
}

// UPDATED: match backend item structure
function createEmptyItem() {
  return {
    item_name: '',
    description: '',
    hsn_code: '',
    quantity: '1',
    unit_price: '',
    tax_percent: '0',
  };
}

function InvoiceFormPage() {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [loadingClients, setLoadingClients] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    client_id: '',
    invoice_number: '',
    invoice_date: new Date().toISOString().slice(0, 10),
    due_date: '',
    status: 'draft',
    notes: '',
  });

  const [items, setItems] = useState([createEmptyItem()]);

  const fieldClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-500';

  useEffect(() => {
    fetchClients();
    fetchActiveProfile();
  }, []);

  async function fetchActiveProfile() {
    try {
      const res = await fetch(`${API_BASE}?route=profiles/active`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      const data = await res.json();
      if (data.success && data.data?.profile) {
        setActiveProfile(data.data.profile);
      }
    } catch (err) {
      console.error('Failed to load active profile', err);
    }
  }

  async function fetchClients() {
    try {
      setLoadingClients(true);
      setError('');

      const res = await fetch(`${API_BASE}?route=clients`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });

      const text = await res.text();
      let json = {};

      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Invalid clients response: ${text}`);
      }

      if (!res.ok || json.success === false) {
        throw new Error(json.message || 'Failed to load clients');
      }

      setClients(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      setError(err.message || 'Failed to load clients');
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleItemChange(index, field, value) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function addItem() {
    setItems((prev) => [...prev, createEmptyItem()]);
  }

  function removeItem(index) {
    setItems((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }

  // UPDATED: compute base, tax, and line total like backend
  const computedItems = useMemo(
    () =>
      items.map((item) => {
        const quantity = Number(item.quantity || 0);
        const unitPrice = Number(item.unit_price || 0);
        const taxPercent = Number(item.tax_percent || 0);

        const baseAmount = quantity * unitPrice;
        const taxAmount = (baseAmount * taxPercent) / 100;
        const lineTotal = baseAmount + taxAmount;

        return {
          ...item,
          quantity,
          unitPrice,
          taxPercent,
          baseAmount,
          taxAmount,
          lineTotal,
        };
      }),
    [items]
  );

  const subtotal = useMemo(
    () => computedItems.reduce((sum, item) => sum + item.baseAmount, 0),
    [computedItems]
  );

  const taxAmount = useMemo(
    () => computedItems.reduce((sum, item) => sum + item.taxAmount, 0),
    [computedItems]
  );

  const totalAmount = useMemo(
    () => subtotal + taxAmount,
    [subtotal, taxAmount]
  );

  // UPDATED handleSubmit implementation
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.client_id) {
      setError('Please select a client.');
      return;
    }

    if (!form.invoice_number.trim()) {
      setError('Invoice number is required.');
      return;
    }

    if (!form.invoice_date) {
      setError('Invoice date is required.');
      return;
    }

    const cleanedItems = items
      .map((item) => ({
        item_name: String(item.item_name || '').trim(),
        description: String(item.description || '').trim(),
        hsn_code: String(item.hsn_code || '').trim(),
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        tax_percent: Number(item.tax_percent || 0),
      }))
      .filter((item) => item.item_name !== '');

    if (cleanedItems.length === 0) {
      setError('Add at least one invoice item.');
      return;
    }

    const hasInvalidItem = cleanedItems.some(
      (item) =>
        !item.item_name ||
        !Number.isFinite(item.quantity) ||
        item.quantity <= 0 ||
        !Number.isFinite(item.unit_price) ||
        item.unit_price < 0 ||
        !Number.isFinite(item.tax_percent) ||
        item.tax_percent < 0
    );

    if (hasInvalidItem) {
      setError(
        'Each item must have name, quantity greater than 0, and valid rate/tax.'
      );
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        client_id: Number(form.client_id),
        invoice_number: form.invoice_number.trim(),
        invoice_date: form.invoice_date,
        due_date: form.due_date || null,
        status: form.status,
        notes: form.notes.trim(),
        // Let backend compute totals; discount_amount assumed 0
        items: cleanedItems.map((item) => ({
          item_name: item.item_name,
          description: item.description,
          hsn_code: item.hsn_code,
          quantity: Number(item.quantity.toFixed(2)),
          unit_price: Number(item.unit_price.toFixed(2)),
          tax_percent: Number(item.tax_percent.toFixed(2)),
        })),
      };

      const res = await fetch(`${API_BASE}?route=invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let json = {};

      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Invalid invoice response: ${text}`);
      }

      if (!res.ok || json.success === false) {
        throw new Error(json.message || 'Failed to create invoice');
      }

      setSuccess('Invoice created successfully.');

      setTimeout(() => {
        navigate('/invoices');
      }, 800);
    } catch (err) {
      setError(err.message || 'Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Invoices"
        title="Create invoice"
        description="Create a new invoice with client details, dates, and line items."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {(error || success) && (
          <Card className="p-4">
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                {success}
              </div>
            )}
          </Card>
        )}

        {/* Invoice meta */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Invoice details
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Client
              </label>
              <select
                name="client_id"
                value={form.client_id}
                onChange={handleFormChange}
                className={fieldClass}
                disabled={loadingClients}
                required
              >
                <option value="">
                  {loadingClients ? 'Loading clients...' : 'Select client'}
                </option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.client_name || client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Invoice number
              </label>
              <input
                type="text"
                name="invoice_number"
                value={form.invoice_number}
                onChange={handleFormChange}
                placeholder="INV-2026-001"
                className={fieldClass}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Invoice date
              </label>
              <input
                type="date"
                name="invoice_date"
                value={form.invoice_date}
                onChange={handleFormChange}
                className={`${fieldClass} dark:[color-scheme:dark]`}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Due date
              </label>
              <input
                type="date"
                name="due_date"
                value={form.due_date}
                onChange={handleFormChange}
                className={`${fieldClass} dark:[color-scheme:dark]`}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleFormChange}
                className={fieldClass}
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Notes
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleFormChange}
              rows={4}
              placeholder="Additional notes, payment terms, remarks..."
              className={fieldClass}
            />
          </div>
        </Card>

        {/* Line items */}
        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Line items
            </h2>

            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Add item
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
              >
                <div className="grid gap-4 md:grid-cols-12">
                  {/* Item name */}
                  <div className={activeProfile?.is_gst_registered ? "md:col-span-3" : "md:col-span-4"}>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Item name
                    </label>
                    <input
                      type="text"
                      value={item.item_name}
                      onChange={(e) =>
                        handleItemChange(index, 'item_name', e.target.value)
                      }
                      placeholder="e.g. Website design"
                      className={fieldClass}
                    />
                  </div>

                  {/* Description */}
                  <div className={activeProfile?.is_gst_registered ? "md:col-span-2" : "md:col-span-4"}>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Description
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(index, 'description', e.target.value)
                      }
                      placeholder="Service/item details"
                      className={fieldClass}
                    />
                  </div>

                  {/* HSN/SAC */}
                  {activeProfile?.is_gst_registered && (
                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200" title="Harmonized System of Nomenclature / Service Accounting Code">
                        HSN/SAC
                      </label>
                      <input
                        type="text"
                        value={item.hsn_code}
                        onChange={(e) =>
                          handleItemChange(index, 'hsn_code', e.target.value)
                        }
                        placeholder="Optional"
                        className={fieldClass}
                      />
                    </div>
                  )}

                  {/* Qty */}
                  <div className={activeProfile?.is_gst_registered ? "md:col-span-2" : "md:col-span-1"}>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Qty
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, 'quantity', e.target.value)
                      }
                      className={fieldClass}
                    />
                  </div>

                  {/* Rate */}
                  <div className={activeProfile?.is_gst_registered ? "md:col-span-1" : "md:col-span-2"}>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Rate
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) =>
                        handleItemChange(index, 'unit_price', e.target.value)
                      }
                      placeholder="0.00"
                      className={fieldClass}
                    />
                  </div>

                  {/* Tax % */}
                  {activeProfile?.is_gst_registered && (
                    <div className="md:col-span-1">
                      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                        Tax %
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.tax_percent}
                        onChange={(e) =>
                          handleItemChange(index, 'tax_percent', e.target.value)
                        }
                        placeholder="0"
                        className={fieldClass}
                      />
                    </div>
                  )}

                  {/* Amount */}
                  <div className="md:col-span-1">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Amount
                    </label>
                    <div className="flex h-[42px] items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {formatCurrency(computedItems[index]?.lineTotal || 0)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="text-sm font-medium text-rose-600 transition hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-rose-400 dark:hover:text-rose-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Totals and actions */}
        <Card className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Review the invoice items and save when ready.
            </p>

            <div className="w-full max-w-sm space-y-2 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                <span>Subtotal</span>
                <span className="font-medium">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                <span>Tax</span>
                <span className="font-medium">
                  {formatCurrency(taxAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900 dark:border-slate-800 dark:text-slate-100">
                <span>Total</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate('/invoices')}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {submitting ? 'Saving invoice...' : 'Save invoice'}
            </button>
          </div>
        </Card>
      </form>
    </div>
  );
}

export default InvoiceFormPage;