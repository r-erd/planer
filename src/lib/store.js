const STORAGE_KEY = 'weekend-planner-state';

const DEFAULT_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f43f5e', // rose
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#64748b', // slate
];

function createId() {
  return crypto.randomUUID();
}

function getDefaultState() {
  return {
    days: ['Saturday', 'Sunday'],
    startHour: 8,
    endHour: 23,
    events: [
      {
        id: createId(),
        title: 'Brunch',
        dayIndex: 0,
        startHour: 9,
        duration: 1.5,
        color: '#f97316',
      },
      {
        id: createId(),
        title: 'Hiking',
        dayIndex: 0,
        startHour: 11,
        duration: 3,
        color: '#22c55e',
      },
      {
        id: createId(),
        title: 'Board Games',
        dayIndex: 1,
        startHour: 14,
        duration: 2,
        color: '#8b5cf6',
      },
    ],
    unscheduled: [],
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure all required fields exist
      if (parsed.days && parsed.events !== undefined) {
        if (!parsed.unscheduled) parsed.unscheduled = [];
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load state from localStorage:', e);
  }
  return getDefaultState();
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save state to localStorage:', e);
  }
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  return getDefaultState();
}

export { DEFAULT_COLORS, createId };
