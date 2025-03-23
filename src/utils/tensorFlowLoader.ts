import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';

// In a separate file (e.g., tensorflowLoader.js)
export let modelLoadingPromise;
export let detector: poseDetection.PoseDetector | null = null;

export function initTensorFlow() {
    modelLoadingPromise = (async () => {
        try {
            await tf.ready();
            console.log('TensorFlow.js backend ready');

            const modelType = poseDetection.movenet.modelType.SINGLEPOSE_THUNDER;

            const detectorPromise = poseDetection.createDetector(
                poseDetection.SupportedModels.MoveNet,
                {
                    modelType,
                    enableSmoothing: true,
                }
            );

            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Model loading timed out')), 30000);
            });

            detector = await Promise.race([detectorPromise, timeoutPromise]) as poseDetection.PoseDetector;
            console.log('MoveNet model loaded successfully');
            return true;
        } catch (error) {
            console.error('Failed to load TensorFlow model:', error);
            throw error;
        }
    })();

    return modelLoadingPromise;
}