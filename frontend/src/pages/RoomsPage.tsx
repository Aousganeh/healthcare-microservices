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
import { roomService, getErrorMessage } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import type { Room } from '../types';
import { RoomType } from '../types';
import DataTable from '../components/DataTable';

export default function RoomsPage() {
  const { showError, showSuccess } = useNotification();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [formData, setFormData] = useState<Partial<Room>>({});
    useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const response = await roomService.getAll();
      setRooms(response.data);
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (room?: Room) => {
    if (room) {
      setEditing(room);
      setFormData(room);
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
        await roomService.update(editing.id, formData as Room);
        showSuccess('await roomService.update(editing.id, formData as Room); update successfully');
      } else {
        await roomService.create(formData as Room);
        showSuccess('await roomService.create(formData as Room); create successfully');
      }
      handleClose();
      loadRooms();
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    }
  };

  const handleDelete = async (room: Room) => {
    if (!room.id || !window.confirm('Are you sure you want to delete this room?')) {
      return;
    }
    try {
      await roomService.delete(room.id);
      loadRooms();
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    }
  };

  const columns = [
    { id: 'id', label: 'ID', minWidth: 50 },
    { id: 'number', label: 'Room Number', minWidth: 120 },
    { id: 'type', label: 'Type', minWidth: 120 },
    { id: 'capacity', label: 'Capacity', minWidth: 80 },
    { id: 'currentOccupancy', label: 'Occupancy', minWidth: 100 },
    { id: 'floor', label: 'Floor', minWidth: 80 },
    { id: 'isAvailable', label: 'Available', minWidth: 100, format: (value: boolean) => value ? 'Yes' : 'No' },
    { id: 'isActive', label: 'Active', minWidth: 80, format: (value: boolean) => value ? 'Yes' : 'No' },
  ];

  if (loading && rooms.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Rooms</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add Room
        </Button>
      </Box>

      

      <DataTable
        columns={columns}
        rows={rooms}
        onEdit={handleOpen}
        onDelete={handleDelete}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Edit Room' : 'Add Room'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Room Number"
              value={formData.number || ''}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Room Type"
              select
              value={formData.type || ''}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as RoomType })}
              required
              fullWidth
            >
              {Object.values(RoomType).map((type) => (
                <MenuItem key={type} value={type}>
                  {type.replace('_', ' ')}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Capacity"
              type="number"
              value={formData.capacity || ''}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              required
              fullWidth
            />
            <TextField
              label="Floor"
              type="number"
              value={formData.floor || ''}
              onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || undefined })}
              fullWidth
            />
            <TextField
              label="Current Occupancy"
              type="number"
              value={formData.currentOccupancy || ''}
              onChange={(e) => setFormData({ ...formData, currentOccupancy: parseInt(e.target.value) || undefined })}
              fullWidth
            />
            <TextField
              label="Available"
              select
              value={formData.isAvailable !== undefined ? formData.isAvailable.toString() : ''}
              onChange={(e) => setFormData({ ...formData, isAvailable: e.target.value === 'true' })}
              fullWidth
            >
              <MenuItem value="true">Yes</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </TextField>
            <TextField
              label="Active"
              select
              value={formData.isActive !== undefined ? formData.isActive.toString() : ''}
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
          <Button onClick={handleSubmit} variant="contained">
            {editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

