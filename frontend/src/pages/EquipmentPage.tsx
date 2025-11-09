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
import { equipmentService, getErrorMessage } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import type { Equipment } from '../types';
import { EquipmentStatus } from '../types';
import DataTable from '../components/DataTable';
import { format } from 'date-fns';

export default function EquipmentPage() {
  const { showError, showSuccess } = useNotification();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [formData, setFormData] = useState<Partial<Equipment>>({});
    useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const response = await equipmentService.getAll();
      setEquipment(response.data);
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (item?: Equipment) => {
    if (item) {
      setEditing(item);
      setFormData({
        ...item,
        purchaseDate: item.purchaseDate ? item.purchaseDate : '',
        lastMaintenanceDate: item.lastMaintenanceDate ? item.lastMaintenanceDate : '',
        nextMaintenanceDueDate: item.nextMaintenanceDueDate ? item.nextMaintenanceDueDate : '',
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
        await equipmentService.update(editing.id, formData as Equipment);
        showSuccess('await equipmentService.update(editing.id, formData as Equipment); update successfully');
      } else {
        await equipmentService.create(formData as Equipment);
        showSuccess('await equipmentService.create(formData as Equipment); create successfully');
      }
      handleClose();
      loadEquipment();
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    }
  };

  const handleDelete = async (item: Equipment) => {
    if (!item.id || !window.confirm('Are you sure you want to delete this equipment?')) {
      return;
    }
    try {
      await equipmentService.delete(item.id);
      loadEquipment();
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    }
  };

  const columns = [
    { id: 'id', label: 'ID', minWidth: 50 },
    { id: 'name', label: 'Name', minWidth: 150 },
    { id: 'manufacturer', label: 'Manufacturer', minWidth: 120 },
    { id: 'serialNumber', label: 'Serial Number', minWidth: 120 },
    { id: 'status', label: 'Status', minWidth: 100 },
    { id: 'price', label: 'Price', minWidth: 100, format: (value: number) => `$${value?.toFixed(2) || '0.00'}` },
    { id: 'roomId', label: 'Room ID', minWidth: 80 },
    {
      id: 'purchaseDate',
      label: 'Purchase Date',
      minWidth: 120,
      format: (value: string) => value ? format(new Date(value), 'yyyy-MM-dd') : '',
    },
  ];

  if (loading && equipment.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Equipment</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add Equipment
        </Button>
      </Box>

      

      <DataTable
        columns={columns}
        rows={equipment}
        onEdit={handleOpen}
        onDelete={handleDelete}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Edit Equipment' : 'Add Equipment'}</DialogTitle>
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
              label="Description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />
            <TextField
              label="Status"
              select
              value={formData.status || ''}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as EquipmentStatus })}
              fullWidth
            >
              {Object.values(EquipmentStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {status.replace('_', ' ')}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Manufacturer"
              value={formData.manufacturer || ''}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              fullWidth
            />
            <TextField
              label="Serial Number"
              value={formData.serialNumber || ''}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              fullWidth
            />
            <TextField
              label="Price"
              type="number"
              value={formData.price || ''}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              required
              fullWidth
            />
            <TextField
              label="Purchase Date"
              type="date"
              value={formData.purchaseDate || ''}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />
            <TextField
              label="Last Maintenance Date"
              type="date"
              value={formData.lastMaintenanceDate || ''}
              onChange={(e) => setFormData({ ...formData, lastMaintenanceDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Next Maintenance Due Date"
              type="date"
              value={formData.nextMaintenanceDueDate || ''}
              onChange={(e) => setFormData({ ...formData, nextMaintenanceDueDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Maintenance Interval (days)"
              type="number"
              value={formData.maintenanceIntervalDays || ''}
              onChange={(e) => setFormData({ ...formData, maintenanceIntervalDays: parseInt(e.target.value) || undefined })}
              fullWidth
            />
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

