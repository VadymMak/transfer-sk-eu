/**
 * Returns midnight UTC for today's calendar date in Europe/Bratislava.
 *
 * Tour dates are stored as YYYY-MM-DDT00:00:00.000Z (midnight UTC).
 * Comparing trip.dateStart < todayCutoff() correctly identifies past tours
 * relative to the current day in Bratislava (handles DST automatically).
 *
 * A tour on today's date is still "upcoming" (dateStart >= todayCutoff).
 */
export function todayCutoff(): Date {
  const localDate = new Intl.DateTimeFormat('sv', {
    timeZone: 'Europe/Bratislava',
  }).format(new Date()); // 'sv' locale gives 'YYYY-MM-DD'
  return new Date(`${localDate}T00:00:00.000Z`);
}

export function isTripPast(dateStart: Date): boolean {
  return dateStart < todayCutoff();
}
