import React, { useEffect, useState } from 'react';
import { AppStatus, TensorFlowStatus } from '../utils/constants';
import screenshot from '../../assets/screenshot.png';
import { detectBrowser, isMobile } from '../utils/browser';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

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
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  
  useEffect(() => {
    console.log('StartScreen mounted');
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event captured');
      e.preventDefault();
      const beforeInstallEvent = e as unknown as BeforeInstallPromptEvent;
      setDeferredPrompt(beforeInstallEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    console.log('beforeinstallprompt event listener added');

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      console.log('beforeinstallprompt event listener removed');
    };
  }, []);

  // Button is enabled when both app is in start state and TensorFlow is ready
  const isButtonEnabled = status === 'start' && tensorFlowStatus === 'ready';
  const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
  
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User ${outcome} the install prompt`);
      setDeferredPrompt(null);
    }
  };
  console.log(`isInstalled: ${isInstalled}; deferredPrompt: ${deferredPrompt}`);

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

        <div className="install-prompt">
          {!isInstalled && (
            <>
              <p>For best experience, install the app.</p>

              {deferredPrompt && (
                <button onClick={handleInstallClick} className="install-button">
                  Install App
                </button>
              )}

              {!deferredPrompt && (
                
                <div className="browser-hint">
                  {isMobile() ? 'Tap' : 'Click'} <span className="icon">☰</span> or Share → Install
                 </div>
              )}

            </>
          )}
        </div>
            
        
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
