import React from 'react';
import { KneeAngleTracker } from './kneeAngleTracker';
import { KneeSide } from './constants';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { KneeMetrics, DualKneeMetrics } from './kneeAngleTracker';

// State variables
let tracker: KneeAngleTracker | null = null;
let isRunning = false;
let currentProcessingPromise: Promise<void> | null = null;
let currentKnee: KneeSide = 'none';

// Initialize the tracker
export const initPoseDetection = (
  minimumConfidence: number, 
  minimumDistanceRatio: number
): KneeAngleTracker => {
  if (!tracker) {
    tracker = new KneeAngleTracker(minimumConfidence, minimumDistanceRatio);
  }
  return tracker;
};

// Process a single frame
export const processFrame = async (
  videoElement: HTMLVideoElement,
  detector: poseDetection.PoseDetector
): Promise<DualKneeMetrics | null> => {
  if (!videoElement || videoElement.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    return null;
  }
  
  if (!tracker) {
    throw new Error('Tracker not initialized');
  }
    
  try {
    const poses = await detector.estimatePoses(videoElement);
    //console.log('Poses:', poses);
    //console.log(`Video dimensions: ${videoElement.videoWidth}x${videoElement.videoHeight}`);
    
    if (poses.length > 0) {
      return tracker.calculateDualMetrics(poses[0]);
    }
    return null;
  } catch (error) {
    console.error('Pose detection error:', error);
    throw error;
  }
};

// Animation frame request ID for proper cancellation
let animationFrameId: number | null = null;

// Start continuous processing
export const startProcessing = (
  videoRef: React.RefObject<HTMLVideoElement | null>,
  detector: poseDetection.PoseDetector,
  onResult: (result: DualKneeMetrics) => void
): Promise<void> => {
  // Always stop any existing processing before starting a new one
  stopProcessing();
  
  isRunning = true;
  
  const processFrameLoop = async () => {
    if (!isRunning) return;
    
    try {
      if (videoRef.current) {
        const result = await processFrame(videoRef.current, detector);
        if (result) {
          onResult(result);
        }
      }
    } catch (error) {
      console.error('Frame processing error:', error);
    } finally {
      if (isRunning) {
        // Store the animation frame ID so we can cancel it later
        animationFrameId = requestAnimationFrame(processFrameLoop);
      }
    }
  };
  
  // Start the processing loop
  animationFrameId = requestAnimationFrame(processFrameLoop);
  currentProcessingPromise = Promise.resolve();
  return currentProcessingPromise;
};

// Stop processing
export const stopProcessing = (): void => {
  isRunning = false;
  
  // Cancel any pending animation frame
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  
  currentProcessingPromise = null;
};

// Update the knee side
export const updateKneeSide = (kneeSide: KneeSide): void => {
  currentKnee = kneeSide;
};

// Get the tracker instance
export const getTracker = (): KneeAngleTracker | null => {
  return tracker;
};

// Check if processing is running
export const isProcessingRunning = (): boolean => {
  return isRunning;
};

// Cleanup resources
export const disposeTracker = (): void => {
  stopProcessing();
  tracker = null;
};
