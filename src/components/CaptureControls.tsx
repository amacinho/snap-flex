import React, { memo } from 'react';
import { BsRecordCircleFill } from 'react-icons/bs';
import { AppStatus } from '../utils/constants';

interface CaptureButtonProps {
    handleCapture: () => void;
    handleSaveBest: () => void;
    handleCancel: () => void;
    status: AppStatus;
}

const CaptureControlsComponent: React.FC<CaptureButtonProps> = ({
  handleCapture,
  handleSaveBest,
  handleCancel,
  status
}) => {
  console.log('CaptureControls rendered - status:', status);
  console.log('Observing status:', status)
  switch (status) {
    case 'ready':
      return (
            <button 
              id="capture-button"
              onClick={() => {
                handleCapture();
              }}
              className="app-button app-button--primary"
            >
              <BsRecordCircleFill size={32} />
            </button>
      )
    case 'capturing':
      return (
        <div>
        <div id="save-cancel-buttons">
          <button 
            onClick={() => {
                  handleSaveBest();
            }} 
            className="app-button"
          >
            Save Best
          </button>
          <button 
            onClick={() => {
                  handleCancel();
            }} 
            className="app-button"
          >
            Cancel
          </button>
        </div>
        </div>
      );
    default:
      console.error('Invalid status:', status);
      return null;
  }
};

// Custom equality function for memoization - only re-render when status changes
const areEqual = (prevProps: CaptureButtonProps, nextProps: CaptureButtonProps) => {
  // Compare only the props that should trigger re-renders
  return (
    prevProps.status === nextProps.status &&
    prevProps.handleCapture === nextProps.handleCapture &&
    prevProps.handleSaveBest === nextProps.handleSaveBest &&
    prevProps.handleCancel === nextProps.handleCancel
  );
};

export const CaptureControls = memo(CaptureControlsComponent, areEqual);
