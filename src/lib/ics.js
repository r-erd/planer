/**
 * Export scheduled events as an ICS (iCalendar) file.
 * Assumes events are for the upcoming matching day names.
 */

function pad(n) {
  return n.toString().padStart(2, '0');
}

function toICSDate(date, hour) {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  const y = date.getFullYear();
  const mo = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  return `${y}${mo}${d}T${pad(h)}${pad(m)}00`;
}

function getNextDayDate(dayName) {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  const todayIndex = today.getDay();
  const targetIndex = dayNames.indexOf(dayName);

  if (targetIndex === -1) {
    // Not a standard day name — just use today + index offset
    return today;
  }

  let diff = targetIndex - todayIndex;
  if (diff < 0) diff += 7;
  if (diff === 0) diff = 0; // today is fine

  const date = new Date(today);
  date.setDate(date.getDate() + diff);
  return date;
}

function escapeICS(text) {
  return text.replace(/[\\;,]/g, (c) => '\\' + c).replace(/\n/g, '\\n');
}

export function exportToICS(state) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Weekend Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Weekend Plan',
  ];

  const now = new Date();
  const timestamp = toICSDate(now, now.getHours() + now.getMinutes() / 60) + 'Z';

  for (const event of state.events) {
    // Skip unscheduled events (dayIndex === -1)
    if (event.dayIndex < 0 || event.dayIndex >= state.days.length) continue;

    const dayName = state.days[event.dayIndex];
    const date = getNextDayDate(dayName);
    const dtStart = toICSDate(date, event.startHour);
    const dtEnd = toICSDate(date, event.startHour + event.duration);

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${event.id}@weekend-planner`);
    lines.push(`DTSTAMP:${timestamp}`);
    lines.push(`DTSTART:${dtStart}`);
    lines.push(`DTEND:${dtEnd}`);
    lines.push(`SUMMARY:${escapeICS(event.title)}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');

  const content = lines.join('\r\n');
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'weekend-plan.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
