import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../../../layout/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import StatusBadge from '../../../components/shared/StatusBadge';

const API_BASE = 'http://localhost/invoice-billing-portal/backend/routes/api.php';

function StatCard({ title, value, change, tone = 'default' }) {
  const toneClass =
    tone === 'success'
      ? 'text-emerald-600 dark:text-emerald-400'
      : tone === 'danger'
      ? 'text-rose-600 dark:text-rose-400'
      : 'text-slate-500 dark:text-slate-400';

  return (
    <Card>
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <h3 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
        {value}
      </h3>
      <p className={`mt-2 text-sm ${toneClass}`}>{change}</p>
    </Card>
  );
}

function DashboardPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState('');
  
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoadingProfile(true);
        setProfileError('');

        // 1) Fetch logged‑in user
        const meResponse = await fetch(`${API_BASE}?route=me`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        });

        const meText = await meResponse.text();
        let meData = {};
        try {
          meData = meText ? JSON.parse(meText) : {};
        } catch {
          throw new Error(`Invalid /me response: ${meText}`);
        }

        if (!meResponse.ok || meData.success === false) {
          throw new Error(meData.message || 'Failed to load user');
        }

        setUser(meData.data?.user || null);

        // 2) Fetch business profile
        const profileResponse = await fetch(`${API_BASE}?route=profiles/active`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        });

        const profileText = await profileResponse.text();
        let profileData = {};
        try {
          profileData = profileText ? JSON.parse(profileText) : {};
        } catch {
          throw new Error(`Invalid profile response: ${profileText}`);
        }

        if (profileResponse.status === 404) {
          setProfile(null);
          return;
        }

        if (!profileResponse.ok || profileData.success === false) {
          throw new Error(profileData.message || 'Failed to load profile');
        }

        setProfile(profileData.data?.profile || profileData.data || null);

        // 3) Fetch stats
        const statsResponse = await fetch(`${API_BASE}?route=dashboard`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        });
        
        try {
          const statsText = await statsResponse.text();
          const statsData = statsText ? JSON.parse(statsText) : {};
          if (statsResponse.ok && statsData.success) {
            setStats(statsData.data);
          }
        } catch (err) {
          console.error("Dashboard stats parse error:", err);
        }
      } catch (err) {
        setProfileError(err.message || 'Failed to load profile');
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleNewInvoice = () => {
    navigate('/invoices/new');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title="Business overview"
        description="Monitor invoices, collections, and payment activity."
      />

      {/* Profile summary card */}
      <section className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Card className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                Profile
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                {user?.full_name || 'Your account'}
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {profile?.business_name
                  ? profile.business_name
                  : 'Set up your business or freelance profile to start invoicing.'}
              </p>

              <div className="mt-4 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                {profile?.phone && <p>Phone: {profile.phone}</p>}
                {profile?.address && <p>Address: {profile.address}</p>}
                {profile?.email && <p>Billing email: {profile.email}</p>}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              {profile && (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  Profile active
                </span>
              )}
              {!profile && !loadingProfile && (
                <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  Profile missing
                </span>
              )}

              <div className="mt-3 flex flex-col gap-2">
                <Link
                  to="/settings"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Open settings
                </Link>
                <Link
                  to="/settings"
                  className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-3 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400"
                >
                  Setup profile
                </Link>
              </div>
            </div>
          </div>

          {profileError && (
            <p className="mt-4 text-xs text-rose-600 dark:text-rose-400">
              {profileError}
            </p>
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Quick navigation
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Jump straight to key areas of your billing workspace.
          </p>

          {/* Example: quick "New invoice" button */}
          <div className="mt-4">
            <button
              type="button"
              onClick={handleNewInvoice}
              className="w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              New invoice
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Link
              to="/invoices"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-center font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Invoices
            </Link>
            <Link
              to="/clients"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-center font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Clients
            </Link>
            <Link
              to="/payments"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-center font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Payments
            </Link>
            <Link
              to="/settings"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-center font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Settings
            </Link>
          </div>
        </Card>
      </section>

      {/* dynamic stats */}
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`₹${(stats?.total_revenue || 0).toLocaleString('en-IN')}`}
          change="Lifetime Revenue"
          tone="success"
        />
        <StatCard
          title="Pending Invoices"
          value={stats?.pending_invoices || 0}
          change="Unpaid"
        />
        <StatCard
          title="Total Invoice Amount"
          value={`₹${(stats?.total_invoice_amount || 0).toLocaleString('en-IN')}`}
          change="Value of all invoices"
          tone="default"
        />
        <StatCard
          title="Pending Amount"
          value={`₹${(stats?.pending_amount || 0).toLocaleString('en-IN')}`}
          change="Needs attention"
          tone="danger"
        />
      </section>

      {/* ...existing Recent invoices + Quick actions section... */}
    </div>
  );
}

export default DashboardPage;