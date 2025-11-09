import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  InputAdornment,
  Backdrop,
} from '@mui/material';
import { patientService, getErrorMessage } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import type { Patient } from '../types';
import SearchIcon from '@mui/icons-material/Search';

interface PatientSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (patient: Patient) => void;
  selectedPatientId?: number;
}

export default function PatientSelectionModal({
  open,
  onClose,
  onSelect,
  selectedPatientId,
}: PatientSelectionModalProps) {
  const { showError } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      loadPatients();
    } else {
      setSearchTerm('');
      setPatients([]);
    }
  }, [open]);

  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        searchPatients(searchTerm);
      } else {
        loadPatients();
      }
    }, 300);

    setDebounceTimer(timer);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [searchTerm]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await patientService.getAll();
      setPatients(response.data);
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const searchPatients = async (term: string) => {
    try {
      setLoading(true);
      const response = await patientService.search(term);
      setPatients(response.data);
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    onSelect(patient);
    onClose();
  };

  const handleClose = () => {
    setSearchTerm('');
    setPatients([]);
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
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            position: 'relative',
            zIndex: (theme) => theme.zIndex.modal,
          },
        }}
      >
        <DialogTitle>Select Patient</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Search Patient"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              placeholder="Search by name, surname, email, phone, or serial number"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : patients.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                {searchTerm.trim() ? 'No patients found matching your search' : 'No patients available'}
              </Typography>
            ) : (
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                <List>
                  {patients.map((patient) => (
                    <ListItem key={patient.id} disablePadding>
                      <ListItemButton
                        selected={selectedPatientId === patient.id}
                        onClick={() => handleSelectPatient(patient)}
                        sx={{
                          '&.Mui-selected': {
                            backgroundColor: 'primary.light',
                            '&:hover': {
                              backgroundColor: 'primary.light',
                            },
                          },
                        }}
                      >
                        <ListItemText
                          primary={`${patient.name} ${patient.surname}`}
                          secondary={
                            <Box>
                              {patient.email && (
                                <Typography variant="caption" display="block">
                                  Email: {patient.email}
                                </Typography>
                              )}
                              {patient.phoneNumber && (
                                <Typography variant="caption" display="block">
                                  Phone: {patient.phoneNumber}
                                </Typography>
                              )}
                              {patient.serialNumber && (
                                <Typography variant="caption" display="block">
                                  Serial: {patient.serialNumber}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
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

