export default interface IEvent {
    id: number;
    times: {
        start: number,
        end: number,
    };
    dates: {
        start: number,
        end: number,
    };
    month: number;
    year: number;
    title: string;
    description: string;
    location: string;
}
