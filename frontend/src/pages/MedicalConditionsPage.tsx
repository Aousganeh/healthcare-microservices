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
  InputAdornment,
  IconButton,
} from '@mui/material';
import { medicalConditionService, getErrorMessage, patientService } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import type { MedicalCondition, Patient } from '../types';
import DataTable from '../components/DataTable';
import PatientSelectionModal from '../components/PatientSelectionModal';
import SearchIcon from '@mui/icons-material/Search';
import { format } from 'date-fns';

const SEVERITY_OPTIONS = ['MILD', 'MODERATE', 'SEVERE', 'CRITICAL'];

export default function MedicalConditionsPage() {
  const { showError, showSuccess } = useNotification();
  const [conditions, setConditions] = useState<MedicalCondition[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MedicalCondition | null>(null);
  const [formData, setFormData] = useState<Partial<MedicalCondition>>({});
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    loadConditions();
  }, []);

  useEffect(() => {
    if (formData.patientId && open) {
      loadPatientDetails(formData.patientId);
    } else if (!formData.patientId) {
      setSelectedPatient(null);
    }
  }, [formData.patientId, open]);

  const loadConditions = async () => {
    try {
      setLoading(true);
      const response = await medicalConditionService.getAll();
      setConditions(response.data);
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

  const handleOpen = (condition?: MedicalCondition) => {
    if (condition) {
      setEditing(condition);
      setFormData(condition);
      if (condition.patientId) {
        loadPatientDetails(condition.patientId);
      }
    } else {
      setEditing(null);
      setFormData({});
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
        await medicalConditionService.update(editing.id, formData as MedicalCondition);
        showSuccess('Medical condition updated successfully');
      } else {
        await medicalConditionService.create(formData as MedicalCondition);
        showSuccess('Medical condition created successfully');
      }
      handleClose();
      loadConditions();
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    }
  };

  const handleDelete = async (condition: MedicalCondition) => {
    if (!condition.id || !window.confirm('Are you sure you want to delete this medical condition?')) {
      return;
    }
    try {
      await medicalConditionService.delete(condition.id);
      showSuccess('Medical condition deleted successfully');
      loadConditions();
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    }
  };

  const columns = [
    { id: 'id', label: 'ID', minWidth: 50 },
    { id: 'name', label: 'Condition Name', minWidth: 150 },
    { id: 'severity', label: 'Severity', minWidth: 100 },
    {
      id: 'diagnosisDate',
      label: 'Diagnosis Date',
      minWidth: 120,
      format: (value: string) => value ? format(new Date(value), 'yyyy-MM-dd') : '',
    },
    { id: 'patientId', label: 'Patient ID', minWidth: 100 },
  ];

  if (loading && conditions.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Medical Conditions</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add Medical Condition
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={conditions}
        onEdit={handleOpen}
        onDelete={handleDelete}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Edit Medical Condition' : 'Add Medical Condition'}</DialogTitle>
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
              label="Condition Name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Diagnosis Date"
              type="date"
              value={formData.diagnosisDate ? new Date(formData.diagnosisDate).toISOString().split('T')[0] : ''}
              onChange={(e) => setFormData({ ...formData, diagnosisDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />
            <TextField
              label="Severity"
              select
              value={formData.severity || ''}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              fullWidth
            >
              {SEVERITY_OPTIONS.map((severity) => (
                <MenuItem key={severity} value={severity}>
                  {severity}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.patientId || !formData.name}>
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

