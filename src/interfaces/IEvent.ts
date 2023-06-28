export interface IBaseEvent {
    id: number;
    title: string;
    description: string;
    location: string;
    dayCount: number;
    isAllDay: boolean;
}

export interface ISerializedEvent extends IBaseEvent {
    start: string;
    end: string;
}

export default interface IEvent extends IBaseEvent {
    start: Date;
    end: Date;
}

