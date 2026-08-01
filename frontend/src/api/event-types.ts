import { createEventType as mockCreateEventType, listEventTypes as mockListEventTypes } from './mock-backend';
import type { CreateEventType, EventType } from './types';

export function listEventTypes(): Promise<EventType[]> {
  return mockListEventTypes();
}

export function createEventType(data: CreateEventType): Promise<EventType> {
  return mockCreateEventType(data);
}
