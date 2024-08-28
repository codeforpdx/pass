// React Imports
import React, { useState } from 'react'; // Used to keep track of card menu state
// Material UI Imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import ShareIcon from '@mui/icons-material/Share';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
// Utility Imports
import { truncateText, getTypeText } from '@utils';

/**
 * @typedef {object} Document
 * @property {string} id - The unique id of the document
 * @property {string} name - The given name of the document
 * @property {string} type - The given type of the document
 * @property {string} description - The given description of the document
 * @property {string} uploadDate- The upload date of the document
 * @property {string} endDate - The expiration date of the document
 * @property {string} fileUrl - The file URL of the document
 */

/**
 * DocumentCard - A component that displays a single document's information
 * and provides actions (preview, share, delete) through a context menu.
 *
 * @memberof Documents
 * @name DocumentCard
 * @param {object} props - Component props
 * @param {Document} props.document - The document object to be displayed
 * @param {Function} props.onPreview - Function to handle the "Preview" action
 * @param {Function} props.onShare - Function to handle the "Share" action
 * @param {Function} props.onDelete - Function to handle the "Delete" action
 * @returns {React.JSX.Element} The DocumentCard component
 */
const DocumentCard = ({ document, onShare, onDelete, onPreview }) => {
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

  // Opens the context menu
  const handleClick = (event, clickedDocument) => {
    setAnchorEl(event.currentTarget);
    setOpenMenu(clickedDocument.id);
  };

  // Closes the context menu
  const handleClose = () => {
    setAnchorEl(null);
    setOpenMenu(null);
  };

  // Handles the click on a context menu item, executing the corresponding action
  const handleMenuItemClick = (action, clickedDocument) => () => {
    action(clickedDocument);
    handleClose();
  };

  // ... (Styling definitions below)

  const rowStyling = {
    display: 'flex',
    columnGap: '10px'
  };

  const columnStyling = {
    display: 'flex',
    flexDirection: 'column'
  };

  const dataStyling = {
    ...rowStyling,
    color: 'text.secondary',
    fontSize: '.875rem',
    justifyContent: 'flex-start'
  };

  const dataSectionStyling = {
    ...columnStyling,
    '& div': {
      ...dataStyling
    }
  };

  const dataColumnStyling = {
    ...columnStyling,
    flex: '1 1 90%',
    rowGap: '5px',
    '& div': {
      ...dataSectionStyling
    }
  };

  const actionsColumnStyling = {
    ...columnStyling,
    flex: '0 1 10%',
    maxWidth: '54px',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginRight: '-10px'
  };

  const cardStyling = {
    ...rowStyling,
    justifyContent: 'space-between'
  };

  // icon styles
  const iconSize = {
    height: '24px',
    width: '24px'
  };

  const iconStyling = {
    width: '100%'
  };

  return (
    <Box>
      <Card sx={{ my: '5px', position: 'relative' }}>
        <CardContent sx={cardStyling}>
          <Box sx={dataColumnStyling}>
            <Box>
              <Typography
                sx={{
                  color: `${theme.palette.primary.text} !important`,
                  fontSize: '1rem !important'
                }}
                variant="body1"
                component="div"
                noWrap
              >
                {document.name || '[No Name provided]'}
              </Typography>
              <Typography
                sx={{ fontWeight: 'bold', fontVariantCaps: 'small-caps' }}
                variant="body1"
                component="div"
                noWrap
              >
                {document.type ? getTypeText(document.type) : 'Unknown Type'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body1" component="div" noWrap>
                {document.uploadDate
                  ? `Uploaded: ${document.uploadDate.toLocaleDateString()}`
                  : 'Upload Date Unset'}
              </Typography>
              <Typography variant="body1" component="div" noWrap>
                {document.endDate
                  ? `Expires: ${document.endDate.toLocaleDateString()}`
                  : 'No expiration given'}
              </Typography>
            </Box>
            {document.description && (
              <Box>
                <Typography
                  sx={{ fontSize: '0.8rem !important', fontStyle: 'italic' }}
                  variant="body1"
                  component="div"
                >
                  {truncateText(document.description, 140)}
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={actionsColumnStyling}>
            <IconButton
              id="actions-icon-button"
              aria-controls={openMenu === document.id ? 'actions-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={openMenu === document.id ? 'true' : undefined}
              onClick={(event) => handleClick(event, document)}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>
        </CardContent>
        <Menu
          id="actions-menu"
          anchorEl={anchorEl}
          open={openMenu === document.id}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'actions-icon-button'
          }}
        >
          <MenuItem
            component={Button}
            onClick={handleMenuItemClick(onPreview, document)}
            startIcon={<FileOpenIcon sx={iconSize} />}
            sx={iconStyling}
          >
            Preview
          </MenuItem>
          <MenuItem
            component={Button}
            onClick={handleMenuItemClick(onShare, document)}
            startIcon={<ShareIcon sx={iconSize} />}
            sx={iconStyling}
          >
            Share
          </MenuItem>
          <MenuItem
            component={Button}
            onClick={handleMenuItemClick(onDelete, document)}
            startIcon={<DeleteOutlineOutlinedIcon sx={iconSize} />}
            sx={iconStyling}
          >
            Delete
          </MenuItem>
        </Menu>
      </Card>
    </Box>
  );
};

export default DocumentCard;