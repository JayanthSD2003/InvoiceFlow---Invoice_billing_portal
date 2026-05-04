import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppState from '../../hooks/useAppState';
import PageHeader from '../../../layout/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

const API_BASE = 'http://localhost/invoice-billing-portal/backend/routes/api.php';

function ProfileSetupPage() {
  const navigate = useNavigate();
  const { currentUser } = useAppState();

  const [form, setForm] = useState({
    profile_type: 'business',
    business_name: '',
    owner_name: '',
    email: '',
    phone: '',
    address: '',
    tax_number: '',
    logo: '',
  });

  const [profileId, setProfileId] = useState(null);
  const [hasBusinessProfile, setHasBusinessProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');

      const response = await fetch(`${API_BASE}?route=profile`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      });

      const text = await response.text();
      let result = {};

      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Invalid server response: ${text}`);
      }

      if (response.status === 404) {
        setHasBusinessProfile(false);
        setProfileId(null);
        setForm({
          profile_type: 'business',
          business_name: '',
          owner_name: '',
          email: '',
          phone: '',
          address: '',
          tax_number: '',
          logo: '',
        });
        return;
      }

      if (!response.ok || result.success === false) {
        throw new Error(result.message || 'Failed to fetch profile');
      }

      const raw = result.data;

      const profile = raw
        ? {
            id: raw.id,
            profile_type: raw.profile_type || 'business',
            business_name: raw.business_name || '',
            owner_name: raw.owner_name || '',
            email: raw.email || '',
            phone: raw.phone || '',
            address: raw.address || '',
            tax_number: raw.tax_number || '',
          }
        : null;

      setHasBusinessProfile(!!profile?.id);
      setProfileId(profile?.id || null);

      if (profile) {
        setForm((prev) => ({
          ...prev,
          profile_type: profile.profile_type,
          business_name: profile.business_name,
          owner_name: profile.owner_name,
          email: profile.email,
          phone: profile.phone,
          address: profile.address,
          tax_number: profile.tax_number,
        }));
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!form.business_name.trim()) {
      setError('Please enter a business or freelance profile name.');
      return;
    }

    try {
      setSaving(true);

      const method = hasBusinessProfile ? 'PUT' : 'POST';

      const response = await fetch(`${API_BASE}?route=profile`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          business_name: form.business_name,
          owner_name: form.owner_name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          tax_number: form.tax_number,
          profile_type: form.profile_type,
        }),
      });

      const text = await response.text();
      let result = {};

      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Invalid server response: ${text}`);
      }

      if (!response.ok || result.success === false) {
        throw new Error(result.message || 'Failed to save profile');
      }

      setMessage(result.message || 'Profile saved successfully');

      // After saving, you can navigate back to profiles home
      navigate('/profiles');
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Profile setup"
        title={`Welcome${currentUser?.name ? `, ${currentUser.name}` : ''}`}
        description="Create your first billing identity. You can add businesses, freelance profiles, or both."
      />

      <Card className="max-w-2xl p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Profile type
              </label>
              <select
                name="profile_type"
                value={form.profile_type}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-teal-500"
              >
                <option value="business">Business</option>
                <option value="freelance">Freelancing</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Profile photo URL (optional)
              </label>
              <input
                type="text"
                name="logo"
                value={form.logo}
                onChange={handleChange}
                placeholder="Optional image URL"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Business / freelance name
            </label>
            <input
              type="text"
              name="business_name"
              value={form.business_name}
              onChange={handleChange}
              placeholder="Ex: Acme Pvt Ltd or John Design Studio"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-teal-500"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Owner name
              </label>
              <input
                type="text"
                name="owner_name"
                value={form.owner_name}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-teal-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Business email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-teal-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Tax number
              </label>
              <input
                type="text"
                name="tax_number"
                value={form.tax_number}
                onChange={handleChange}
                placeholder="GST number or other tax ID"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Street, city, state, country"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-teal-500"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          )}

          {message && !error && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
              {message}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving
                ? 'Saving...'
                : hasBusinessProfile
                ? 'Update profile'
                : 'Save profile'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default ProfileSetupPage;
