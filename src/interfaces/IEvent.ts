export interface IBaseEvent {
    id: number;
    title: string;
    description: string;
    location: string;
    calendarName: string;
    dayCount: number;
    isAllDay: boolean;
    isRepeating: boolean;
    repeatingId?: number;
    repeatingQuantity?: number | { day: number, week: number };
    repeatingUnit?: 'daily' | 'weekly' | 'monthlyDate' | 'monthlyWeek' | 'yearly';
    repeatingEnd?: Date;
}

export interface ISerializedEvent extends IBaseEvent {
    start: string;
    end: string;
}

export default interface IEvent extends IBaseEvent {
    start: Date;
    end: Date;
}

