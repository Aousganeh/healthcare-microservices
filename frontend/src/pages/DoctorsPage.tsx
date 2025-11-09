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
  CircularProgress,
} from '@mui/material';
import { doctorService, getErrorMessage } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import type { Doctor } from '../types';
import { Gender, DutyStatus } from '../types';
import DataTable from '../components/DataTable';

export default function DoctorsPage() {
  const { showError, showSuccess } = useNotification();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState<Partial<Doctor>>({});
    const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const response = await doctorService.getAll();
      setDoctors(response.data);
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadDoctors();
      return;
    }
    try {
      setLoading(true);
      const response = await doctorService.search(searchQuery);
      setDoctors(response.data);
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (doctor?: Doctor) => {
    if (doctor) {
      setEditing(doctor);
      setFormData(doctor);
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
      };

  const handleSubmit = async () => {
    try {
            if (editing?.id) {
        await doctorService.update(editing.id, formData as Doctor);
        showSuccess('await doctorService.update(editing.id, formData as Doctor); update successfully');
      } else {
        await doctorService.create(formData as Doctor);
        showSuccess('await doctorService.create(formData as Doctor); create successfully');
      }
      handleClose();
      loadDoctors();
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    }
  };

  const handleDelete = async (doctor: Doctor) => {
    if (!doctor.id || !window.confirm('Are you sure you want to delete this doctor?')) {
      return;
    }
    try {
      await doctorService.delete(doctor.id);
      loadDoctors();
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    }
  };

  const columns = [
    { id: 'id', label: 'ID', minWidth: 50 },
    { id: 'name', label: 'Name', minWidth: 100 },
    { id: 'surname', label: 'Surname', minWidth: 100 },
    { id: 'specialization', label: 'Specialization', minWidth: 150 },
    { id: 'department', label: 'Department', minWidth: 120 },
    { id: 'licenseNumber', label: 'License', minWidth: 120 },
    { id: 'dutyStatus', label: 'Status', minWidth: 100 },
    { id: 'email', label: 'Email', minWidth: 150 },
  ];

  if (loading && doctors.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Doctors</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add Doctor
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

      

      <DataTable
        columns={columns}
        rows={doctors}
        onEdit={handleOpen}
        onDelete={handleDelete}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Edit Doctor' : 'Add Doctor'}</DialogTitle>
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
              label="License Number"
              value={formData.licenseNumber || ''}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Specialization"
              value={formData.specialization || ''}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Department"
              value={formData.department || ''}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              fullWidth
            />
            <TextField
              label="Duty Status"
              select
              value={formData.dutyStatus || ''}
              onChange={(e) => setFormData({ ...formData, dutyStatus: e.target.value as DutyStatus })}
              fullWidth
            >
              {Object.values(DutyStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {status.replace('_', ' ')}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Years of Experience"
              type="number"
              value={formData.yearsOfExperience || ''}
              onChange={(e) => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) || undefined })}
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

