import { useState } from 'react';
import Button from '../ui/Button';

const API_BASE = 'http://localhost/invoice-billing-portal/backend/routes/api.php';

function BusinessProfileFormModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({
    profile_type: 'business',
    business_name: '',
    owner_name: '',
    email: '',
    phone: '',
    address: '',
    is_gst_registered: false,
    tax_number: '',
    pan_number: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.business_name.trim() || !form.owner_name.trim() || !form.email.trim()) {
      setError('Business name, owner name, and email are required');
      return;
    }
    
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}?route=profiles`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to create business profile');
      }
      
      if (onSuccess) onSuccess(data.data);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save profile');
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
            Add New Workspace
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
              <div className="col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Workspace Type</label>
                <select name="profile_type" value={form.profile_type} onChange={handleChange} className={inputClass}>
                  <option value="business">Business</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Business / Freelance Name *</label>
                <input name="business_name" value={form.business_name} onChange={handleChange} className={inputClass} required />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Owner Name *</label>
                <input name="owner_name" value={form.owner_name} onChange={handleChange} className={inputClass} required />
              </div>
              
              <div className="col-span-2 sm:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Business Email *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} required />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} />
              </div>

              <div className="col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
                <input name="address" value={form.address} onChange={handleChange} className={inputClass} />
              </div>

              <div className="col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_gst_registered"
                    checked={form.is_gst_registered}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600 dark:border-slate-600 dark:bg-slate-800"
                  />
                  Registered for GST?
                </label>
              </div>

              {form.is_gst_registered && (
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">GSTIN / Tax Number</label>
                  <input name="tax_number" value={form.tax_number} onChange={handleChange} className={inputClass} />
                </div>
              )}
              
              <div className={form.is_gst_registered ? "col-span-2 sm:col-span-1" : "col-span-2"}>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">PAN Number</label>
                <input name="pan_number" value={form.pan_number} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
            <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Workspace'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BusinessProfileFormModal;
