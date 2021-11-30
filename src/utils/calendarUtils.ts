export const getCalendarDays = (year: number = new Date().getFullYear()): number[][] => {

  // set date to Jan 1st
  let calendarDays: number[][] = [];

  for (let i = 0; i <= 11; i++) {
    let date = new Date(year, i, 1);
    calendarDays.push([]);

    let day: number = 1;

    while (date.getMonth() === i) {
      calendarDays[i].push(day)
      day++;
      date.setDate(date.getDate() + 1);
    }
  }

  return calendarDays;
};