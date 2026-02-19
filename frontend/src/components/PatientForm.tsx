import React from 'react';
import { type CreatePatientInput, type UpdatePatientInput } from '../api/patient';
import { TextField, Button, Box } from '@mui/material';

interface PatientFormProps {
  initialData?: Partial<CreatePatientInput>;
  onSubmit: (data: CreatePatientInput | UpdatePatientInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  submitLabel?: string;
}

const PatientForm: React.FC<PatientFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  submitLabel = 'Save',
}) => {
  const [name, setName] = React.useState(initialData.name || '');
  const [email, setEmail] = React.useState(initialData.email || '');
  const [phone, setPhone] = React.useState(initialData.phone || '');
  const [dob, setDob] = React.useState(
    initialData.dob ? initialData.dob.split('T')[0] : '' // Convert ISO to YYYY-MM-DD for input
  );
  const [medicalNotes, setMedicalNotes] = React.useState(
    initialData.medicalNotes || ''
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name,
      email: email || undefined,
      phone: phone || undefined,
      dob: dob || undefined,
      medicalNotes: medicalNotes || undefined,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        id="name"
        label="Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={loading}
        fullWidth
        variant="outlined"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
        }}
      />

      <TextField
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        fullWidth
        variant="outlined"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
        }}
      />

      <TextField
        id="phone"
        label="Phone"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        disabled={loading}
        fullWidth
        variant="outlined"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
        }}
      />

      <TextField
        id="dob"
        label="Date of Birth"
        type="date"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
        disabled={loading}
        fullWidth
        variant="outlined"
        InputLabelProps={{
          shrink: true,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
        }}
      />

      <TextField
        id="medicalNotes"
        label="Medical Notes"
        value={medicalNotes}
        onChange={(e) => setMedicalNotes(e.target.value)}
        disabled={loading}
        fullWidth
        multiline
        rows={4}
        variant="outlined"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
        }}
      />

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
        <Button
          type="button"
          onClick={onCancel}
          disabled={loading}
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 3,
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          variant="contained"
          color="primary"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 3,
          }}
        >
          {loading ? 'Saving...' : submitLabel}
        </Button>
      </Box>
    </Box>
  );
};

export default PatientForm;