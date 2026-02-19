import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { patientApi, type Patient, type CreatePatientInput, type UpdatePatientInput } from '../api/patient';
import PatientForm from '../components/PatientForm';
import {
  Box,
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  Pagination,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Person as PersonIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';

type ViewMode = 'list' | 'create' | 'edit';

const PatientListPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const { token, logout } = useAuth();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, token]);

  const handleCreate = async (data: unknown) => {
    if (!token) return;

    try {
      await patientApi.create(data as CreatePatientInput, token);
      toast.success('Patient created successfully');
      setViewMode('list');
      fetchPatients(); // Refresh list
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create patient');
    }
  };

  const handleUpdate = async (data: unknown) => {
    if (!token || !editingPatient) return;

    try {
      await patientApi.update(editingPatient.id, data as UpdatePatientInput, token);
      toast.success('Patient updated successfully');
      setViewMode('list');
      setEditingPatient(null);
      fetchPatients(); // Refresh list
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update patient');
    }
  };

  const handleDeleteClick = (patient: Patient) => {
    setPatientToDelete(patient);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!token || !patientToDelete) return;

    try {
      await patientApi.delete(patientToDelete.id, token);
      toast.success('Patient deleted successfully');
      setDeleteDialogOpen(false);
      setPatientToDelete(null);
      fetchPatients(); // Refresh list
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete patient');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPatientToDelete(null);
  };

  const truncateName = (name: string): string => {
    const words = name.trim().split(/\s+/);
    if (words.length <= 2) {
      return name;
    }
    return words.slice(0, 2).join(' ') + '...';
  };

  const handleCloseModal = () => {
    setViewMode('list');
    setEditingPatient(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'grey.100',
        py: 4,
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          gap: 2,
          flexWrap: 'nowrap',
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 600, 
            color: 'black',
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
            flex: 1,
            minWidth: 0,
          }}
        >
          Patients
        </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setViewMode('create')}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: { xs: 1.5, sm: 3 },
                py: 1,
                minWidth: { xs: 'auto', sm: 'auto' },
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  boxShadow: '0 6px 16px rgba(59, 130, 246, 0.5)',
                },
                '& .MuiButton-startIcon': {
                  margin: { xs: 0, sm: '0 8px 0 0' },
                },
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                New Patient
              </Box>
            </Button>
            <Button
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: { xs: 1.5, sm: 3 },
                py: 1,
                borderColor: 'error.main',
                color: 'error.main',
                '&:hover': {
                  borderColor: 'error.dark',
                  backgroundColor: 'error.light',
                  color: 'error.dark',
                },
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Logout
              </Box>
            </Button>
          </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : patients.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            boxShadow: 4,
          }}
        >
          <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No patients found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first patient to get started!
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setViewMode('create')}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Create Patient
          </Button>
            </Paper>
      ) : (
              // Table Layout (Responsive)
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 3,
            boxShadow: 4,
            overflowX: 'auto',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            maxWidth: '100%',
          }}
        >
                <Table sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow sx={{ 
                      backgroundColor: 'grey.300',
              }}>
                      <TableCell sx={{ color: 'text.primary', fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' }, whiteSpace: 'nowrap' }}>Name</TableCell>
                      <TableCell sx={{ color: 'text.primary', fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' }, whiteSpace: 'nowrap' }}>Email</TableCell>
                      <TableCell sx={{ color: 'text.primary', fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' }, whiteSpace: 'nowrap' }}>Phone</TableCell>
                      <TableCell sx={{ color: 'text.primary', fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' }, whiteSpace: 'nowrap' }}>Date of Birth</TableCell>
                      <TableCell align="center" sx={{ color: 'text.primary', fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' }, whiteSpace: 'nowrap' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patients.map((patient) => (
                <TableRow
                  key={patient.id}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': {
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    },
                    '&:nth-of-type(even)': {
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    },
                  }}
                >
                  <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    <Typography
                      component="button"
                      onClick={() => navigate(`/patients/${patient.id}`)}
                      sx={{
                        background: 'none',
                        border: 'none',
                        color: 'primary.main',
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontSize: 'inherit',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {truncateName(patient.name)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    {patient.email || <Chip label="N/A" size="small" variant="outlined" />}
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    {patient.phone || <Chip label="N/A" size="small" variant="outlined" />}
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    {patient.dob ? (
                      new Date(patient.dob).toLocaleDateString()
                    ) : (
                      <Chip label="N/A" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                          setEditingPatient(patient);
                          setViewMode('edit');
                        }}
                        sx={{
                          backgroundColor: 'rgba(25, 118, 210, 0.1)',
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.2)',
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(patient)}
                        sx={{
                          backgroundColor: 'rgba(211, 47, 47, 0.1)',
                          '&:hover': {
                            backgroundColor: 'rgba(211, 47, 47, 0.2)',
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

        {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            shape="rounded"
              size="medium"
          />
        </Box>
      )}
      </Container>

      {/* Create Patient Modal */}
      <Dialog
        open={viewMode === 'create'}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
          Create Patient
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ pt: 2 }}>
            <PatientForm
              onSubmit={handleCreate}
              onCancel={handleCloseModal}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Edit Patient Modal */}
      <Dialog
        open={viewMode === 'edit' && editingPatient !== null}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
          Edit Patient
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ pt: 2 }}>
            {editingPatient && (
              <PatientForm
                initialData={editingPatient as Partial<CreatePatientInput>}
                onSubmit={handleUpdate}
                onCancel={handleCloseModal}
              />
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, pb: 1, textAlign: 'center' }}>
          Delete Patient
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ textAlign: 'center' }}>
            Are you sure you want to delete <strong>{patientToDelete?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'center', gap: 2 }}>
          <Button
            onClick={handleDeleteCancel}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              minWidth: 100,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              minWidth: 100,
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatientListPage;
