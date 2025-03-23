export const KNEE = {
  LEFT: 'left',
  RIGHT: 'right',
  NONE: 'none'
} as const;

export type KneeSide = 'left' | 'right' | 'none';
export type AppStatus = 'initializing' | 'error' | 'start' | 'loading' | 'ready' | 'capturing';
export type CameraStatus = 'off' | 'on';
export type TensorFlowStatus = 'initializing' | 'ready' | 'error';

export const MOVING_AVERAGE_MIN_VALID_COUNT = 3;
export const MOVING_AVERAGE_WINDOW_SIZE = 30;
export const MOVING_AVERAGE_BUFFER_SIZE = 200;

export const FRAME_UPDATE_INTERVAL = 1000 / 60;

export const MINIMUM_POINT_SCORE = 0.25;
export const MINIMUM_DISTANCE_RATIO = 0;