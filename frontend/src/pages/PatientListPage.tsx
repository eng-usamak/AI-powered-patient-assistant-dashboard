import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { patientApi, type Patient, type CreatePatientInput, type UpdatePatientInput } from '../api/patient';
import PatientForm from '../components/PatientForm';

type ViewMode = 'list' | 'create' | 'edit';

const PatientListPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const { token } = useAuth();
  const navigate = useNavigate();

  const fetchPatients = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await patientApi.list(page, 10, token);
      setPatients(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [page, token]);

  const handleCreate = async (data: unknown) => {
    if (!token) return;

    await patientApi.create(data as CreatePatientInput, token);
    setViewMode('list');
    fetchPatients(); // Refresh list
  };

  const handleUpdate = async (data: unknown) => {
    if (!token || !editingPatient) return;

    await patientApi.update(editingPatient.id, data as UpdatePatientInput, token);
    setViewMode('list');
    setEditingPatient(null);
    fetchPatients(); // Refresh list
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (!window.confirm('Are you sure you want to delete this patient?')) return;

    try {
      await patientApi.delete(id, token);
      fetchPatients(); // Refresh list
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete patient');
    }
  };

  if (viewMode === 'create') {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '1.5rem' }}>Create Patient</h1>
        <PatientForm
          onSubmit={handleCreate}
          onCancel={() => setViewMode('list')}
        />
      </div>
    );
  }

  if (viewMode === 'edit' && editingPatient) {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '1.5rem' }}>Edit Patient</h1>
        <PatientForm
          initialData={editingPatient as Partial<CreatePatientInput>}
          onSubmit={handleUpdate}
          onCancel={() => {
            setViewMode('list');
            setEditingPatient(null);
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h1>Patients</h1>
        <button
          onClick={() => setViewMode('create')}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          + New Patient
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '4px',
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : patients.length === 0 ? (
        <div>No patients found. Create your first patient!</div>
      ) : (
        <>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '1rem',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #dee2e6' }}>
                  Name
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #dee2e6' }}>
                  Email
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #dee2e6' }}>
                  Phone
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #dee2e6' }}>
                  DOB
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #dee2e6' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id}>
                  <td style={{ padding: '0.75rem', border: '1px solid #dee2e6' }}>
                    <button
                      onClick={() => navigate(`/patients/${patient.id}`)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#007bff',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      {patient.name}
                    </button>
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #dee2e6' }}>
                    {patient.email || '-'}
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #dee2e6' }}>
                    {patient.phone || '-'}
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #dee2e6' }}>
                    {patient.dob ? new Date(patient.dob).toLocaleDateString() : '-'}
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #dee2e6' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => {
                          setEditingPatient(patient);
                          setViewMode('edit');
                        }}
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.875rem',
                          backgroundColor: '#ffc107',
                          color: '#000',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(patient.id)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.875rem',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '1rem',
                  backgroundColor: page === 1 ? '#ccc' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '1rem',
                  backgroundColor: page === totalPages ? '#ccc' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PatientListPage;
