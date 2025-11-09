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
import { billingService } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import { getErrorMessage } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import type { Billing } from '../types';
import { PaymentStatus, PaymentMethod, CurrencyCode } from '../types';
import DataTable from '../components/DataTable';
import { format } from 'date-fns';

export default function BillingsPage() {
  const { showError, showSuccess } = useNotification();
  const [billings, setBillings] = useState<Billing[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Billing | null>(null);
  const [formData, setFormData] = useState<Partial<Billing>>({});
    useEffect(() => {
    loadBillings();
  }, []);

  const loadBillings = async () => {
    try {
      setLoading(true);
      const response = await billingService.getAll();
      setBillings(response.data);
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (billing?: Billing) => {
    if (billing) {
      setEditing(billing);
      setFormData({
        ...billing,
        billingDate: billing.billingDate ? billing.billingDate.slice(0, 16) : '',
        dueDate: billing.dueDate ? billing.dueDate.slice(0, 16) : '',
        paidDate: billing.paidDate ? billing.paidDate.slice(0, 16) : '',
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
        await billingService.update(editing.id, formData as Billing);
        showSuccess('await billingService.update(editing.id, formData as Billing); update successfully');
      } else {
        await billingService.create(formData as Billing);
        showSuccess('await billingService.create(formData as Billing); create successfully');
      }
      handleClose();
      loadBillings();
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    }
  };

  const handleDelete = async (billing: Billing) => {
    if (!billing.id || !window.confirm('Are you sure you want to delete this billing?')) {
      return;
    }
    try {
      await billingService.delete(billing.id);
      loadBillings();
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    }
  };

  const columns = [
    { id: 'id', label: 'ID', minWidth: 50 },
    { id: 'patientId', label: 'Patient ID', minWidth: 80 },
    { id: 'invoiceNumber', label: 'Invoice #', minWidth: 120 },
    { id: 'amount', label: 'Amount', minWidth: 100, format: (value: number) => `$${value?.toFixed(2) || '0.00'}` },
    { id: 'totalAmount', label: 'Total', minWidth: 100, format: (value: number) => `$${value?.toFixed(2) || '0.00'}` },
    { id: 'status', label: 'Status', minWidth: 100 },
    { id: 'paymentMethod', label: 'Payment Method', minWidth: 120 },
    {
      id: 'billingDate',
      label: 'Billing Date',
      minWidth: 120,
      format: (value: string) => value ? format(new Date(value), 'yyyy-MM-dd') : '',
    },
  ];

  if (loading && billings.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Billings</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add Billing
        </Button>
      </Box>

      

      <DataTable
        columns={columns}
        rows={billings}
        onEdit={handleOpen}
        onDelete={handleDelete}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Edit Billing' : 'Add Billing'}</DialogTitle>
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
              label="Amount"
              type="number"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              required
              fullWidth
            />
            <TextField
              label="Total Amount"
              type="number"
              value={formData.totalAmount || ''}
              onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) })}
              required
              fullWidth
            />
            <TextField
              label="Billing Date"
              type="datetime-local"
              value={formData.billingDate || ''}
              onChange={(e) => setFormData({ ...formData, billingDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />
            <TextField
              label="Due Date"
              type="datetime-local"
              value={formData.dueDate || ''}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Invoice Number"
              value={formData.invoiceNumber || ''}
              onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
              fullWidth
            />
            <TextField
              label="Status"
              select
              value={formData.status || ''}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as PaymentStatus })}
              fullWidth
            >
              {Object.values(PaymentStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {status.replace('_', ' ')}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Payment Method"
              select
              value={formData.paymentMethod || ''}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
              fullWidth
            >
              {Object.values(PaymentMethod).map((method) => (
                <MenuItem key={method} value={method}>
                  {method.replace('_', ' ')}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Currency"
              select
              value={formData.currency || CurrencyCode.USD}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value as CurrencyCode })}
              fullWidth
            >
              {Object.values(CurrencyCode).map((currency) => (
                <MenuItem key={currency} value={currency}>
                  {currency}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Tax"
              type="number"
              value={formData.tax || ''}
              onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || undefined })}
              fullWidth
            />
            <TextField
              label="Discount"
              type="number"
              value={formData.discount || ''}
              onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || undefined })}
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

