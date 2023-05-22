import type { INumberRange } from '.';

export default interface IEvent {
    id: number;
    times: INumberRange;
    dates: INumberRange;
    month: number;
    year: number;
    title: string;
    description: string;
    location: string;
}
