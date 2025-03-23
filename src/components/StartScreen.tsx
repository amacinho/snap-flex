import React from 'react';
import { AppStatus, TensorFlowStatus } from '../utils/constants';
import screenshot from '../../assets/screenshot.png';

// Update the props interface
interface StartScreenProps {
  onStart: () => void;
  status: AppStatus;
  tensorFlowStatus: TensorFlowStatus;
}

function getButtonLabel(status: AppStatus, tensorFlowStatus: TensorFlowStatus): string {
  if (tensorFlowStatus === 'initializing') {
    return 'Initializing...';
  }
  
  switch (status) {
    case 'initializing':
      return 'Initializing...';
    case 'start':
      return 'Start';
    case 'loading':
      return 'Loading...';
    case 'error':
      return 'Error';
    default:
      return 'Start';
  }
}

function StartScreen({ onStart, status, tensorFlowStatus }: StartScreenProps) {
  // Button is enabled when both app is in start state and TensorFlow is ready
  const isButtonEnabled = status === 'start' && tensorFlowStatus === 'ready';
  
  return (
    <div className="start-screen">
      <h1>Snap Flex</h1>

      <img
        src={screenshot}
        alt="App screenshot"
        className="start-screen-image"
      />
      <div className="app-description">
        <h2>Snap-Flex</h2>
        <p>
          Measure your knee flexion angle using automatic pose detection. 
          
          100% private: No videos, images, or data are uploaded. Everything stays on your device.
          
          Uses TensorFlow.js and MoveNet.
          <br />

          <a href="https://github.com/amacinho/snap-flex/">Source code on GitHub</a>.
        </p>
      </div>
      <button
        onClick={onStart}
        className="start-button"
        disabled={!isButtonEnabled}
      >
      {getButtonLabel(status, tensorFlowStatus)}
      </button>
    </div>
  );
}

export default StartScreen;
