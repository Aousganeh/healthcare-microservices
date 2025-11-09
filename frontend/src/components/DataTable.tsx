import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  format?: (value: any) => string | React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  rows: any[];
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
}

export default function DataTable({ columns, rows, onEdit, onDelete }: DataTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="data table">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                style={{ minWidth: column.minWidth }}
              >
                {column.label}
              </TableCell>
            ))}
            {(onEdit || onDelete) && (
              <TableCell align="right">Actions</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow hover key={row.id}>
              {columns.map((column) => {
                const value = row[column.id];
                return (
                  <TableCell key={column.id}>
                    {column.format ? column.format(value) : value}
                  </TableCell>
                );
              })}
              {(onEdit || onDelete) && (
                <TableCell align="right">
                  {onEdit && (
                    <IconButton
                      size="small"
                      onClick={() => onEdit(row)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                  {onDelete && (
                    <IconButton
                      size="small"
                      onClick={() => onDelete(row)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

