// React Imports
import React, { useState, useContext } from 'react';
// Material UI Imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ClearIcon from '@mui/icons-material/Clear';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
// Context Imports
import { DocumentListContext } from '@contexts';
// Component Imports
import { DocumentSelection, FormSection } from '../Form';
import UploadButtonGroup from './UploadButtonGroup';
import useNotification from '../../hooks/useNotification';
import ConfirmationModal from './ConfirmationModal';

// Display text for confirmation modal variants
const confirmationModalContentVariant = {
  replace: {
    title: 'Replace Document?',
    text: 'A file of this name and type already exists on the pod. Would you like to replace it?',
    confirmButtonText: 'Replace'
  },
  add: {
    title: 'Upload Document?',
    text: 'Are you sure you want to upload this document?',
    confirmButtonText: 'Upload'
  }
};

/**
 * UploadDocumentModal Component - Component that generates the form for uploading
 * a specific document type to a user's Solid Pod via Solid Session
 *
 * @memberof Modals
 * @name UploadDocumentModal
 * @param {object} Props - Props for UploadDocumentModal component
 * @param {boolean} Props.showModal - Boolean for showing upload documents modal
 * @param {React.Dispatch<React.SetStateAction<boolean>>} Props.setShowModal
 * - React set function for setting showModal state
 * @returns {React.JSX.Element} The UploadDocumentModal Component
 */
const UploadDocumentModal = ({ showModal, setShowModal }) => {
  const { addNotification } = useNotification();
  const [expireDate, setExpireDate] = useState(null);
  const [docDescription, setDocDescription] = useState('');
  const [docType, setDocType] = useState('');
  const [verifyFile, setVerifyFile] = useState(false);
  const [file, setFile] = useState(null);
  const [inputKey, setInputKey] = useState(false);
  const { addDocument, replaceDocument } = useContext(DocumentListContext);
  const [processing, setProcessing] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationModalType, setConfirmationModalType] = useState('add');

  const handleDocType = (event) => {
    setDocType(event.target.value);
  };

  const clearInputFields = () => {
    setVerifyFile(false);
    setDocType('');
    setFile('');
    setInputKey(!inputKey); // Clears file by forcing re-render
    setDocDescription('');
    setDocType('');
    setExpireDate(null);
    setShowModal(false);
  };

  const cleanup = () => {
    setShowConfirmationModal(false);
    setConfirmationModalType('add');
    setProcessing(false);
    clearInputFields();
  };

  const handleDocUpload = async (uploadType) => {
    const fileDesc = {
      name: file.name,
      type: docType,
      date: expireDate,
      description: docDescription
    };

    switch (uploadType) {
      case 'add':
        try {
          await addDocument(fileDesc, file);
          addNotification('success', `File uploaded to Solid.`);
          cleanup();
        } catch (error) {
          switch (error.message) {
            case 'File already exists':
              // The confirmation modal will prompt the user to replace the file or not
              setConfirmationModalType('replace');
              setShowConfirmationModal(true);
              break;
            default:
              addNotification('error', `File failed to upload. Reason: ${error.message}`);
          }
        }
        break;
      case 'replace':
        try {
          await replaceDocument(fileDesc, file);
          addNotification('success', `File updated on Solid.`);
          cleanup();
        } catch (error) {
          addNotification('error', `File failed to upload. Reason: ${error.message}`);
        }
        break;
      default:
        throw new Error('handleDocUpload: Invalid uploadType');
    }
  };

  const handleUploadCancelled = () => {
    setShowConfirmationModal(false);
    setConfirmationModalType('add');
    setProcessing(false);
  };

  // Event handler for form/document submission to Pod
  const onFormSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    handleDocUpload('add');
  };

  return (
    <Dialog open={showModal} aria-labelledby="upload-document-dialog" onClose={clearInputFields}>
      <ConfirmationModal
        {...confirmationModalContentVariant[confirmationModalType]}
        onConfirm={() => handleDocUpload(confirmationModalType)}
        onCancel={handleUploadCancelled}
        setShowModal={setShowConfirmationModal}
        showModal={showConfirmationModal}
      />
      <FormSection title="Upload Document">
        <form
          onSubmit={onFormSubmit}
          autoComplete="off"
          style={{ width: isSmallScreen ? '100%' : '100%' }}
        >
          <FormControlLabel
            control={<Switch />}
            label="Verify file on upload"
            id="verify-checkbox"
            value={verifyFile}
            checked={verifyFile}
            onChange={() => setVerifyFile(!verifyFile)}
            sx={{ mb: 1 }}
          />
          <FormControl fullWidth>
            <DocumentSelection
              htmlForAndIdProp="upload-doc"
              handleDocType={handleDocType}
              docType={docType}
            />
            <br />
            <FormControl>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  name="date"
                  format="MM/DD/YYYY"
                  label="Expiration Date"
                  value={expireDate}
                  onChange={(newExpireDate) => setExpireDate(newExpireDate)}
                  type="date"
                />
              </LocalizationProvider>
            </FormControl>
            <br />
            <TextField
              name="description"
              multiline
              rows={4}
              label="Enter Description"
              value={docDescription}
              onChange={(newDocDescription) => setDocDescription(newDocDescription.target.value)}
              placeholder="Add a description here"
            />
            <br />
            <UploadButtonGroup file={file} setFile={setFile} />
            <FormHelperText
              sx={{
                width: '200px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              File to upload: {file ? file.name : 'No file selected'}
            </FormHelperText>

            <DialogActions sx={{ width: '100%' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: isSmallScreen ? 'column' : 'row',
                  gap: isSmallScreen ? '10px' : '8px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%'
                }}
              >
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<ClearIcon />}
                  onClick={clearInputFields}
                  fullWidth
                  sx={{ borderRadius: '20px' }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  disabled={processing || !file}
                  type="submit"
                  color="primary"
                  startIcon={<FileUploadIcon />}
                  fullWidth
                  sx={{ borderRadius: '20px' }}
                >
                  Upload
                </Button>
              </Box>
            </DialogActions>
          </FormControl>
        </form>
      </FormSection>
    </Dialog>
  );
};

export default UploadDocumentModal;
