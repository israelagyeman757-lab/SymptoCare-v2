const RECENT_MEDICINE_KEY = 'symptocare:recent-medicine';

export interface RecentMedicine {
  code: string;
  name: string;
}

export function setRecentMedicine(entry: RecentMedicine): void {
  try {
    localStorage.setItem(RECENT_MEDICINE_KEY, JSON.stringify(entry));
  } catch {
    /* storage unavailable */
  }
}

export function getRecentMedicine(): RecentMedicine | null {
  try {
    const raw = localStorage.getItem(RECENT_MEDICINE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RecentMedicine;
    return parsed?.code && parsed?.name ? parsed : null;
  } catch {
    return null;
  }
}
