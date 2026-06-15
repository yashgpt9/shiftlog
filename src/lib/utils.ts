import { format, subDays } from 'date-fns';

export function getCurrentShiftDetails(date = new Date()) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  let productionDate = date;
  if (totalMinutes < 6 * 60 + 30) {
    productionDate = subDays(date, 1);
  }
  const logDateStr = format(productionDate, 'yyyy-MM-dd');

  let shift = '';
  let period: 'first_4h' | 'last_4h' | '' = '';

  if (totalMinutes >= 390 && totalMinutes < 900) {
    shift = 'A';
    period = totalMinutes < 630 ? 'first_4h' : 'last_4h';
  } else if (totalMinutes >= 900 && totalMinutes < 1410) {
    shift = 'B';
    period = totalMinutes < 1140 ? 'first_4h' : 'last_4h';
  } else {
    shift = 'C';
    if (totalMinutes >= 1410 || totalMinutes < 210) {
      period = 'first_4h';
    } else {
      period = 'last_4h';
    }
  }

  return { shift, period, logDateStr };
}
