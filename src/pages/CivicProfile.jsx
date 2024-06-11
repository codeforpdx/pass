// React Imports
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
// Material UI Imports
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/system';
// Component Imports
import { CIVIC_FORM_LIST } from '@components/CivicProfileForms';

/**
 * CivicProfile - Component that generates the Civic Profile for PASS
 *
 * @memberof Pages
 * @name CivicProfile
 * @returns {React.ReactNode} The Civic Profile
 */
const CivicProfile = () => {
  const location = useLocation();

  localStorage.setItem('restorePath', location.pathname);
  const currentForm = location.pathname.split('/').pop();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Container>
      <Box>
        <nav>
          <Tabs
            value={currentForm}
            orientation={isSmallScreen ? 'vertical' : 'horizontal'}
            aria-label="civic profile tabs"
          >
            {CIVIC_FORM_LIST.map((form) => (
              <Tab
                key={form.path}
                component={Link}
                to={form.path}
                label={form.label}
                value={form.path}
                disabled={form.label === 'Financial Information'}
              />
            ))}
          </Tabs>
        </nav>
      </Box>
      <Container>
        <Outlet />
      </Container>
    </Container>
  );
};

export default CivicProfile;
