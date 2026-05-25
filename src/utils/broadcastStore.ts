import type { Broadcast } from "../types";

const LS_KEY = "churchcomm.broadcasts.v1";

export function loadBroadcasts(): Broadcast[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Broadcast[];
  } catch {
    return [];
  }
}

export function saveBroadcasts(list: Broadcast[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  } catch {
    // noop
  }
}
