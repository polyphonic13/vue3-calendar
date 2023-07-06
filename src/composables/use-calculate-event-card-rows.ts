import type { IEvent } from '@/interfaces';
import { useDateUtils } from './use-date-utils';

interface IGridDay extends Date {
    day: number;
}

interface IGridEvent extends IEvent {
    start: IGridDay;
    clampedDuration: number;
}

export function useCalculateEventCardRows() {
    const createGrid = (x: number, y: number) => {
        const grid: boolean[][] = [];

        for (let i = 0; i < x; i++) {
            grid[i] = [];
            for (let j = 0; j < y; j++) {
                grid[i][j] = false;
            }
        }

        return grid;
    };

    const populateGridForEvent = (grid: boolean[][], event: IGridEvent, dayIndex: number, rows: number[]) => {
        const duration = event.clampedDuration;
        let isFree: boolean;
        // console.log(`\tdayIndex = ${dayIndex}, start = ${event.start.day}, clampedDuration = ${event.clampedDuration}`);
        for (let i = 0; i < grid.length; i++) {
            isFree = true;
            for (let j = dayIndex; j < (duration + dayIndex); j++) {
                // console.log(`\tgrid[ ${i} ][ ${j} ] = ${grid[i][j]}`);
                if (grid[i][j]) {
                    // console.log(`\t\t${i} is unavailable`);
                    isFree = false;
                    break;
                }
            }

            if (isFree) {
                // console.log(`\tfound free space at row ${i}, dayIndex = ${dayIndex}, duration + dayIndex = ${(duration + dayIndex)}`);
                for (let k = dayIndex; k < (duration + dayIndex); k++) {
                    // console.log(`\t\tpopulating [ ${i} ][ ${k} ] with true`);
                    grid[i][k] = true;
                }
                rows.push(i);
                break;
            }
        }

        return grid;
    };

    const getRowsForEvents = (events: IEvent[], dates: Date[]) => {
        const rows: number[] = [];

        const startDay = dates[0].getDate();

        const clampedEvents: IGridEvent[] = events.map((event) => {
            let clampedDuration;
            let sDay;

            if (event.start.getDate() >= startDay) {
                sDay = event.start.getDate();
                clampedDuration = event.dayCount;
                // console.log(`>>>>> clampedDuration for ${event.title} = ${clampedDuration}`);
            } else {
                sDay = startDay;
                clampedDuration = event.dayCount - (startDay - event.start.getDate()) + 1;
                // console.log(`===== clampedDuration for ${event.title} = ${clampedDuration}`);
            }

            return {
                ...event,
                start: {
                    ...event.start,
                    day: sDay,
                },
                clampedDuration,
            };
        });

        let grid: boolean[][] = createGrid(events.length, dates.length);
        if (grid.length > 0) {
            // console.log(`\n------- created grid = `, grid);
        }
        clampedEvents.forEach((event) => {
            // console.log(`event[ ${event.title} ] duration = ${event.dayCount}`);

            dates.forEach((date, d) => {
                if (date.getDate() === event.start.day) {
                    grid = populateGridForEvent(grid, event, d, rows);
                }
            });
        });

        return rows;
    };

    return {
        getRowsForEvents,
    };
}
