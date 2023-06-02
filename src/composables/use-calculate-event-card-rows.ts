import type { IDayInfo, IEvent } from '@/interfaces';
import { useDateUtils } from './use-date-utils';

export function useCalculateEventCardRows() {
    const { getDayInfoFromDate } = useDateUtils();

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

    const populateGridForEvent = (grid: boolean[][], event: IEvent, dayIndex: number, rows: number[]) => {
        const duration = event.dayCount;
        let isFree: boolean;
        // console.log(`\tdayIndex = ${dayIndex}, duration = ${duration}`);
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
                // console.log(`\tfound free space at ${i}`);
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
        const dayInfos = dates.map((date) => getDayInfoFromDate(date));

        let grid: boolean[][] = createGrid(events.length, dates.length);

        events.forEach((event) => {
            // console.log(`event[ ${event.id} ] duration = ${event.dayCount}`);

            dayInfos.forEach((dayInfo, d) => {
                if (dayInfo.day === event.start.day) {
                    grid = populateGridForEvent(grid, event, d, rows);
                    // console.log(`\tgrid now = ${JSON.stringify(grid)}`);
                }
            });
        });

        return rows;
    };

    return {
        getRowsForEvents,
    };
}
