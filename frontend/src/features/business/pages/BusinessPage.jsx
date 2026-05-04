import { useEffect, useState } from 'react';
import PageHeader from '../../../layout/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

const API_BASE = 'http://localhost/invoice-billing-portal/backend/routes/api.php';

function BusinessPage() {
  const [profiles, setProfiles] = useState([]);
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    business_name: '',
    email: '',
    phone: '',
    address: '',
    gst_number: '',
  });

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError('');

      // 1) list all profiles
      const listRes = await fetch(`${API_BASE}?route=profiles`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      });

      const listText = await listRes.text();
      let listData = {};
      try {
        listData = listText ? JSON.parse(listText) : {};
      } catch {
        throw new Error(`Invalid profiles response: ${listText}`);
      }

      if (!listRes.ok || listData.success === false) {
        throw new Error(listData.message || 'Failed to load profiles');
      }

      const items = Array.isArray(listData.data) ? listData.data : [];
      setProfiles(items);

      // 2) active profile
      const activeRes = await fetch(`${API_BASE}?route=profiles/active`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      });

      if (activeRes.status === 404) {
        setActiveProfileId(null);
      } else {
        const activeText = await activeRes.text();
        let activeData = {};
        try {
          activeData = activeText ? JSON.parse(activeText) : {};
        } catch {
          throw new Error(`Invalid active profile response: ${activeText}`);
        }

        if (!activeRes.ok || activeData.success === false) {
          throw new Error(activeData.message || 'Failed to load active profile');
        }

        if (activeData.data?.id) {
          setActiveProfileId(activeData.data.id);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load profiles');
      setProfiles([]);
      setActiveProfileId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');

      const res = await fetch(`${API_BASE}?route=profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Invalid create profile response: ${text}`);
      }

      if (!res.ok || data.success === false) {
        throw new Error(data.message || 'Failed to create profile');
      }

      // clear form and refresh list
      setFormData({
        business_name: '',
        email: '',
        phone: '',
        address: '',
        gst_number: '',
      });
      await fetchProfiles();
    } catch (err) {
      setError(err.message || 'Failed to create profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectActive = async (profileId) => {
    try {
      setSaving(true);
      setError('');

      const res = await fetch(`${API_BASE}?route=profiles/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ profile_id: profileId }),
      });

      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Invalid select profile response: ${text}`);
      }

      if (!res.ok || data.success === false) {
        throw new Error(data.message || 'Failed to select profile');
      }

      setActiveProfileId(profileId);
    } catch (err) {
      setError(err.message || 'Failed to select profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Business profiles"
        title="Manage your billing identities"
        description="Create and manage business or freelance profiles used on your invoices."
      />

      {/* Create profile form */}
      <Card className="p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
          Add a new business profile
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Set up your business details (name, address, GST, contact) that will appear on invoices.
        </p>

        <form onSubmit={handleCreate} className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Business name
            </label>
            <input
              name="business_name"
              value={formData.business_name}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-teal-500"
              placeholder="e.g. Acme Pvt Ltd"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Billing email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-teal-500"
              placeholder="[email protected]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Phone
            </label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-teal-500"
              placeholder="+91-98765-43210"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              GST number
            </label>
            <input
              name="gst_number"
              value={formData.gst_number}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-teal-500"
              placeholder="Optional"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={2}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-teal-500"
              placeholder="Street, city, state, PIN"
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-between pt-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              These details will be printed on your invoices.
            </p>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Create profile'}
            </Button>
          </div>
        </form>

        {error && (
          <p className="mt-3 text-xs text-rose-600 dark:text-rose-400">
            {error}
          </p>
        )}
      </Card>

      {/* Profiles list */}
      <Card className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Existing profiles
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {loading ? 'Loading...' : `${profiles.length} profile${profiles.length === 1 ? '' : 's'}`}
          </p>
        </div>

        {loading ? (
          <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Loading profiles…
          </div>
        ) : profiles.length === 0 ? (
          <div className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            No profiles yet. Use the form above to create your first business profile.
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {profiles.map((profile) => {
              const isActive = activeProfileId === profile.id;
              return (
                <div
                  key={profile.id}
                  className={`flex flex-col justify-between rounded-xl border p-4 text-sm ${
                    isActive
                      ? 'border-teal-500 bg-teal-50/60 dark:border-teal-400 dark:bg-teal-950/30'
                      : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
                  }`}
                >
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                      {isActive ? 'Active profile' : 'Profile'}
                    </p>
                    <h3 className="mt-2 text-base font-semibold text-slate-900 dark:text-white">
                      {profile.business_name}
                    </h3>
                    <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                      {profile.email && <p>Email: {profile.email}</p>}
                      {profile.phone && <p>Phone: {profile.phone}</p>}
                      {profile.address && <p>Address: {profile.address}</p>}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      ID: {profile.id}
                    </span>
                    {!isActive && (
                      <button
                        type="button"
                        onClick={() => handleSelectActive(profile.id)}
                        disabled={saving}
                        className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                      >
                        Set active
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

export default BusinessPage;