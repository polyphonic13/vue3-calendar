import type { RepeatEventType } from '@/enum/RepeatEventType';

export interface IBaseEvent {
    id: string;
    title: string;
    description: string;
    location: string;
    calendarName: string;
    dayCount: number;
    isAllDay: boolean;
    isRepeating: boolean;
    repeatId?: string;
    repeatValue?: number;
    repeatType?: RepeatEventType;
    repeatEnd?: Date;
}

export interface ISerializedEvent extends IBaseEvent {
    start: string;
    end: string;
}

export default interface IEvent extends IBaseEvent {
    start: Date;
    end: Date;
}

