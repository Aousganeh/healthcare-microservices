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
} from '@mui/material';
import { medicalRecordService, getErrorMessage, patientService } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import type { MedicalRecord, Patient } from '../types';
import DataTable from '../components/DataTable';
import PatientSelectionModal from '../components/PatientSelectionModal';
import SearchIcon from '@mui/icons-material/Search';
import { format } from 'date-fns';

export default function MedicalRecordsPage() {
  const { showError, showSuccess } = useNotification();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MedicalRecord | null>(null);
  const [formData, setFormData] = useState<Partial<MedicalRecord>>({});
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    if (formData.patientId && open) {
      loadPatientDetails(formData.patientId);
    } else if (!formData.patientId) {
      setSelectedPatient(null);
    }
  }, [formData.patientId, open]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const response = await medicalRecordService.getAll();
      setRecords(response.data);
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

  const handleOpen = (record?: MedicalRecord) => {
    if (record) {
      setEditing(record);
      setFormData(record);
      if (record.patientId) {
        loadPatientDetails(record.patientId);
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
        await medicalRecordService.update(editing.id, formData as MedicalRecord);
        showSuccess('Medical record updated successfully');
      } else {
        await medicalRecordService.create(formData as MedicalRecord);
        showSuccess('Medical record created successfully');
      }
      handleClose();
      loadRecords();
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    }
  };

  const handleDelete = async (record: MedicalRecord) => {
    if (!record.id || !window.confirm('Are you sure you want to delete this medical record?')) {
      return;
    }
    try {
      await medicalRecordService.delete(record.id);
      showSuccess('Medical record deleted successfully');
      loadRecords();
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    }
  };

  const columns = [
    { id: 'id', label: 'ID', minWidth: 50 },
    { id: 'diagnosis', label: 'Diagnosis', minWidth: 200 },
    {
      id: 'recordDate',
      label: 'Record Date',
      minWidth: 150,
      format: (value: string) => value ? format(new Date(value), 'yyyy-MM-dd HH:mm') : '',
    },
    { id: 'patientId', label: 'Patient ID', minWidth: 100 },
  ];

  if (loading && records.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Medical Records</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add Medical Record
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={records}
        onEdit={handleOpen}
        onDelete={handleDelete}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Edit Medical Record' : 'Add Medical Record'}</DialogTitle>
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
              label="Diagnosis"
              value={formData.diagnosis || ''}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              required
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Record Date"
              type="datetime-local"
              value={formData.recordDate ? new Date(formData.recordDate).toISOString().slice(0, 16) : ''}
              onChange={(e) => setFormData({ ...formData, recordDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />
            <TextField
              label="Notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              fullWidth
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.patientId || !formData.diagnosis}>
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

