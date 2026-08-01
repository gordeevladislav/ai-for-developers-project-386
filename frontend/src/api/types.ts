export interface CalendarOwner {
  id: string;
  name: string;
  email: string;
}

export interface EventType {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
}

export interface CreateEventType {
  name: string;
  description: string;
  durationMinutes: number;
}

export type SlotStatus = 'Available' | 'Booked';

export interface Slot {
  id: string;
  eventTypeId: string;
  startTime: string;
  endTime: string;
  status: SlotStatus;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
}

export interface CreateBooking {
  eventTypeId: string;
  slotId: string;
  guest: Guest;
}

export interface Booking {
  id: string;
  eventTypeId: string;
  slotId: string;
  guest: Guest;
  createdAt: string;
}

export interface SlotAlreadyBookedError {
  message: string;
}
