import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PatientsPage from './pages/PatientsPage';
import DoctorsPage from './pages/DoctorsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import BillingsPage from './pages/BillingsPage';
import RoomsPage from './pages/RoomsPage';
import EquipmentPage from './pages/EquipmentPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Box sx={{ flexGrow: 1, p: 3 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/patients" element={<PatientsPage />} />
              <Route path="/doctors" element={<DoctorsPage />} />
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/billings" element={<BillingsPage />} />
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/equipment" element={<EquipmentPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;

