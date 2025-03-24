import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';

// Cache configuration
const MODEL_VERSION = '1.0';
const CACHE_KEY = `movenet-thunder-${MODEL_VERSION}`;
const MODEL_URL = 'https://tfhub.dev/google/tfjs-model/movenet/singlepose/thunder/4';

let detector: poseDetection.PoseDetector | null = null;
let initPromise: Promise<boolean> | null = null;
let isInitialized = false;

const isWebGLAvailable = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (e) {
    return false;
  }
};

const setWebGLBackend = async (): Promise<boolean> => {
  try {
    console.log('Attempting to set backend to WebGL...');
    if (!isWebGLAvailable()) {
      console.warn('WebGL is not available in this browser');
      return false;
    }
    const backendPromise = tf.setBackend('webgl');
    const timeoutPromise = new Promise<boolean>((_, reject) => {
      setTimeout(() => reject(new Error('WebGL backend initialization timed out')), 10000);
    });
    
    await Promise.race([backendPromise, timeoutPromise]);
    
    const backend = tf.getBackend();
    const success = backend === 'webgl';
    
    if (success) {
      console.log('Successfully set backend to WebGL');
    } else {
      console.warn(`Failed to set WebGL backend, current backend is: ${backend}`);
    }
    
    return success;
  } catch (err) {
    console.warn('Error setting WebGL backend:', err);
    return false;
  }
};

async function ensureModelCached(): Promise<void> {
  const modelUrlInCache = `indexeddb://${CACHE_KEY}`;
  const modelInfo = await tf.io.listModels();

  if (!modelInfo[modelUrlInCache]) {
    console.log('Downloading and caching model...');
    const model = await tf.loadGraphModel(MODEL_URL, { fromTFHub: true });
    await model.save(modelUrlInCache);
    model.dispose();
  }
}


export const initTensorFlow = (): Promise<boolean> => {
  // Return existing promise if already initializing
  if (initPromise) {
    return initPromise;
  }
  
  if (isInitialized && detector) {
    return Promise.resolve(true);
  }
  
  // Create new initialization promise
  initPromise = (async () => {
    try {
      console.log('Initializing TensorFlow.js...');
      
      // Try to set WebGL as the backend
      await setWebGLBackend();
      
      // Wait for TensorFlow to be ready
      await tf.ready();
      console.log('TensorFlow.js backend ready');
      
      // Ensure model is cached
      await ensureModelCached();

      // Try to load from cache with fallback to download
      let loadedFromCache = true;
      const modelUrlInCache = `indexeddb://${CACHE_KEY}`;

      try {
        detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
            modelUrl: modelUrlInCache,
            enableSmoothing: true,
          }
        );
      } catch (cacheError) {
        console.warn('Cache load failed, downloading fresh model:', cacheError);
        loadedFromCache = false;
        detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
            enableSmoothing: true,
          }
        );
      }

      console.log(`Model loaded successfully from ${loadedFromCache ? 'cache' : 'network'}`);
      isInitialized = true;
      return true;
    } catch (err) {
      console.error('TensorFlow initialization error:', err);
      isInitialized = false;
      detector = null;
      throw err;
    } finally {
      // Reset promise so initialization can be retried if it failed
      initPromise = null;
    }
  })();
  
  return initPromise;
};

// Get the detector instance
export const getDetector = (): poseDetection.PoseDetector | null => {
  return detector;
};

// Check if TensorFlow is initialized
export const isTensorFlowInitialized = (): boolean => {
  return isInitialized;
};

// Cleanup function
export const disposeDetector = (): void => {
  if (detector) {
    try {
      detector.dispose();
      console.log('TensorFlow detector disposed');
    } catch (err) {
      console.error('Error disposing detector:', err);
    }
    detector = null;
    isInitialized = false;
  }
};
