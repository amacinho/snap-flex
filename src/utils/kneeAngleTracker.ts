import * as poseDetection from '@tensorflow-models/pose-detection';


import { KNEE, KneeSide, MOVING_AVERAGE_MIN_VALID_COUNT, MOVING_AVERAGE_WINDOW_SIZE, MINIMUM_POINT_SCORE } from './constants';
import { Keypoint, Pose } from '@tensorflow-models/pose-detection';
import { RunningAverager } from './runningAverager';

interface KneePoints {
    hip?: Keypoint;
    knee?: Keypoint;
    ankle?: Keypoint;
    nose?: Keypoint;
}

export interface KneeMetrics {
    side: KneeSide;
    angle: number | null;
    averageAngle: number | null;
    confidence: number | null;
    kneePoints: KneePoints;
}

export interface DualKneeMetrics {
    left: KneeMetrics;
    right: KneeMetrics;
}

// Default state for KneeMetrics when no data is available
export const DEFAULT_KNEE_METRICS: KneeMetrics = {
    side: KNEE.NONE,
    angle: null,
    averageAngle: null,
    confidence: null,
    kneePoints: {}
};

const RAD_TO_DEG = 180 / Math.PI;

const sumScores = (pts: KneePoints) => {
    const scores = [pts.hip?.score, pts.knee?.score, pts.ankle?.score]
        .filter((score): score is number => typeof score === 'number');
    return scores.reduce((acc, score) => acc + score, 0);
};

export class KneeAngleTracker {
    private minimumConfidence: number;
    private minimumDistanceRatio: number;
    private leftAverager: RunningAverager;
    private rightAverager: RunningAverager;

    constructor(minimumConfidence: number, minimumDistanceRatio: number) {
        this.minimumConfidence = minimumConfidence;
        this.minimumDistanceRatio = minimumDistanceRatio;
        this.leftAverager = new RunningAverager();
        this.rightAverager = new RunningAverager();
    }

    public calculateDualMetrics(pose: Pose): DualKneeMetrics {
        return {
            left: this.calculateKneeMetrics(pose, KNEE.LEFT),
            right: this.calculateKneeMetrics(pose, KNEE.RIGHT)
        };
    }
 
    public calculateKneeMetrics(pose: Pose, side: KneeSide): KneeMetrics {
        if(side !== KNEE.LEFT && side !== KNEE.RIGHT) {
            console.warn('Invalid knee side');
            return { side, angle: null, averageAngle: null, confidence: 0, kneePoints: {} };
        }

        const keyPoints = pose.keypoints.filter(k =>
            (k.score || 0) > this.minimumConfidence
        );

        let kneePoints: KneePoints = {};
        if (side === KNEE.LEFT) {
            kneePoints = {
                hip: keyPoints.find(point => point.name === 'left_hip'),
                knee: keyPoints.find(point => point.name === 'left_knee'),
                ankle: keyPoints.find(point => point.name === 'left_ankle'),
                nose: keyPoints.find(point => point.name === 'nose')
            };
        } else if (side === KNEE.RIGHT) {
            kneePoints = {
                hip: keyPoints.find(point => point.name === 'right_hip'),
                knee: keyPoints.find(point => point.name === 'right_knee'),
                ankle: keyPoints.find(point => point.name === 'right_ankle'),
                nose: keyPoints.find(point => point.name === 'nose')
            };
        } 
        
        // Return empty result if kneePoints are not found
        if (!kneePoints.hip || !kneePoints.knee || !kneePoints.ankle) {
            return { side, angle: null, averageAngle: null, confidence: 0, kneePoints: {} };
        }

        const score = sumScores(kneePoints);
        const angle = this.calculateKneeAngle(kneePoints);
        const averager = side === KNEE.LEFT ? this.leftAverager : this.rightAverager;
        averager.addData(angle);
        const averageAngle = averager.getMovingAverage(MOVING_AVERAGE_WINDOW_SIZE, MOVING_AVERAGE_MIN_VALID_COUNT).average;
        return { side: side, angle: angle, averageAngle: averageAngle, confidence: score, kneePoints: kneePoints };
    }

    // Calculate knee angle from filtered keypoints
    private calculateKneeAngle(kneePoints: KneePoints): number | null {
        const hip = kneePoints.hip;
        const knee = kneePoints.knee;
        const ankle = kneePoints.ankle;

        if (!hip || !knee || !ankle) {
            return null;
        }

        // Calculate vectors
        const vector1 = { x: knee.x - hip.x, y: knee.y - hip.y };
        const vector2 = { x: knee.x - ankle.x, y: knee.y - ankle.y };

        // Calculate dot product and magnitudes
        const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
        const mag1 = Math.sqrt(vector1.x ** 2 + vector1.y ** 2);
        const mag2 = Math.sqrt(vector2.x ** 2 + vector2.y ** 2);

        // Handle potential division by zero
        if (mag1 === 0 || mag2 === 0) return null;

        // Calculate angle in degrees
        const angleRad = Math.acos(dotProduct / (mag1 * mag2));
        const angleDeg = 180 - angleRad * RAD_TO_DEG;

        // Validate angle plausibility
        if (angleDeg > 170) return null;

        // Validate segment distances
        const d1 = this.calculateDistance(hip.x, hip.y, knee.x, knee.y);
        const d2 = this.calculateDistance(knee.x, knee.y, ankle.x, ankle.y);
        const minDistanceRatio = Math.min(d1, d2) / Math.max(d1, d2);

        return minDistanceRatio >= this.minimumDistanceRatio ? angleDeg : null;
    }

    // Helper method to calculate distance between points
    private calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
