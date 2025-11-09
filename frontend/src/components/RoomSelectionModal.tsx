import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  CircularProgress,
  Backdrop,
} from '@mui/material';
import { roomService, getErrorMessage } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import type { Room } from '../types';

interface RoomSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (roomId: number) => void;
  selectedRoomId?: number;
}

export default function RoomSelectionModal({
  open,
  onClose,
  onSelect,
  selectedRoomId,
}: RoomSelectionModalProps) {
  const { showError } = useNotification();
  const [floors, setFloors] = useState<number[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<number | ''>('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);

  useEffect(() => {
    if (open) {
      loadFloors();
    }
  }, [open]);

  useEffect(() => {
    if (selectedFloor !== '' && open) {
      loadRoomsByFloor(selectedFloor as number);
    } else {
      setRooms([]);
    }
  }, [selectedFloor, open]);

  const loadFloors = async () => {
    try {
      setLoading(true);
      const response = await roomService.getAllFloors();
      setFloors(response.data);
      if (response.data.length > 0) {
        setSelectedFloor(response.data[0]);
      }
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const loadRoomsByFloor = async (floor: number) => {
    try {
      setLoadingRooms(true);
      const response = await roomService.getAvailablePatientRoomsByFloor(floor);
      setRooms(response.data);
    } catch (err: unknown) {
      showError(getErrorMessage(err));
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleSelectRoom = (room: Room) => {
    if (room.id) {
      onSelect(room.id);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedFloor('');
    setRooms([]);
    onClose();
  };

  return (
    <>
      <Backdrop
        open={open}
        sx={{
          zIndex: (theme) => theme.zIndex.modal - 1,
          backdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
        onClick={handleClose}
      />
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            position: 'relative',
            zIndex: (theme) => theme.zIndex.modal,
          },
        }}
      >
      <DialogTitle>Select Room</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <TextField
            label="Select Floor"
            select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(Number(e.target.value))}
            fullWidth
            disabled={loading || floors.length === 0}
          >
            {floors.map((floor) => (
              <MenuItem key={floor} value={floor}>
                Floor {floor}
              </MenuItem>
            ))}
          </TextField>

          {loadingRooms ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : selectedFloor !== '' && rooms.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
              No available rooms on floor {selectedFloor}
            </Typography>
          ) : (
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                Available Rooms on Floor {selectedFloor}:
              </Typography>
              <Grid container spacing={2}>
                {rooms.map((room) => (
                  <Grid item xs={12} sm={6} md={4} key={room.id}>
                    <Card
                      variant={selectedRoomId === room.id ? 'outlined' : 'elevation'}
                      sx={{
                        border: selectedRoomId === room.id ? 2 : 0,
                        borderColor: 'primary.main',
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: 4,
                        },
                      }}
                    >
                      <CardActionArea onClick={() => handleSelectRoom(room)}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Room {room.number}
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Type: {room.type?.replace(/_/g, ' ')}
                            </Typography>
                            {room.capacity && (
                              <Typography variant="body2" color="text.secondary">
                                Capacity: {room.capacity}
                              </Typography>
                            )}
                            {room.currentOccupancy !== undefined && room.capacity && (
                              <Typography variant="body2" color="text.secondary">
                                Occupancy: {room.currentOccupancy}/{room.capacity}
                              </Typography>
                            )}
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              {room.isAvailable && (
                                <Chip label="Available" color="success" size="small" />
                              )}
                              {room.isActive && (
                                <Chip label="Active" color="primary" size="small" />
                              )}
                            </Box>
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
      </Dialog>
    </>
  );
}

