import React, { memo, useEffect } from 'react';
import { KneeMetrics } from '../utils/kneeAngleTracker';

// Track last rendered angle
let lastRenderedAngle: number | null = null;

interface AngleDisplayProps {
    currentAngle: number | null;
}

export const AngleDisplayComponent = ({ currentAngle }: AngleDisplayProps) => {
    useEffect(() => {
        // Update last rendered angle after each render
        if (currentAngle !== null) {
            lastRenderedAngle = currentAngle;
        }
    });

    return (
        <div className="angle-display">
            {(currentAngle === null) ? '-' : Math.round(currentAngle)}°
        </div>
    );
};

// Custom comparison function to prevent unnecessary re-renders
const areMetricsEqual = (prevProps: AngleDisplayProps, nextProps: AngleDisplayProps) => {
    const prevAngle = prevProps.currentAngle;
    const nextAngle = nextProps.currentAngle;
    
    if (prevAngle === null || nextAngle === null) {
        return prevAngle === nextAngle;
    }

    // Compare to last rendered angle
    if (lastRenderedAngle !== null) {
        const difference = Math.abs(nextAngle - lastRenderedAngle);
        return difference < 0.5;
    }
    
    // If no last rendered angle, render for first time
    return false;
};

export const AngleDisplay = memo(AngleDisplayComponent, areMetricsEqual);
