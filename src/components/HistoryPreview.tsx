import React from 'react';
import '../styles.css';

interface HistoryPreviewProps {
  onClose: () => void;
}

export const HistoryPreview: React.FC<HistoryPreviewProps> = ({ onClose }) => {
  return (
      <div className="history-preview">
        <div className="history-preview-content">
          <h3>Effort History</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Angle</th>
                <th>Image</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2025-03-10</td>
                <td>45°</td>
                <td>
                  <img src="placeholder.jpg" alt="Effort capture" width="50" />
                </td>
              </tr>
              <tr>
                <td>2025-03-09</td>
                <td>42°</td>
                <td>
                  <img src="placeholder.jpg" alt="Effort capture" width="50" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <button className="history-preview-close-button" onClick={onClose}>
          Close
        </button>
      </div>
  );
};
