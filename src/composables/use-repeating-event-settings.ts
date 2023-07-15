import type { IEvent } from '@/interfaces';
import { MONTH_NAMES, DAYS_OF_WEEK, useDateUtils, NUMBER_SUFFICES } from './use-date-utils';
import { RepeatEventType } from '@/enum/RepeatEventType';

export function useRepeatingEventSettings() {
    const { getWeekOfMonthString } = useDateUtils();

    const getRepetitionTypes = (target: Date) => {
        const dayOfWeek = target.getDay();
        const date = target.getDate();
        const month = target.getMonth();
        const week = getWeekOfMonthString(target);

        return [
            'Does not Repeat',
            'Daily',
            `Weekly on ${DAYS_OF_WEEK[dayOfWeek]}`,
            `Monthly on the ${date}${NUMBER_SUFFICES[date]}`,
            `Monthly on the ${week} ${DAYS_OF_WEEK[dayOfWeek]}`,
            `Yearly on ${MONTH_NAMES[month]} ${date}${NUMBER_SUFFICES[date]}`,
            `Custom...`,
        ];
    };

    const getRepeatingValueString = (event: IEvent) => {
        if (event.repeatType === RepeatEventType.NONE) {
            return 'Does not repeat';
        }

        if (event.repeatType === RepeatEventType.DAILY) {
            return 'Daily';
        }

        if (event.repeatType === RepeatEventType.WEEKLY) {
            return `Weekly on ${DAYS_OF_WEEK[event.start!.getDay()]}`;
        }

        if (event.repeatType === RepeatEventType.YEARLY) {
            const date = event.start.getDate();
            return `Yearly on ${MONTH_NAMES[event.start.getMonth()]} ${date}${NUMBER_SUFFICES[date]}`;
        }

        if (event.repeatType === RepeatEventType.MONTHLY_DATE) {
            const date = event.start.getDate();
            return `Monthly on the ${date}${NUMBER_SUFFICES[date]}`;
        }

        if (!event.repeatValue) {
            return '';
        }
        console.log(`event.start = ${JSON.stringify(event.start)}`);
        return `Monthly on the ${getWeekOfMonthString(event.start)} ${DAYS_OF_WEEK[event.start.getDay()]}`;
    };

    return {
        getRepetitionTypes,
        getRepeatingValueString,
    };
}
