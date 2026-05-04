import { useEffect, useState } from 'react';
import PageHeader from '../../../layout/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import ClientForm from '../components/ClientForm';

const API_BASE = 'http://localhost/invoice-billing-portal/backend/routes/api.php';

function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE}?route=clients`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to fetch clients');
      setClients(data.data || []);
    } catch (err) {
      setError(err.message || 'Error loading clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleAddClient = () => {
    setClientToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditClient = (client) => {
    setClientToEdit(client);
    setIsFormOpen(true);
  };

  const handleDeleteClient = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try {
      const res = await fetch(`${API_BASE}?route=clients&id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      fetchClients();
    } catch (err) {
      alert(err.message || 'Failed to delete client');
    }
  };

  const handleSaveClient = async (formData, id) => {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE}?route=clients&id=${id}` : `${API_BASE}?route=clients`;
    
    const res = await fetch(url, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to save client');
    fetchClients();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Clients"
        title="Client directory"
        description="Track who you work with, their billing details, and contact info."
      />

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Filters could be implemented later if backend adds status */}
        </div>

        <button
          type="button"
          onClick={handleAddClient}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          + Add client
        </button>
      </section>

      {error && (
        <Card className="p-4 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900">
          <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
        </Card>
      )}

      <Card className="p-0">
        <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
            {loading ? 'Loading...' : `${clients.length} clients`}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
              {clients.length === 0 && !loading ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-slate-500">
                    No clients found. Click "+ Add client" to create one.
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id}>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 dark:text-slate-50">
                          {client.client_name}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {client.company_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-slate-700 dark:text-slate-200">
                          {client.email || '—'}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {client.phone}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-700 dark:text-slate-200">
                        {client.city ? `${client.city}${client.country ? `, ${client.country}` : ''}` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                       <button 
                        onClick={() => handleEditClient(client)}
                        className="text-teal-600 hover:underline dark:text-teal-400"
                       >
                        Edit
                       </button>
                       <button 
                        onClick={() => handleDeleteClient(client.id)}
                        className="text-rose-600 hover:underline dark:text-rose-400"
                       >
                        Delete
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ClientForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSave={handleSaveClient} 
        clientToEdit={clientToEdit} 
      />
    </div>
  );
}

export default ClientsPage;