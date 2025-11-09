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
  CircularProgress,
  InputAdornment,
  IconButton,
  MenuItem,
} from '@mui/material';
import { insuranceService, getErrorMessage, patientService } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import type { Insurance, Patient } from '../types';
import DataTable from '../components/DataTable';
import PatientSelectionModal from '../components/PatientSelectionModal';
import SearchIcon from '@mui/icons-material/Search';
import { format } from 'date-fns';

export default function InsurancesPage() {
  const { showError, showSuccess } = useNotification();
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Insurance | null>(null);
  const [formData, setFormData] = useState<Partial<Insurance>>({});
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    loadInsurances();
  }, []);

  useEffect(() => {
    if (formData.patientId && open) {
      loadPatientDetails(formData.patientId);
    } else if (!formData.patientId) {
      setSelectedPatient(null);
    }
  }, [formData.patientId, open]);

  const loadInsurances = async () => {
    try {
      setLoading(true);
      const response = await insuranceService.getAll();
      setInsurances(response.data);
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const loadPatientDetails = async (patientId: number) => {
    try {
      const response = await patientService.getById(patientId);
      setSelectedPatient(response.data);
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    }
  };

  const handleOpen = (insurance?: Insurance) => {
    if (insurance) {
      setEditing(insurance);
      setFormData(insurance);
      if (insurance.patientId) {
        loadPatientDetails(insurance.patientId);
      }
    } else {
      setEditing(null);
      setFormData({ isActive: true });
      setSelectedPatient(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setFormData({});
    setSelectedPatient(null);
  };

  const handlePatientSelect = (patient: Patient) => {
    setFormData({ ...formData, patientId: patient.id });
    setSelectedPatient(patient);
  };

  const handleSubmit = async () => {
    try {
      if (editing?.id) {
        await insuranceService.update(editing.id, formData as Insurance);
        showSuccess('Insurance updated successfully');
      } else {
        await insuranceService.create(formData as Insurance);
        showSuccess('Insurance created successfully');
      }
      handleClose();
      loadInsurances();
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    }
  };

  const handleDelete = async (insurance: Insurance) => {
    if (!insurance.id || !window.confirm('Are you sure you want to delete this insurance?')) {
      return;
    }
    try {
      await insuranceService.delete(insurance.id);
      showSuccess('Insurance deleted successfully');
      loadInsurances();
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    }
  };

  const columns = [
    { id: 'id', label: 'ID', minWidth: 50 },
    { id: 'providerName', label: 'Provider', minWidth: 150 },
    { id: 'policyNumber', label: 'Policy Number', minWidth: 120 },
    {
      id: 'coverageStartDate',
      label: 'Start Date',
      minWidth: 120,
      format: (value: string) => value ? format(new Date(value), 'yyyy-MM-dd') : '',
    },
    {
      id: 'coverageEndDate',
      label: 'End Date',
      minWidth: 120,
      format: (value: string) => value ? format(new Date(value), 'yyyy-MM-dd') : 'N/A',
    },
    {
      id: 'coveragePercentage',
      label: 'Coverage %',
      minWidth: 100,
      format: (value: number) => value ? `${value}%` : 'N/A',
    },
    {
      id: 'isActive',
      label: 'Active',
      minWidth: 80,
      format: (value: boolean) => value ? 'Yes' : 'No',
    },
    { id: 'patientId', label: 'Patient ID', minWidth: 100 },
  ];

  if (loading && insurances.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Insurances</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add Insurance
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={insurances}
        onEdit={handleOpen}
        onDelete={handleDelete}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Edit Insurance' : 'Add Insurance'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Patient"
              value={selectedPatient ? `${selectedPatient.name} ${selectedPatient.surname}` : formData.patientId || ''}
              fullWidth
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setPatientModalOpen(true)} edge="end">
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              onClick={() => setPatientModalOpen(true)}
              sx={{ cursor: 'pointer' }}
              helperText="Click to select a patient"
              required
            />
            <TextField
              label="Provider Name"
              value={formData.providerName || ''}
              onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Policy Number"
              value={formData.policyNumber || ''}
              onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Coverage Start Date"
              type="date"
              value={formData.coverageStartDate ? new Date(formData.coverageStartDate).toISOString().split('T')[0] : ''}
              onChange={(e) => setFormData({ ...formData, coverageStartDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />
            <TextField
              label="Coverage End Date"
              type="date"
              value={formData.coverageEndDate ? new Date(formData.coverageEndDate).toISOString().split('T')[0] : ''}
              onChange={(e) => setFormData({ ...formData, coverageEndDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Coverage Details"
              value={formData.coverageDetails || ''}
              onChange={(e) => setFormData({ ...formData, coverageDetails: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Coverage Percentage"
              type="number"
              value={formData.coveragePercentage || ''}
              onChange={(e) => setFormData({ ...formData, coveragePercentage: e.target.value ? parseFloat(e.target.value) : undefined })}
              fullWidth
              inputProps={{ min: 0, max: 100, step: 0.01 }}
              helperText="Enter percentage (0-100)"
            />
            <TextField
              label="Active"
              select
              value={formData.isActive !== undefined ? formData.isActive.toString() : 'true'}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
              fullWidth
            >
              <MenuItem value="true">Yes</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.patientId || !formData.providerName || !formData.policyNumber}>
            {editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <PatientSelectionModal
        open={patientModalOpen}
        onClose={() => setPatientModalOpen(false)}
        onSelect={handlePatientSelect}
        selectedPatientId={formData.patientId}
      />
    </Box>
  );
}

