import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PatientsPage from './pages/PatientsPage';
import DoctorsPage from './pages/DoctorsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import BillingsPage from './pages/BillingsPage';
import RoomsPage from './pages/RoomsPage';
import EquipmentPage from './pages/EquipmentPage';
import MedicalRecordsPage from './pages/MedicalRecordsPage';
import MedicalConditionsPage from './pages/MedicalConditionsPage';
import InsurancesPage from './pages/InsurancesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

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

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
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
                          <Route path="/medical-records" element={<MedicalRecordsPage />} />
                          <Route path="/medical-conditions" element={<MedicalConditionsPage />} />
                          <Route path="/insurances" element={<InsurancesPage />} />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </Box>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;

