import { getOwner as mockGetOwner } from './mock-backend';
import type { CalendarOwner } from './types';

export function getOwner(): Promise<CalendarOwner> {
  return mockGetOwner();
}
