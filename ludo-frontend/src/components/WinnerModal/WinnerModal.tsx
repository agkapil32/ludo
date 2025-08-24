import React from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Button } from '@mui/material';

interface WinnerModalProps {
  winners: string[];
  open: boolean;
}

const WinnerModal: React.FC<WinnerModalProps> = ({ winners, open }) => {
  return (
    <Dialog open={open}>
      <DialogTitle>Game Over</DialogTitle>
      <DialogContent>
        <Typography variant="h6" gutterBottom>
          {winners.length > 0
            ? `Winner${winners.length > 1 ? 's' : ''}: ${winners.join(', ')}`
            : 'No winner'}
        </Typography>
        <Button variant="contained" color="primary" onClick={() => window.location.reload()}>
          Play Again
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default WinnerModal;

