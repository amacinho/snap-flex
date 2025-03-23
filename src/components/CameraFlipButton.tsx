import React, { memo } from 'react';
import { BsPhoneFlip } from "react-icons/bs";
import { AppStatus } from '../utils/constants';

interface CameraFlipButtonProps {
  cameraFacingMode: 'user' | 'environment';
  handleFlip: () => void;
  status: AppStatus
}

const CameraFlipButtonComponent: React.FC<CameraFlipButtonProps> = ({ cameraFacingMode, handleFlip, status }) => {
  return (
    <button 
      onClick={handleFlip}
      className="app-button"
      title={`Switch to ${cameraFacingMode === 'user' ? 'Back' : 'Front'} Camera`}
      disabled={status !== 'ready'}
    >
      <BsPhoneFlip size={24} />
      
    </button>
  );
};

// Custom equality function - only re-render when relevant props change
const areEqual = (prevProps: CameraFlipButtonProps, nextProps: CameraFlipButtonProps) => {
  return (
    prevProps.cameraFacingMode === nextProps.cameraFacingMode &&
    prevProps.status === nextProps.status &&
    prevProps.handleFlip === nextProps.handleFlip
  );
};

export const CameraFlipButton = memo(CameraFlipButtonComponent, areEqual);
