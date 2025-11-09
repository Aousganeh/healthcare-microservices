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
import { appointmentService, getErrorMessage } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import type { Appointment } from '../types';
import { AppointmentStatus } from '../types';
import DataTable from '../components/DataTable';
import { format } from 'date-fns';

export default function AppointmentsPage() {
  const { showError, showSuccess } = useNotification();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState<Partial<Appointment>>({});
    useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getAll();
      setAppointments(response.data);
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (appointment?: Appointment) => {
    if (appointment) {
      setEditing(appointment);
      setFormData({
        ...appointment,
        appointmentDate: appointment.appointmentDate ? appointment.appointmentDate.slice(0, 16) : '',
      });
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
        await appointmentService.update(editing.id, formData as Appointment);
        showSuccess('await appointmentService.update(editing.id, formData as Appointment); update successfully');
      } else {
        await appointmentService.create(formData as Appointment);
        showSuccess('await appointmentService.create(formData as Appointment); create successfully');
      }
      handleClose();
      loadAppointments();
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    }
  };

  const handleDelete = async (appointment: Appointment) => {
    if (!appointment.id || !window.confirm('Are you sure you want to delete this appointment?')) {
      return;
    }
    try {
      await appointmentService.delete(appointment.id);
      loadAppointments();
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    }
  };

  const columns = [
    { id: 'id', label: 'ID', minWidth: 50 },
    { id: 'patientId', label: 'Patient ID', minWidth: 80 },
    { id: 'doctorId', label: 'Doctor ID', minWidth: 80 },
    {
      id: 'appointmentDate',
      label: 'Date & Time',
      minWidth: 150,
      format: (value: string) => value ? format(new Date(value), 'yyyy-MM-dd HH:mm') : '',
    },
    { id: 'durationMinutes', label: 'Duration (min)', minWidth: 100 },
    { id: 'status', label: 'Status', minWidth: 100 },
    { id: 'reason', label: 'Reason', minWidth: 150 },
  ];

  if (loading && appointments.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Appointments</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add Appointment
        </Button>
      </Box>

      

      <DataTable
        columns={columns}
        rows={appointments}
        onEdit={handleOpen}
        onDelete={handleDelete}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Edit Appointment' : 'Add Appointment'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Patient ID"
              type="number"
              value={formData.patientId || ''}
              onChange={(e) => setFormData({ ...formData, patientId: parseInt(e.target.value) })}
              required
              fullWidth
            />
            <TextField
              label="Doctor ID"
              type="number"
              value={formData.doctorId || ''}
              onChange={(e) => setFormData({ ...formData, doctorId: parseInt(e.target.value) })}
              required
              fullWidth
            />
            <TextField
              label="Appointment Date & Time"
              type="datetime-local"
              value={formData.appointmentDate || ''}
              onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />
            <TextField
              label="Duration (minutes)"
              type="number"
              value={formData.durationMinutes || ''}
              onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || undefined })}
              fullWidth
            />
            <TextField
              label="Status"
              select
              value={formData.status || ''}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as AppointmentStatus })}
              fullWidth
            >
              {Object.values(AppointmentStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {status.replace('_', ' ')}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Reason"
              value={formData.reason || ''}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              multiline
              rows={3}
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

