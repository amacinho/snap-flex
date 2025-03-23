import React, { useRef, useEffect, useCallback } from 'react';
import { KneeMetrics } from '../utils/kneeAngleTracker';
import { MINIMUM_POINT_SCORE } from '../utils/constants';

interface PoseRendererProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  kneeMetrics?: KneeMetrics;
  isFrontFacing: boolean;
}

const toCanvasSpace = (
  point: { x: number; y: number },
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  isFrontFacing: boolean
) => {
  const videoRect = video.getBoundingClientRect();
  const scaleX = video.videoWidth / videoRect.width;
  const scaleY = video.videoHeight / videoRect.height;
  const normalizedX = (point.x / video.videoWidth);
  const normalizedY = (point.y / video.videoHeight);

  const { devicePixelRatio: dpr = 1 } = window;
  return {
    x: normalizedX * canvas.width / dpr,
    y: normalizedY * canvas.height / dpr
  };
}; 

function resizeCanvas(canvas) {
  const { width, height } = canvas.getBoundingClientRect()

  if (canvas.width !== width || canvas.height !== height) {
    const { devicePixelRatio: ratio = 1 } = window
    const context = canvas.getContext('2d')
    canvas.width = width * ratio
    canvas.height = height * ratio
    context.scale(ratio, ratio)
    return true
  }

  return false
}

export const PoseRenderer: React.FC<PoseRendererProps> = ({
  videoRef,
  kneeMetrics,
  isFrontFacing
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const canvas = ctx.canvas;
      resizeCanvas(canvas);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if(!videoRef.current) return;
      if(!kneeMetrics) return;

      const hipPoint: { x: number; y: number } | null =
        kneeMetrics.kneePoints.hip?.score && kneeMetrics.kneePoints.hip.score > MINIMUM_POINT_SCORE
          ? toCanvasSpace(kneeMetrics.kneePoints.hip, videoRef.current!, canvas, isFrontFacing)
          : null;
      const kneePoint: { x: number; y: number } | null =
        kneeMetrics.kneePoints.knee?.score && kneeMetrics.kneePoints.knee.score > MINIMUM_POINT_SCORE
          ? toCanvasSpace(kneeMetrics.kneePoints.knee, videoRef.current!, canvas, isFrontFacing)
          : null;
      const anklePoint: { x: number; y: number } | null =
        kneeMetrics.kneePoints.ankle?.score && kneeMetrics.kneePoints.ankle.score > MINIMUM_POINT_SCORE
          ? toCanvasSpace(kneeMetrics.kneePoints.ankle, videoRef.current!, canvas, isFrontFacing)
          : null;


      const keypointList = [
        hipPoint,
        kneePoint,
        anklePoint
        // kneeMetrics.kneePoints.nose
      ];

      keypointList.forEach((point, index) => {
        if (!point) return;

        const circle = new Path2D();
        circle.arc(point.x, point.y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = '#00FF00';
        ctx.strokeStyle = '#FFFFFF';
        ctx.fill(circle);
        ctx.stroke(circle);
      });
      ctx.beginPath();
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 3;


      if (hipPoint && kneePoint) {
        ctx.moveTo(hipPoint.x, hipPoint.y);
        ctx.lineTo(kneePoint.x, kneePoint.y);
      }
      if (kneePoint && anklePoint) {
        ctx.moveTo(kneePoint.x, kneePoint.y);
        ctx.lineTo(anklePoint.x, anklePoint.y);
      }
      ctx.stroke();
    },
    [kneeMetrics, videoRef, isFrontFacing]
  );
  

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d')
    if (!context) return;
    
    let animationFrameId: number;

    const render = () => {
      draw(context);
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [draw])
 
  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        transform: isFrontFacing ? 'scaleX(-1)' : 'none'

        
      }} 
    />
  );
};
