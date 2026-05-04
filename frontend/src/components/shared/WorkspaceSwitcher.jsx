import { useState, useEffect, useRef } from 'react';
import BusinessProfileFormModal from './BusinessProfileFormModal';

const API_BASE = 'http://localhost/invoice-billing-portal/backend/routes/api.php';

function WorkspaceSwitcher() {
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchProfiles = async () => {
    try {
      const res = await fetch(`${API_BASE}?route=profiles`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      const data = await res.json();
      if (data.success && data.data?.profiles) {
        setProfiles(data.data.profiles);
        const active = data.data.profiles.find((p) => p.is_active);
        if (active) setActiveProfile(active);
      }
    } catch (err) {
      console.error("Failed to fetch workspaces", err);
    }
  };

  useEffect(() => {
    fetchProfiles();
    
    // Handle outside click for dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitch = async (profileId) => {
    if (activeProfile?.id === profileId) {
      setIsOpen(false);
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}?route=profiles/select`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: profileId })
      });
      const data = await res.json();
      if (data.success) {
        // Hard refresh to reset all app states (dashboard, clients, invoices) to new workspace
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to switch workspace", err);
      alert("Failed to switch workspace.");
    }
  };

  const handleCreateSuccess = () => {
    // Hard refresh to load into the new workspace
    window.location.reload();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col items-start rounded-xl p-2 transition hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
      >
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Workspace
          </p>
          <svg className={`h-3 w-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white sm:text-xl truncate max-w-[200px]">
          {activeProfile ? activeProfile.business_name : 'No Workspace'}
        </h2>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 origin-top-left rounded-xl border border-slate-200 bg-white p-2 shadow-lg outline-none dark:border-slate-800 dark:bg-slate-900 z-50">
          <div className="mb-2 px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Your Businesses
            </p>
          </div>
          
          <div className="space-y-1">
            {profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSwitch(p.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                  p.is_active 
                    ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' 
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <span className="truncate">{p.business_name}</span>
                {p.is_active && (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          <div className="mt-2 border-t border-slate-200 pt-2 dark:border-slate-800">
            <button
              onClick={() => {
                setIsOpen(false);
                setIsModalOpen(true);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add new business
            </button>
          </div>
        </div>
      )}

      <BusinessProfileFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleCreateSuccess} 
      />
    </div>
  );
}

export default WorkspaceSwitcher;
