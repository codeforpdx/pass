// React Imports
import React from 'react';
// Custom Hook Imports
import { useSession } from '@hooks';
// Material UI Imports
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import IconButton from '@mui/material/IconButton';
import ShareIcon from '@mui/icons-material/Share';
// Utility Imports
import { getBlobFromSolid } from '@utils';
// Component Imports
import { StyledTableCell, StyledTableRow } from '../Table/TableStyles';
// Constants Imports
import DOC_TYPES from '../../constants/doc_types';

/**
 * @typedef {import("../../typedefs.js").documentTableRowProps} documentTableRowProps
 */

/**
 * DocumentTableRow Component - A row in the Document Table
 *
 * @memberof Documents
 * @name DocumentTableRow
 * @param {documentTableRowProps} Props - Props for DocumentTableRow
 * @returns {React.JSX.Element} The DocumentTableRow component
 */
const DocumentTableRow = ({ document, handleAclPermissionsModal, handleSelectDeleteDoc }) => {
  const { session } = useSession();

  const { name, type, description, fileUrl, uploadDate, endDate } = document;

  const handleShowDocumentLocal = async (urlToOpen) => {
    const urlFileBlob = await getBlobFromSolid(session, urlToOpen);
    window.open(urlFileBlob);
  };

  return (
    <StyledTableRow>
      <StyledTableCell align="center">{name}</StyledTableCell>
      <StyledTableCell align="center">{DOC_TYPES[type]}</StyledTableCell>
      <StyledTableCell align="center">{description}</StyledTableCell>
      <StyledTableCell align="center">
        {uploadDate ? uploadDate.toDateString() : ''}
      </StyledTableCell>
      <StyledTableCell align="center">{endDate ? endDate.toDateString() : 'N/A'}</StyledTableCell>
      <StyledTableCell align="center">
        <IconButton type="button" onClick={() => handleShowDocumentLocal(fileUrl)}>
          <FileOpenIcon />
        </IconButton>
      </StyledTableCell>
      <StyledTableCell align="center">
        <IconButton type="button" onClick={() => handleAclPermissionsModal('document', name, type)}>
          <ShareIcon />
        </IconButton>
      </StyledTableCell>
      <StyledTableCell align="center">
        <IconButton size="large" edge="end" onClick={() => handleSelectDeleteDoc(document)}>
          <DeleteOutlineOutlinedIcon />
        </IconButton>
      </StyledTableCell>
    </StyledTableRow>
  );
};

export default DocumentTableRow;
