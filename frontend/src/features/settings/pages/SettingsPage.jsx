import { useState, useEffect } from 'react';
import PageHeader from '../../../layout/PageHeader';
import Card from '../../../components/ui/Card';
import BusinessProfileFormModal from '../../../components/shared/BusinessProfileFormModal';

const API_BASE = 'http://localhost/invoice-billing-portal/backend/routes/api.php';

function SettingsPage() {
  const [profile, setProfile] = useState({
    business_name: '',
    owner_name: '',
    email: '',
    phone: '',
    address: '',
    is_gst_registered: false,
    tax_number: '',
    pan_number: '',
  });

  const [activeProfileId, setActiveProfileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [actionMessage, setActionMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Default localStorage getters inside state init
  const [invoiceDefaults, setInvoiceDefaults] = useState(() => {
    const saved = localStorage.getItem('invoiceDefaults');
    return saved ? JSON.parse(saved) : {
      currency: 'INR',
      paymentTerms: '14',
      invoicePrefix: 'INV',
      taxMode: 'exclusive',
    };
  });

  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('preferences');
    return saved ? JSON.parse(saved) : {
      reminders: true,
      darkModeSync: true,
      compactTables: false,
    };
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}?route=profiles/active`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success && data.data?.profile) {
          const p = data.data.profile;
          setProfile({
            business_name: p.business_name || '',
            owner_name: p.owner_name || '',
            email: p.email || '',
            phone: p.phone || '',
            address: p.address || '',
            is_gst_registered: Boolean(p.is_gst_registered),
            tax_number: p.tax_number || '',
            pan_number: p.pan_number || '',
          });
          setActiveProfileId(p.id);
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileChange = (event) => {
    const { name, value, type, checked } = event.target;
    setProfile((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileMessage({ type: '', text: '' });

    try {
      const isNew = !activeProfileId;
      const method = isNew ? 'POST' : 'PUT';
      const route = isNew ? '?route=profiles' : '?route=profiles/update';
      
      const payload = { ...profile };
      if (!isNew) {
        payload.profile_id = activeProfileId;
      }

      const res = await fetch(`${API_BASE}${route}`, {
        method: method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      
      setProfileMessage({ type: 'success', text: isNew ? 'Profile created successfully!' : 'Profile updated successfully!' });
      
      if (isNew && data.data?.active_business_profile_id) {
        setActiveProfileId(data.data.active_business_profile_id);
      }
      
      setTimeout(() => setProfileMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setProfileMessage({ type: 'error', text: err.message || 'Failed to save profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDefaultsChange = (event) => {
    const { name, value } = event.target;
    const newDefaults = { ...invoiceDefaults, [name]: value };
    setInvoiceDefaults(newDefaults);
    localStorage.setItem('invoiceDefaults', JSON.stringify(newDefaults));
  };

  const handlePreferenceToggle = (key) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);
    localStorage.setItem('preferences', JSON.stringify(newPrefs));
  };

  const showActionToast = (actionName) => {
    setActionMessage(`${actionName} - Feature coming soon!`);
    setTimeout(() => setActionMessage(''), 3000);
  };

  const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-teal-500";

  return (
    <div className="space-y-6 relative">
      <PageHeader
        eyebrow="Settings"
        title="Workspace settings"
        description="Manage business profile, invoice defaults, and app preferences."
      />

      {/* Global Toast for Actions */}
      {actionMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 text-white px-6 py-3 shadow-xl dark:bg-white dark:text-slate-900 animate-fade-in-up font-medium text-sm">
          {actionMessage}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Profile details
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Keep your main contact information up to date for account access and communication.
              </p>
            </div>

            {loading ? (
               <p className="text-sm text-slate-500">Loading profile...</p>
            ) : (
                <>
                  {profileMessage.text && (
                    <div className={`mb-4 rounded-xl border px-3 py-2 text-sm ${profileMessage.type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'}`}>
                      {profileMessage.text}
                    </div>
                  )}

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="md:col-span-1">
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Business name
                      </label>
                      <input
                        name="business_name"
                        value={profile.business_name}
                        onChange={handleProfileChange}
                        className={inputClass}
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Owner name
                      </label>
                      <input
                        name="owner_name"
                        value={profile.owner_name}
                        onChange={handleProfileChange}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Email address
                      </label>
                      <input
                        name="email"
                        type="email"
                        value={profile.email}
                        onChange={handleProfileChange}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Phone number
                      </label>
                      <input
                        name="phone"
                        value={profile.phone}
                        onChange={handleProfileChange}
                        className={inputClass}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Address
                      </label>
                      <input
                        name="address"
                        value={profile.address}
                        onChange={handleProfileChange}
                        className={inputClass}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          name="is_gst_registered"
                          checked={profile.is_gst_registered}
                          onChange={handleProfileChange}
                          className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600 dark:border-slate-600 dark:bg-slate-800"
                        />
                        Registered for GST?
                      </label>
                    </div>

                    {profile.is_gst_registered && (
                      <div className="col-span-2 sm:col-span-1">
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                          Tax Number (GST/VAT)
                        </label>
                        <input
                          name="tax_number"
                          value={profile.tax_number}
                          onChange={handleProfileChange}
                          className={inputClass}
                        />
                      </div>
                    )}
                    
                    <div className={profile.is_gst_registered ? "col-span-2 sm:col-span-1" : "col-span-2"}>
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        PAN Number
                      </label>
                      <input
                        name="pan_number"
                        value={profile.pan_number}
                        onChange={handleProfileChange}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-50 dark:bg-teal-500 dark:hover:bg-teal-400"
                    >
                      {savingProfile ? 'Saving...' : 'Save profile'}
                    </button>
                  </div>
                </>
            )}
          </Card>

          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Invoice defaults
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Set the default values used when creating new invoices (Saved locally).
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Currency
                </label>
                <select
                  name="currency"
                  value={invoiceDefaults.currency}
                  onChange={handleDefaultsChange}
                  className={inputClass}
                >
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Payment terms
                </label>
                <select
                  name="paymentTerms"
                  value={invoiceDefaults.paymentTerms}
                  onChange={handleDefaultsChange}
                  className={inputClass}
                >
                  <option value="7">Due in 7 days</option>
                  <option value="14">Due in 14 days</option>
                  <option value="30">Due in 30 days</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Invoice prefix
                </label>
                <input
                  name="invoicePrefix"
                  type="text"
                  value={invoiceDefaults.invoicePrefix}
                  onChange={handleDefaultsChange}
                  className={`${inputClass} uppercase`}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Tax mode
                </label>
                <select
                  name="taxMode"
                  value={invoiceDefaults.taxMode}
                  onChange={handleDefaultsChange}
                  className={inputClass}
                >
                  <option value="exclusive">Tax exclusive</option>
                  <option value="inclusive">Tax inclusive</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <p className="text-xs text-slate-500 italic flex items-center">
                Autosaved to your browser
              </p>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                App preferences
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Control the experience of your workspace across devices (Saved locally).
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  key: 'reminders',
                  title: 'Payment reminders',
                  description: 'Send reminder nudges for pending and overdue invoices.',
                },
                {
                  key: 'darkModeSync',
                  title: 'Sync theme with system',
                  description: 'Automatically follow your device light or dark appearance.',
                },
                {
                  key: 'compactTables',
                  title: 'Compact table density',
                  description: 'Show denser rows for invoice and client tables.',
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {item.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePreferenceToggle(item.key)}
                    className={`relative mt-1 inline-flex h-6 w-11 shrink-0 rounded-full transition ${
                      preferences[item.key] ? 'bg-teal-600 dark:bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                    aria-pressed={preferences[item.key]}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                        preferences[item.key] ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Workspace actions
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Manage operational actions for this workspace.
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="w-full rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-left text-sm font-medium text-teal-700 transition hover:bg-teal-100 dark:border-teal-900 dark:bg-teal-900/30 dark:text-teal-300 dark:hover:bg-teal-900/50"
              >
                + Add new workspace (Business/Freelance)
              </button>
              <button
                type="button"
                onClick={() => showActionToast('Change password')}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Change password
              </button>
              <button
                type="button"
                onClick={() => showActionToast('Export workspace data')}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Export workspace data
              </button>
              <button
                type="button"
                 onClick={() => {
                  if (window.confirm("Are you sure you want to sign out?")) {
                     window.location.href = '/login';
                  }
                }}
                className="w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-left text-sm font-medium text-rose-700 transition hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/60"
              >
                Sign out from this workspace
              </button>
            </div>
          </Card>
        </div>
      </section>
      
      {/* Basic Tailwind custom animation for toast */}
      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.2s ease-out forwards;
        }
      `}</style>
      
      <BusinessProfileFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => window.location.reload()} 
      />
    </div>
  );
}

export default SettingsPage;
