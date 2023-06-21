// React Imports
import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
// Material UI Imports
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Remove from '@mui/icons-material/Remove';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
// Component Imports
import {
  UploadDocumentForm,
  SetAclPermissionForm,
  SetAclPermsDocContainerForm
} from '../components/Form';
import { SelectedUserContext, SignedInUserContext } from '../contexts';
import DocumentTable from '../components/Documents/DocumentTable';

/**
 * Documents Page - Component that generates Documents Page for PASS
 *
 * @memberof Pages
 * @name Documents
 * @returns {React.JSX.Element} The Documents Page
 */
const Documents = () => {
  const location = useLocation();

  localStorage.setItem('restorePath', location.pathname);

  const { selectedUser, setSelectedUser } = useContext(SelectedUserContext);
  const { podUrl } = useContext(SignedInUserContext);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '30px'
      }}
    >
      <Button
        variant="contained"
        color="secondary"
        size="small"
        aria-label="Clear Client Button"
        startIcon={<Remove />}
        onClick={() => setSelectedUser()}
        sx={{ margin: '1rem 0' }}
      >
        Clear Client
      </Button>
      {podUrl === selectedUser.podUrl ? (
        <Typography>Personal Pod</Typography>
      ) : (
        <Typography>Client selected: {selectedUser.person || selectedUser.podUrl}</Typography>
      )}

      <UploadDocumentForm />
      <Container>
        <DocumentTable />
      </Container>
      <SetAclPermsDocContainerForm />
      <SetAclPermissionForm />
    </Box>
  );
};

export default Documents;