import React from 'react';
import { Chip } from '@mui/material';

const StatusBadge = ({ status, size = 'medium' }) => {
  const getColor = () => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'never submitted':
        return 'default';
      case 'active':
        return 'success';
      case 'expired':
        return 'error';
      case 'used':
        return 'info';
      case 'not uploaded':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    //badge
    <Chip
      label={status}
      color={getColor()}
      size={size}
      variant="filled"
      sx={{ fontWeight: 500 }}
    />
  );
};

export default StatusBadge;