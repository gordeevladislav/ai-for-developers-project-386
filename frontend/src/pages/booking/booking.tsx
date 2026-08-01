import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Alert, Button, Card, Container, Select, Stack, Text, Title } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { createBooking } from '../../api/bookings';
import { listEventTypes } from '../../api/event-types';
import { listSlots } from '../../api/slots';
import type { EventType, Slot } from '../../api/types';
import { ConfirmBookingModal } from './confirm-booking-modal';
import classes from './booking.module.css';

const MIN_DATE = dayjs().format('YYYY-MM-DD');
const MAX_DATE = dayjs().add(13, 'day').format('YYYY-MM-DD');

export function Booking() {
  const navigate = useNavigate();

  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [eventTypesError, setEventTypesError] = useState<string | null>(null);

  const [eventTypeId, setEventTypeId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    listEventTypes()
      .then(setEventTypes)
      .catch(() => setEventTypesError('Failed to load event types.'));
  }, []);

  const loadSlots = (id: string) => {
    setSlotsLoading(true);
    setSlotsError(null);
    listSlots(id)
      .then(setSlots)
      .catch(() => setSlotsError('Failed to load available times.'))
      .finally(() => setSlotsLoading(false));
  };

  useEffect(() => {
    if (!eventTypeId) {
      setSlots([]);
      return;
    }
    loadSlots(eventTypeId);
  }, [eventTypeId]);

  const eventType = eventTypes.find((item) => item.id === eventTypeId) ?? null;

  const availableSlotsForDate = selectedDate
    ? slots
        .filter((slot) => slot.status === 'Available' && dayjs(slot.startTime).format('YYYY-MM-DD') === selectedDate)
        .sort((a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf())
    : [];

  const handleSelectSlot = (slot: Slot) => {
    setSelectedSlot(slot);
    setBookingSuccess(false);
    openModal();
  };

  const handleConfirm = async (guest: { name: string; email: string }) => {
    if (!eventType || !selectedSlot) return;

    try {
      await createBooking({
        eventTypeId: eventType.id,
        slotId: selectedSlot.id,
        guest: { id: crypto.randomUUID(), name: guest.name, email: guest.email },
      });
      setBookingSuccess(true);
      setEventTypeId(null);
      setSelectedDate(null);
      setSelectedSlot(null);
      navigate('/bookings/new');
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        loadSlots(eventType.id);
      }
      throw err;
    }
  };

  return (
    <Container size="md">
      <Title order={2} mb="lg">
        Book an event
      </Title>

      {bookingSuccess && (
        <Alert color="green" mb="lg" withCloseButton onClose={() => setBookingSuccess(false)}>
          Your booking has been confirmed!
        </Alert>
      )}

      {eventTypesError && (
        <Alert color="red" mb="lg">
          {eventTypesError}
        </Alert>
      )}

      <Select
        label="Event type"
        placeholder="Choose an event type"
        data={eventTypes.map((item) => ({
          value: item.id,
          label: `${item.name} (${item.durationMinutes} min)`,
        }))}
        value={eventTypeId}
        onChange={(value) => {
          setEventTypeId(value);
          setSelectedDate(null);
        }}
        mb="lg"
      />

      {eventTypeId && (
        <div className={classes.scheduleGrid}>
          <DatePicker value={selectedDate} onChange={setSelectedDate} minDate={MIN_DATE} maxDate={MAX_DATE} />

          <Card withBorder radius="md" p="md">
            <Title order={4} mb="sm">
              Available times
            </Title>

            {!selectedDate && <Text c="dimmed">Select a date to see available times.</Text>}

            {selectedDate && slotsLoading && <Text c="dimmed">Loading...</Text>}
            {selectedDate && slotsError && <Alert color="red">{slotsError}</Alert>}

            {selectedDate && !slotsLoading && !slotsError && availableSlotsForDate.length === 0 && (
              <Text c="dimmed">No available times for this date.</Text>
            )}

            <Stack gap="sm" className={classes.timesList}>
              {availableSlotsForDate.map((slot) => (
                <Button
                  key={slot.id}
                  variant="outline"
                  size="md"
                  fullWidth
                  className={classes.timeButton}
                  onClick={() => handleSelectSlot(slot)}
                >
                  {dayjs(slot.startTime).format('h:mm A')}
                </Button>
              ))}
            </Stack>
          </Card>
        </div>
      )}

      {eventType && selectedSlot && (
        <ConfirmBookingModal
          opened={modalOpened}
          onClose={closeModal}
          eventType={eventType}
          slot={selectedSlot}
          onConfirm={handleConfirm}
        />
      )}
    </Container>
  );
}
