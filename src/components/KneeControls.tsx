import React, { memo } from 'react';
import { KNEE, KneeSide } from '../utils/constants';

interface KneeControlsProps {
  autoKneeSelection: boolean;
  currentKnee: KneeSide;
  handleAutoKneeSelectionChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleKneeChange: (selection: KneeSide) => void;
}

const KneeControlsComponent: React.FC<KneeControlsProps> = ({
  autoKneeSelection,
  currentKnee,
  handleAutoKneeSelectionChange,
  handleKneeChange
}) => {
  return (
      <div className="knee-selection-container">
        <div className="auto-knee-selection">
          <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="checkbox"
              checked={autoKneeSelection}
              onChange={handleAutoKneeSelectionChange}
              style={{ cursor: 'pointer', width: '16px', height: '32px', zIndex: 100, position: 'relative' }}
            />
            Auto
          </label>
        </div>
      
        <div className="knee-selection-compact">
          <div className="toggle-group">
            <button 
              className={currentKnee === KNEE.LEFT ? 'active' : ''}
              onClick={() => handleKneeChange(KNEE.LEFT)}
              disabled={autoKneeSelection}
              style={{ 
                minWidth: '48px',
                minHeight: '48px',
                zIndex: 105,
                opacity: autoKneeSelection ? 0.5 : 1 
              }}
            >
              L
            </button>
            
            <button 
              className={currentKnee === KNEE.RIGHT ? 'active' : ''}
              onClick={() => handleKneeChange(KNEE.RIGHT)}
              disabled={autoKneeSelection}
              style={{ 
                minWidth: '48px',
                zIndex: 105,
                minHeight: '48px',
                opacity: autoKneeSelection ? 0.5 : 1 
              }}
            >
              R
            </button>
          </div>
        </div>
      </div>
  );
};

// Custom equality function - only re-render when relevant props change
const areEqual = (prevProps: KneeControlsProps, nextProps: KneeControlsProps) => {
  return (
    prevProps.autoKneeSelection === nextProps.autoKneeSelection &&
    prevProps.currentKnee === nextProps.currentKnee &&
    prevProps.handleAutoKneeSelectionChange === nextProps.handleAutoKneeSelectionChange &&
    prevProps.handleKneeChange === nextProps.handleKneeChange
  );
};

export const KneeControls = memo(KneeControlsComponent, areEqual);
