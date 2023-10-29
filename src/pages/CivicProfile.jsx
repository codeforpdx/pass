import { Container, MenuList, MenuItem } from '@mui/material';
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { CIVIC_FORM_LIST } from '@components/CivicProfileForms';

const CivicProfile = () => {
  const location = useLocation();

  localStorage.setItem('restorePath', location.pathname);
  const currentForm = location.pathname.split('/').pop();

  return (
    <Container sx={{ display: 'flex' }}>
      <Container sx={{ width: '25%' }}>
        <nav>
          <MenuList>
            {CIVIC_FORM_LIST.map((form) => (
              <Link to={form.path} style={{ textDecoration: 'none' }} key={form.path}>
                <MenuItem divider selected={currentForm === form.path}>
                  {form.label}
                </MenuItem>
              </Link>
            ))}
          </MenuList>
        </nav>
      </Container>
      <Container>
        <Outlet />
      </Container>
    </Container>
  );
};

export default CivicProfile;