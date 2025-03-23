import { useEffect, useState, useRef, useCallback } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { KneeMetrics, DEFAULT_KNEE_METRICS, DualKneeMetrics } from '../utils/kneeAngleTracker';
import { KneeSide, AppStatus, MINIMUM_POINT_SCORE, MINIMUM_DISTANCE_RATIO, FRAME_UPDATE_INTERVAL } from '../utils/constants';
import { 
  initPoseDetection, 
  startProcessing, 
  stopProcessing, 
  updateKneeSide
} from '../utils/poseDetectionLoader';

export function usePoseDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  detector: poseDetection.PoseDetector | null,
  status: AppStatus,
  currentKnee: KneeSide,
  isAutoKneeEnabled: boolean,
  handleKneeChange: (newKnee: KneeSide) => void
): KneeMetrics {
  const [result, setResult] = useState<KneeMetrics>(DEFAULT_KNEE_METRICS);
  const currentKneeRef = useRef<KneeSide>(currentKnee);
  const lastUpdateTimeRef = useRef<number>(0);
  const latestResultRef = useRef<KneeMetrics>(DEFAULT_KNEE_METRICS);
  const lastAutoKneeRef = useRef<KneeSide>(currentKnee);

  // Initialize the tracker
  useEffect(() => {
    initPoseDetection(MINIMUM_POINT_SCORE, MINIMUM_DISTANCE_RATIO);
    
    return () => {
      stopProcessing();
    };
  }, []);

  // Keep the ref updated with the latest kneeSide
  useEffect(() => {
    currentKneeRef.current = currentKnee;
    updateKneeSide(currentKnee);
  }, [currentKnee]);

  // Start/stop processing based on status
  useEffect(() => {
    if (!detector) {
      console.warn('Pose detector not initialized');
      return;
    }

    if (status !== 'ready' && status !== 'capturing') {
      console.log(`App status is ${status}, stopping pose detection`);
      stopProcessing();
      return;
    }

    console.log(`App status is ${status}, effect triggered`);

    startProcessing(videoRef, detector, (newResult: DualKneeMetrics) => {
      // Handle auto knee selection
      if (isAutoKneeEnabled) {
        const bestKnee = selectBestKnee(newResult.left, newResult.right);
        
        if (bestKnee !== lastAutoKneeRef.current) {
          lastAutoKneeRef.current = bestKnee;
          handleKneeChange(bestKnee);
        }
      }

      // Update logic preserving existing frequency checks
      const selectedKnee = isAutoKneeEnabled ? lastAutoKneeRef.current : currentKneeRef.current;
      // console.log(`Selected knee: ${selectedKnee}`);
      latestResultRef.current = newResult[selectedKnee];

      const now = Date.now();
      if (now - lastUpdateTimeRef.current > FRAME_UPDATE_INTERVAL) {
        lastUpdateTimeRef.current = now;
        setResult(latestResultRef.current);
        
      }
    });
    
    return () => {
      stopProcessing();
    };
  }, [status, detector, videoRef, isAutoKneeEnabled]);

  return result;
}

function selectBestKnee(left: KneeMetrics, right: KneeMetrics): KneeSide {
  // Compare confidence scores
  const leftScore = left.confidence || 0;
  const rightScore = right.confidence || 0;

  console.log(`Left knee confidence: ${leftScore}, Right knee confidence: ${rightScore}`);
  
  
  // Select knee with higher confidence and valid angle
  if (leftScore > rightScore) {
    return 'left';
  } 
  return 'right';
}
