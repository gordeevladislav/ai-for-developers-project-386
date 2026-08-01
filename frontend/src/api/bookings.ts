import {
  createBooking as mockCreateBooking,
  deleteBooking as mockDeleteBooking,
  listBookings as mockListBookings,
} from './mock-backend';
import type { Booking, CreateBooking } from './types';

export function listBookings(): Promise<Booking[]> {
  return mockListBookings();
}

export function createBooking(data: CreateBooking): Promise<Booking> {
  return mockCreateBooking(data);
}

export function deleteBooking(id: string): Promise<void> {
  return mockDeleteBooking(id);
}
