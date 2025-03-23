import { useState, useEffect } from 'react';
import { TensorFlowStatus } from '../utils/constants';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { initTensorFlow, getDetector, disposeDetector as disposeTF } from '../utils/tensorFlow';

const useTensorFlow = () => {
  const [status, setStatus] = useState<TensorFlowStatus>('initializing');
  const [error, setError] = useState<string | null>(null);
  const [currentBackend, setCurrentBackend] = useState<string | null>(null);

  // Initialize TensorFlow
  const initializeTensorFlow = async (): Promise<void> => {
    try {
      setStatus('initializing');
      setError(null);
      
      await initTensorFlow();
      
      // Set the current backend for informational purposes
      setCurrentBackend(tf.getBackend() || null);
      setStatus('ready');
    } catch (err) {
      console.error('TensorFlow initialization error in hook:', err);
      setError('Failed to initialize TensorFlow: ' + 
        (err instanceof Error ? err.message : 'Unknown error'));
      setStatus('error');
    }
  };

  // Cleanup function
  const disposeDetector = () => {
    disposeTF();
  };

  // Effect to initialize TensorFlow when the hook is first used
  useEffect(() => {
    // Auto-initialize TensorFlow
    initializeTensorFlow();
    
    // Cleanup when component unmounts
    return () => {
      disposeDetector();
    };
  }, []);

  return {
    detector: getDetector(),
    status,
    error,
    initializeTensorFlow,
    disposeDetector
  };
};

export default useTensorFlow;
