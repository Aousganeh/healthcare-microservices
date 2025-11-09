import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { patientService } from '../services/api';
import type { Patient } from '../types';
import { Gender, BloodGroup } from '../types';
import DataTable from '../components/DataTable';
import { format } from 'date-fns';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<Partial<Patient>>({});
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await patientService.getAll();
      setPatients(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadPatients();
      return;
    }
    try {
      setLoading(true);
      const response = await patientService.search(searchQuery);
      setPatients(response.data);
    } catch (err: any) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (patient?: Patient) => {
    if (patient) {
      setEditing(patient);
      setFormData(patient);
    } else {
      setEditing(null);
      setFormData({});
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setFormData({});
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      if (editing?.id) {
        await patientService.update(editing.id, formData as Patient);
      } else {
        await patientService.create(formData as Patient);
      }
      handleClose();
      loadPatients();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (patient: Patient) => {
    if (!patient.id || !window.confirm('Are you sure you want to delete this patient?')) {
      return;
    }
    try {
      await patientService.delete(patient.id);
      loadPatients();
    } catch (err: any) {
      setError(err.message || 'Delete failed');
    }
  };

  const columns = [
    { id: 'id', label: 'ID', minWidth: 50 },
    { id: 'name', label: 'Name', minWidth: 100 },
    { id: 'surname', label: 'Surname', minWidth: 100 },
    {
      id: 'dateOfBirth',
      label: 'Date of Birth',
      minWidth: 120,
      format: (value: string) => value ? format(new Date(value), 'yyyy-MM-dd') : '',
    },
    { id: 'gender', label: 'Gender', minWidth: 80 },
    { id: 'email', label: 'Email', minWidth: 150 },
    { id: 'phoneNumber', label: 'Phone', minWidth: 120 },
    { id: 'bloodGroup', label: 'Blood Group', minWidth: 100 },
  ];

  if (loading && patients.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Patients</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add Patient
        </Button>
      </Box>

      <Box display="flex" gap={2} mb={3}>
        <TextField
          label="Search"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ flexGrow: 1 }}
        />
        <Button variant="outlined" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <DataTable
        columns={columns}
        rows={patients}
        onEdit={handleOpen}
        onDelete={handleDelete}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Edit Patient' : 'Add Patient'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Surname"
              value={formData.surname || ''}
              onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth || ''}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />
            <TextField
              label="Gender"
              select
              value={formData.gender || ''}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
              required
              fullWidth
            >
              {Object.values(Gender).map((gender) => (
                <MenuItem key={gender} value={gender}>
                  {gender}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Phone Number"
              value={formData.phoneNumber || ''}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              fullWidth
            />
            <TextField
              label="Serial Number"
              value={formData.serialNumber || ''}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              fullWidth
            />
            <TextField
              label="Blood Group"
              select
              value={formData.bloodGroup || ''}
              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value as BloodGroup })}
              fullWidth
            >
              {Object.values(BloodGroup).map((bg) => (
                <MenuItem key={bg} value={bg}>
                  {bg.replace('_', ' ')}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Room ID"
              type="number"
              value={formData.roomId || ''}
              onChange={(e) => setFormData({ ...formData, roomId: parseInt(e.target.value) || undefined })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

