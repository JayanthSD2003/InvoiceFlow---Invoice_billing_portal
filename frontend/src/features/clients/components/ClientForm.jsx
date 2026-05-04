import { useState } from 'react';
import Button from '../../../components/ui/Button';

function ClientForm({ isOpen, onClose, onSave, clientToEdit = null }) {
  const [form, setForm] = useState({
    client_name: clientToEdit?.client_name || '',
    company_name: clientToEdit?.company_name || '',
    email: clientToEdit?.email || '',
    phone: clientToEdit?.phone || '',
    address: clientToEdit?.address || '',
    city: clientToEdit?.city || '',
    state: clientToEdit?.state || '',
    country: clientToEdit?.country || '',
    postal_code: clientToEdit?.postal_code || '',
    notes: clientToEdit?.notes || '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.client_name.trim()) {
      setError('Client name is required');
      return;
    }
    
    setSubmitting(true);
    setError('');
    try {
      await onSave(form, clientToEdit?.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save client');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-teal-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm dark:bg-black/60">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {clientToEdit ? 'Edit Client' : 'Add New Client'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
            {error && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Client Name *</label>
                <input name="client_name" value={form.client_name} onChange={handleChange} className={inputClass} required />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Company Name</label>
                <input name="company_name" value={form.company_name} onChange={handleChange} className={inputClass} />
              </div>
              
              <div className="col-span-2 sm:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} />
              </div>

              <div className="col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
                <input name="address" value={form.address} onChange={handleChange} className={inputClass} />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">City</label>
                <input name="city" value={form.city} onChange={handleChange} className={inputClass} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">State / Region</label>
                <input name="state" value={form.state} onChange={handleChange} className={inputClass} />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Postal Code</label>
                <input name="postal_code" value={form.postal_code} onChange={handleChange} className={inputClass} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Country</label>
                <input name="country" value={form.country} onChange={handleChange} className={inputClass} />
              </div>

              <div className="col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Notes</label>
                <textarea name="notes" rows={2} value={form.notes} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
            <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Client'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClientForm;
