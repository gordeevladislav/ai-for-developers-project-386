import { ApiError } from './client';
import type { Booking, CalendarOwner, CreateBooking, CreateEventType, EventType, Slot } from './types';

const SLOT_DAYS = 14;
const BUSINESS_START_HOUR = 9;
const BUSINESS_END_HOUR = 17;

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

const owner: CalendarOwner = {
  id: crypto.randomUUID(),
  name: 'Alex Morgan',
  email: 'alex.morgan@calculator.dev',
};

const eventTypes: EventType[] = [
  {
    id: crypto.randomUUID(),
    name: '30 Minute Meeting',
    description: 'A quick sync to discuss a specific topic.',
    durationMinutes: 30,
  },
  {
    id: crypto.randomUUID(),
    name: '60 Minute Meeting',
    description: 'An in-depth conversation with time for follow-up questions.',
    durationMinutes: 60,
  },
];

const bookings: Booking[] = [];

function slotId(eventTypeId: string, startTime: Date): string {
  return `${eventTypeId}_${startTime.toISOString()}`;
}

function generateSlots(eventType: EventType): Slot[] {
  const now = new Date();
  const slots: Slot[] = [];

  for (let dayOffset = 0; dayOffset < SLOT_DAYS; dayOffset++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset);

    for (
      let minutes = BUSINESS_START_HOUR * 60;
      minutes + eventType.durationMinutes <= BUSINESS_END_HOUR * 60;
      minutes += eventType.durationMinutes
    ) {
      const startTime = new Date(day);
      startTime.setHours(0, minutes, 0, 0);
      if (startTime <= now) continue;

      const endTime = new Date(startTime.getTime() + eventType.durationMinutes * 60_000);
      const id = slotId(eventType.id, startTime);
      const isBooked = bookings.some((booking) => booking.eventTypeId === eventType.id && booking.slotId === id);

      slots.push({
        id,
        eventTypeId: eventType.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        status: isBooked ? 'Booked' : 'Available',
      });
    }
  }

  return slots;
}

export function getOwner(): Promise<CalendarOwner> {
  return delay(owner);
}

export function listEventTypes(): Promise<EventType[]> {
  return delay([...eventTypes]);
}

export function createEventType(data: CreateEventType): Promise<EventType> {
  const eventType: EventType = { id: crypto.randomUUID(), ...data };
  eventTypes.push(eventType);
  return delay(eventType);
}

export function listSlots(eventTypeId: string): Promise<Slot[]> {
  const eventType = eventTypes.find((item) => item.id === eventTypeId);
  if (!eventType) {
    return Promise.reject(new ApiError(404, `Event type ${eventTypeId} not found.`, undefined));
  }
  return delay(generateSlots(eventType));
}

export function createBooking(data: CreateBooking): Promise<Booking> {
  const eventType = eventTypes.find((item) => item.id === data.eventTypeId);
  if (!eventType) {
    return Promise.reject(new ApiError(404, `Event type ${data.eventTypeId} not found.`, undefined));
  }

  const slot = generateSlots(eventType).find((item) => item.id === data.slotId);
  if (!slot || slot.status !== 'Available') {
    return Promise.reject(new ApiError(409, 'This slot is no longer available.', { message: 'Slot already booked' }));
  }

  const booking: Booking = {
    id: crypto.randomUUID(),
    eventTypeId: data.eventTypeId,
    slotId: data.slotId,
    guest: data.guest,
    createdAt: new Date().toISOString(),
  };
  bookings.push(booking);
  return delay(booking);
}

export function listBookings(): Promise<Booking[]> {
  return delay([...bookings]);
}

export function deleteBooking(id: string): Promise<void> {
  const index = bookings.findIndex((booking) => booking.id === id);
  if (index === -1) {
    return Promise.reject(new ApiError(404, `Booking ${id} not found.`, undefined));
  }
  bookings.splice(index, 1);
  return delay(undefined);
}
