import { Link, useNavigate } from 'react-router-dom';
import useAppState from '../../hooks/useAppState';
import PageHeader from '../../../layout/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

function ProfilesHomePage() {
  const navigate = useNavigate();
  const { currentUser, profiles, activeProfileId, selectProfile } = useAppState();

  const handleOpenProfile = (profileId, path = '/') => {
    selectProfile(profileId);
    navigate(path);
  };

  if (!profiles.length) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Profiles"
          title="No profiles yet"
          description="Create your first business or freelance identity to start managing clients and invoices."
        />

        <Card className="flex flex-col items-center justify-center px-6 py-12 text-center sm:px-10">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
            <span className="text-xl font-semibold">+</span>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Start your workspace
          </h2>
          <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
            Add a business or freelancing profile first. Your clients, invoices, and payments will stay scoped to each profile.
          </p>
          <div className="mt-6">
            <Link
              to="/profile-setup"
              className="inline-flex items-center rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-700"
            >
              Add first profile
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title={currentUser?.name ? `${currentUser.name}'s profiles` : 'Your profiles'}
        description="Choose a business or freelancing identity, then jump into the relevant module."
      />

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-14 w-14 rounded-2xl object-cover"
                />
              ) : (
                <span className="text-lg font-semibold">
                  {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {currentUser?.name || 'User'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {currentUser?.email || 'No email available'}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Link
              to="/profile-setup"
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              + Add business / freelance
            </Link>
          </div>
        </Card>

        <div className="grid gap-5 md:grid-cols-2">
          {profiles.map((profile) => {
            const active = activeProfileId === profile.id;

            return (
              <Card
                key={profile.id}
                className={`p-6 transition ${
                  active ? 'ring-2 ring-teal-500/70' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                      {profile.type === 'business' ? 'Business' : 'Freelancing'}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                      {profile.name}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => selectProfile(profile.id)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      active
                        ? 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {active ? 'Active' : 'Set active'}
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Clients</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                      {profile.clientsCount}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Invoices</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                      {profile.invoicesCount}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Outstanding</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                      {profile.outstanding}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button variant="secondary" onClick={() => handleOpenProfile(profile.id, '/')}>
                    Dashboard
                  </Button>
                  <Button variant="secondary" onClick={() => handleOpenProfile(profile.id, '/clients')}>
                    Clients
                  </Button>
                  <Button variant="secondary" onClick={() => handleOpenProfile(profile.id, '/invoices')}>
                    Invoices
                  </Button>
                  <Button variant="secondary" onClick={() => handleOpenProfile(profile.id, '/payments')}>
                    Payments
                  </Button>
                </div>

                <div className="mt-3">
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => handleOpenProfile(profile.id, '/settings')}
                  >
                    Settings
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ProfilesHomePage;