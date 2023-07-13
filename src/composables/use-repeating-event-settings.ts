import { MONTH_NAMES, DAYS_OF_WEEK, useDateUtils } from './use-date-utils';

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
            `Monthly on the ${week} ${DAYS_OF_WEEK[dayOfWeek]}`,
            `Annually on ${MONTH_NAMES[month]} ${date}`,
            `Custom...`,
        ];
    };

    return {
        getRepetitionTypes,
    };
}
