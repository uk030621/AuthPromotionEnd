// Whole days between today and a target date (can be negative if the date
// has already passed).
export function daysUntil(targetDate, from = new Date()) {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const target = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate()
  );
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((target - today) / msPerDay);
}

// Urgency bucket drives the color coding of each card tile.
export function urgencyFor(days) {
  if (days < 0) return 'expired';
  if (days <= 14) return 'due';
  if (days <= 45) return 'soon';
  return 'safe';
}

// Always renders as UK-style dd/mm/yyyy, regardless of the visitor's
// browser/OS locale.
export function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Parse a 'YYYY-MM-DD' string (from an <input type="date">) into a local
// Date at midnight, avoiding UTC-shift-by-a-day bugs.
export function parseDateInput(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function toDateInputValue(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
