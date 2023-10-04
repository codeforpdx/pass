// React Imports
import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Inrupt Imports
import { getWebIdDataset } from '@inrupt/solid-client';
// Material UI Imports
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

// Context Imports
import { DocumentListContext } from '@contexts';

// MUI Theme
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme';

// Custom Hook Imports
import useNotification from '../../hooks/useNotification';

/**
 * contactListTableRowProps is an object that stores the props for the
 * ContactListTableRow component
 *
 * @typedef {object} contactListTableRowProps
 * @property {object} contact - Object containing contact information
 * @property {Function} deleteContact
 * - function to delete a chosen contact
 */

/**
 * ContactListTableRow Component - Component that generates the individual table
 * rows of contacts from data within ContactList
 *
 * @memberof Contacts
 * @name ContactListTableRow
 * @param {contactListTableRowProps} Props - Props for ContactListTableRow
 * @returns {React.JSX.Element} The ContactListTableRow Component
 */
const ContactListTableRow = ({ contact, deleteContact }) => {
  const [pinned, setPinned] = useState(false);
  const { setContact } = useContext(DocumentListContext);
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  // determine what icon gets rendered in the pinned column
  const pinnedIcon = pinned ? <PushPinIcon color="secondary" /> : <PushPinOutlinedIcon />;

  // Event handler for pinning contact to top of table
  // ***** TODO: Add in moving pinned row to top of table
  const handlePinClick = () => {
    setPinned(!pinned);
  };

  // Event handler for profile page routing
  const handleSelectProfile = async (contactInfo) => {
    try {
      await getWebIdDataset(contactInfo.webId);
      setContact(contact);
    } catch {
      setContact(null);
      navigate('/contacts');
      addNotification('error', 'WebId does not exist');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <TableRow>
        <TableCell align="center">
          <Link
            to={`/profile/${encodeURIComponent(contact.webId)}`}
            state={{ contact }}
            style={{ textDecoration: 'none', color: theme.palette.primary.dark }}
          >
            <Button
              sx={{ textTransform: 'capitalize' }}
              onClick={() => handleSelectProfile(contact)}
            >
              {contact.person}
            </Button>
          </Link>
        </TableCell>
        <TableCell
          align="center"
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <IconButton size="large" onClick={handlePinClick}>
            {pinnedIcon}
          </IconButton>
        </TableCell>
        <TableCell align="center">
          <IconButton size="large" onClick={() => deleteContact(contact)}>
            <DeleteOutlineOutlinedIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    </ThemeProvider>
  );
};

export default ContactListTableRow;
