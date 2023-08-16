import React, { useRef, useEffect } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import useNotification from '@hooks/useNotification';

const BasicNotification = ({ severity, message, id, 'data-testid': dataTestId }) => {
  const { remove } = useNotification();

  const timerID = useRef(null);

  const handleDismiss = () => {
    remove(id);
  };

  useEffect(() => {
    timerID.current = setTimeout(() => {
      handleDismiss();
    }, 8000);

    return () => {
      clearTimeout(timerID.current);
    };
  }, []);

  return (
    <Snackbar open={message} id={id} data-testid={dataTestId}>
      <Alert severity={severity} variant="filled" elevation={6} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default BasicNotification;