import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

// Import hooks and utilities
import { usePoseDetection } from './hooks/usePoseDetection';

// Import components
import { CameraFlipButton } from './components/CameraFlipButton';
import { HistoryButton } from './components/HistoryButton';
import { PoseRenderer } from './components/PoseRenderer';
import { CaptureControls } from './components/CaptureControls';
import { KneeControls } from './components/KneeControls';
import { AngleDisplay } from './components/AngleDisplay';
import { HistoryPreview } from './components/HistoryPreview';
import useTensorFlow from '../src/hooks/useTensorFlow';
import StartScreen from './components/StartScreen';

// Import constants
import { KneeSide, KNEE, AppStatus, CameraStatus } from './utils/constants';


export const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const App = () => {
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('off');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [currentKnee, setCurrentKnee] = useState<KneeSide>(KNEE.LEFT);
  const [isAutoKneeEnabled, setIsAutoKneeEnabled] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const { detector, status: tensorFlowStatus, error: tensorFlowError } = useTensorFlow();
  
  // Compute derived app status based on current conditions
  const status: AppStatus = useMemo(() => {
    if (isCapturing) return 'capturing';
    if (tensorFlowStatus === 'initializing') return 'initializing';
    if (tensorFlowStatus === 'error') return 'error';
    if (cameraStatus === 'off' && tensorFlowStatus === 'ready') return 'start';
    if (cameraStatus === 'on' && tensorFlowStatus === 'ready') return 'ready';
    return 'initializing';
  }, [tensorFlowStatus, cameraStatus, isCapturing]);
  
  const handleKneeChange = useCallback((selection: KneeSide) => {
    setCurrentKnee(prev => {
      console.log('State update:', prev, '->', selection);
      return selection;
    });
  }, [currentKnee]);

  const kneeMetrics = usePoseDetection(
    videoRef,
    detector,
    status,
    currentKnee,
    isAutoKneeEnabled,
    handleKneeChange
  );

  useEffect(() => {
    if (!stream) {
      console.log('No stream');
      return;
    }
    if (!videoRef.current) {
      console.log('No video ref');
      return;
    }
    // Set the stream as the video source
    videoRef.current.srcObject = stream;

    // Define the onloadedmetadata handler
    const handleVideoMetadata = () => {
      if (videoRef.current) {
        videoRef.current.play().catch(e => {
          console.error('Error playing video:', e);
          setError('Error playing video');
        });
      }
    };

    // Add the event listener
    videoRef.current.addEventListener('loadedmetadata', handleVideoMetadata);

    // Clean up function
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('loadedmetadata', handleVideoMetadata);
      }
    };

  }, [stream]);

  const updateCameraStream = async (facingMode: 'user' | 'environment') => {
    console.log('Starting camera wıth facing mode:', facingMode);
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: facingMode
      },
      audio: false
    });
    setStream(stream);
  };

  // Camera handlers
  const handleStartClick = async (facingMode: 'user' | 'environment') => {
    try {
      await updateCameraStream(facingMode);
      setCameraOn();
    } catch (err) {
      setError('Failed to access camera. Please check permissions.');
    }
  };

  const setCameraOn = () => {
    console.log('Setting camera from', cameraStatus, 'to on');
    setCameraStatus('on');
  };

  // Button handlers
  const hasEnvironmentCamera = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some(device => 
      device.kind === 'videoinput' && 
      device.label.toLowerCase().includes('back')
    );
  };

  const handleFlip = useCallback(async () => {
    const newMode = cameraFacingMode === 'user' ? 'environment' : 'user';
    console.log('Attempting to flip camera from', cameraFacingMode, 'to', newMode);

    try {
      // Only attempt environment mode if supported
      if (newMode === 'environment') {
        const hasBackCamera = await hasEnvironmentCamera();
        if (!hasBackCamera) {
          console.log('Back camera not available, staying in user mode');
          return;
        }
      }

      // Stop current stream if exists
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        console.log('Stopping current camera tracks');
        tracks.forEach(track => track.stop());
      }

      // Update stream first
      await updateCameraStream(newMode);
      
      // Only update state after successful stream change
      console.log('Camera flip successful, updating state');
      setCameraFacingMode(newMode);
    } catch (error) {
      console.error('Camera flip failed:', error);
      
      // Clean up any partial stream
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setCameraFacingMode(cameraFacingMode);
    }
  }, [cameraFacingMode]);

  const handleHistoryOpen = useCallback(() => {
    console.log('History button clicked');
    setShowHistory(true);

  }, []); 


  const handleCapture = useCallback(() => {
    console.log('Capture button clicked');
    // Use setTimeout to move the state update to the next event loop
    // This prevents it from being blocked by any ongoing TensorFlow operations
    setTimeout(() => {
      setIsCapturing(true);
    }, 0);
  }, []);

  const handleSaveBest = useCallback(() => {
    console.log('Save best clicked');
    setIsCapturing(false);
  }, []);

  const handleCancel = useCallback(() => {
    console.log('Cancel clicked');
    setIsCapturing(false);
  }, []);


  const handleAutoKneeSelectionChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const isAuto = event.target.checked;
    console.log('Auto knee selection changed to:', isAuto);
    setIsAutoKneeEnabled(isAuto);
  }, []);

  return (
    <div id="app">
      {(status === 'start' || status === 'initializing') && (
        <StartScreen
          onStart={() => handleStartClick(cameraFacingMode)}
          status={status}
          tensorFlowStatus={tensorFlowStatus}
        />
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {showHistory && (
        <HistoryPreview onClose={() => setShowHistory(false)} />
      )}

      
        <div className={`camera-view ${(status === 'ready' || status === 'capturing') ? 'visible' : 'hidden'} ${cameraFacingMode === 'user' ? 'front-facing' : ''}`} >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="video-source"
              style={{ transform: cameraFacingMode === 'user' ? 'scaleX(-1)' : 'none' }}
            />

          {(status === 'ready' || status === 'capturing') && (
            <>
            {/* Wrap components that need knee metrics in KneeMetricsProvider */}
            
              <PoseRenderer 
                videoRef={videoRef}
                kneeMetrics={kneeMetrics}
                isFrontFacing={cameraFacingMode === 'user'}
              />

              <div className='top-right-corner'>
                <AngleDisplay 
                currentAngle={kneeMetrics.averageAngle} />
                <KneeControls
                  autoKneeSelection={isAutoKneeEnabled}
                  currentKnee={currentKnee}
                  handleAutoKneeSelectionChange={handleAutoKneeSelectionChange}
                  handleKneeChange={handleKneeChange}
                />
              </div>
            
            {/* Components that don't need knee metrics stay outside the provider */}
            <div className="camera-flip-button">
              <CameraFlipButton
                cameraFacingMode={cameraFacingMode}
                handleFlip={handleFlip}
                status={status}
              />
            </div>

            {/* 

            <div className="history-button">
              <HistoryButton
                handleHistoryOpen={handleHistoryOpen}
                status={status}
              />
            </div>

            <div className="capture-controls">
              <CaptureControls
                handleCapture={handleCapture}
                handleSaveBest={handleSaveBest}
                handleCancel={handleCancel}
                status={status}
              />
            </div>
            */}

            </>
          )}
        </div>
      
    </div >
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
