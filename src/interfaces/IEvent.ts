import type { RepeatEventType } from '@/enum/RepeatEventType';

export interface IBaseEvent {
    id: string;
    title: string;
    description: string;
    location: string;
    calendarName: string;
    dayCount: number;
    isAllDay: boolean;
    repeatType: RepeatEventType;
    repeatId?: string;
    repeatValue?: number;
}

export interface ISerializedEvent extends IBaseEvent {
    start: string;
    end: string;
    repeatEnd?: string;
}

export default interface IEvent extends IBaseEvent {
    start: Date;
    end: Date;
    repeatEnd?: Date;
}

