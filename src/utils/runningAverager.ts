import { MOVING_AVERAGE_BUFFER_SIZE } from './constants';

export class RunningAverager {
    private buffer: (number | null)[];
    private index = 0;

    constructor() {
        this.buffer = new Array(MOVING_AVERAGE_BUFFER_SIZE).fill(null);
    }

    addData(angle: number | null) {
        this.buffer[this.index] = angle;
        this.index = (this.index + 1) % this.buffer.length;
    }

    getMovingAverage(windowSize: number, minValidCount: number): {
        average: number | null;
        validCount: number;
        totalCount: number;
    } {
        // Get last 'windowSize' frames considering circular buffer
        const values: number[] = [];
        for (let i = 0; i < windowSize; i++) {
            const idx = (this.index - 1 - i + this.buffer.length) % this.buffer.length;
            const val = this.buffer[idx];
            if (val !== null && !isNaN(val)) {
                values.unshift(val);
            }
        }

        const validCount = values.length;
        const totalCount = windowSize;
        return {
            average: validCount >= minValidCount ? values.reduce((a, b) => a + b, 0) / validCount : null,
            validCount,
            totalCount
        };
    }
}
