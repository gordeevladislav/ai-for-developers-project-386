import { listSlots as mockListSlots } from './mock-backend';
import type { Slot } from './types';

export function listSlots(eventTypeId: string): Promise<Slot[]> {
  return mockListSlots(eventTypeId);
}
