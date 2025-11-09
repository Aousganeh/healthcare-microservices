import { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  patientService,
  doctorService,
  appointmentService,
  billingService,
  roomService,
  equipmentService,
} from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
    billings: 0,
    rooms: 0,
    equipment: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [patients, doctors, appointments, billings, rooms, equipment] = await Promise.all([
          patientService.getAll(),
          doctorService.getAll(),
          appointmentService.getAll(),
          billingService.getAll(),
          roomService.getAll(),
          equipmentService.getAll(),
        ]);

        setStats({
          patients: patients.data.length,
          doctors: doctors.data.length,
          appointments: appointments.data.length,
          billings: billings.data.length,
          rooms: rooms.data.length,
          equipment: equipment.data.length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const statCards = [
    { title: 'Patients', value: stats.patients, color: '#1976d2' },
    { title: 'Doctors', value: stats.doctors, color: '#2e7d32' },
    { title: 'Appointments', value: stats.appointments, color: '#ed6c02' },
    { title: 'Billings', value: stats.billings, color: '#d32f2f' },
    { title: 'Rooms', value: stats.rooms, color: '#9c27b0' },
    { title: 'Equipment', value: stats.equipment, color: '#0288d1' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={4} key={card.title}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}dd 100%)`,
                color: 'white',
              }}
            >
              <Typography variant="h3" gutterBottom>
                {card.value}
              </Typography>
              <Typography variant="h6">{card.title}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

