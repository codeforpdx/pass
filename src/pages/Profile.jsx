// React Imports
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
// Custom Hook Imports
import { useSession } from '@hooks';
// Material UI Imports
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
// Model Imports
import { fetchProfileInfo } from '../model-helpers';
// Component Inputs
import { SetAclPermissionForm, SetAclPermsDocContainerForm } from '../components/Form';
import { UploadDocumentModal } from '../components/Modals';
import { DocumentTable } from '../components/Documents';
import { ProfileComponent } from '../components/Profile';
import { LoadingAnimation } from '../components/Notification';

/**
 * @typedef {import("../typedefs.js").profilePageProps} profilePageProps
 */

/**
 * Profile Page - Page that displays the user's profile card information and
 * allow users to edit/update them on PASS
 *
 * @memberof Pages
 * @name Profile
 * @param {profilePageProps} Props - Props for Profile Page
 * @returns {React.JSX.Element} The Profile Page
 */
const Profile = ({ user }) => {
  const location = useLocation();
  const client = location.state?.client;
  const [clientProfile, setClientProfile] = useState(null);
  const { session } = useSession();
  const [showModal, setShowModal] = useState(false);
  const webIdUrl = user === 'personal' ? session.info.webId : client?.webId;
  const [loadingProfile, setLoadingProfile] = useState(true);

  localStorage.setItem('restorePath', user === 'personal' ? '/profile' : '/clients');

  useEffect(() => {
    const fetchClientProfile = async () => {
      const profileData = await fetchProfileInfo(session, client.webId);
      setClientProfile({ ...client, ...profileData.profileInfo });
    };

    if (client) fetchClientProfile();
  }, [client]);

  useEffect(() => {
    setTimeout(() => {
      setLoadingProfile(false);
    }, 1000);
  }, []);

  if (loadingProfile) {
    return (
      <LoadingAnimation loadingItem="Profile">
        <CircularProgress />
      </LoadingAnimation>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        padding: '30px'
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <Typography sx={{ fontWeight: 'bold', fontSize: '18px' }}>Profile Information</Typography>
        <Typography>
          User WebId:{' '}
          <Link to={webIdUrl} target="_blank" rel="noreferrer">
            {webIdUrl}
          </Link>
        </Typography>

        <ProfileComponent clientProfile={clientProfile} />

        <Button
          variant="contained"
          color="secondary"
          size="small"
          aria-label="Add Client Button"
          startIcon={<AddIcon />}
          onClick={() => setShowModal(true)}
        >
          Add Document
        </Button>
        <UploadDocumentModal showModal={showModal} setShowModal={setShowModal} />
        <DocumentTable />
        <SetAclPermsDocContainerForm client={client} />
        <SetAclPermissionForm client={client} />
      </Box>
    </Box>
  );
};

export default Profile;