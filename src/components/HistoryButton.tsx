import React, { memo } from 'react';
import { BsClockHistory } from 'react-icons/bs';
import { AppStatus } from '../utils/constants';

interface HistoryButtonProps {
  handleHistoryOpen: () => void;
  status: AppStatus
}

const HistoryButtonComponent: React.FC<HistoryButtonProps> = ({ handleHistoryOpen, status }) => {
  console.log('HistoryButton rendered - status:', status);

  return (
    <button
      onClick={handleHistoryOpen}
      className="app-button"
      aria-label="Show capture history"
      disabled={status !== 'ready'}
    >
      <BsClockHistory size={24} />
    </button>
  );
};

// Custom equality function - only re-render when relevant props change
const areEqual = (prevProps: HistoryButtonProps, nextProps: HistoryButtonProps) => {
  return (
    prevProps.status === nextProps.status &&
    prevProps.handleHistoryOpen === nextProps.handleHistoryOpen
  );
};

export const HistoryButton = memo(HistoryButtonComponent, areEqual);
