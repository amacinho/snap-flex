import React from 'react';

interface CapturePreviewProps {
  image: string;
  angle: number;
  onSave: () => void;
  onDiscard: () => void;
}

const CapturePreview: React.FC<CapturePreviewProps> = ({ 
  image, 
  angle, 
  onSave, 
  onDiscard 
}) => {
  return (
    <div className="capture-preview">
      <img src={image} alt="Capture preview" />
      <p>Max Angle: {Math.round(angle)}°</p>
      <div className="capture-actions">
        <button onClick={onSave}>
          Save Capture
        </button>
        <button onClick={onDiscard}>
          Discard
        </button>
      </div>
    </div>
  );
};

export default CapturePreview;
