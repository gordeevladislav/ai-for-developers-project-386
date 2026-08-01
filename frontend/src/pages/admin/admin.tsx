import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { ActionIcon, Alert, Button, Card, Container, Group, Loader, Stack, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { getOwner } from '../../api/owner';
import { createEventType, listEventTypes } from '../../api/event-types';
import { deleteBooking, listBookings } from '../../api/bookings';
import { listSlots } from '../../api/slots';
import type { Booking, CalendarOwner, CreateEventType, EventType, Slot } from '../../api/types';
import { OwnerInfo } from './owner-info';
import { CreateEventTypeModal } from './create-event-type-modal';
import { CancelBookingModal } from './cancel-booking-modal';

export function Admin() {
  const [owner, setOwner] = useState<CalendarOwner | null>(null);
  const [ownerError, setOwnerError] = useState<string | null>(null);

  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [eventTypesLoading, setEventTypesLoading] = useState(true);
  const [eventTypesError, setEventTypesError] = useState<string | null>(null);

  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [slotsById, setSlotsById] = useState<Record<string, Slot>>({});

  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [cancelModalOpened, { open: openCancelModal, close: closeCancelModal }] = useDisclosure(false);

  useEffect(() => {
    getOwner()
      .then(setOwner)
      .catch(() => setOwnerError('Failed to load owner information.'));
  }, []);

  const loadEventTypes = () => {
    setEventTypesLoading(true);
    listEventTypes()
      .then(setEventTypes)
      .catch(() => setEventTypesError('Failed to load event types.'))
      .finally(() => setEventTypesLoading(false));
  };

  useEffect(() => {
    loadEventTypes();
  }, []);

  const loadBookings = () => {
    setBookingsLoading(true);
    setBookingsError(null);
    listBookings()
      .then(async (items) => {
        setBookings(items);
        const eventTypeIds = [...new Set(items.map((booking) => booking.eventTypeId))];
        const slotLists = await Promise.all(eventTypeIds.map((id) => listSlots(id)));
        const map: Record<string, Slot> = {};
        slotLists.flat().forEach((slot) => {
          map[slot.id] = slot;
        });
        setSlotsById(map);
      })
      .catch(() => setBookingsError('Failed to load bookings.'))
      .finally(() => setBookingsLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCreate = async (data: CreateEventType) => {
    await createEventType(data);
    loadEventTypes();
  };

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;
    await deleteBooking(bookingToCancel.id);
    loadBookings();
  };

  return (
    <Container size="md">
      <Title order={2} mb="lg">
        Administration
      </Title>

      <Card withBorder radius="md" p="lg" mb="xl">
        {ownerError && <Alert color="red">{ownerError}</Alert>}
        {!ownerError && !owner && <Loader />}
        {owner && <OwnerInfo owner={owner} />}
      </Card>

      <Group justify="space-between" mb="md">
        <Title order={3}>Event types</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={openModal}>
          Add new event type
        </Button>
      </Group>

      {eventTypesLoading && <Loader />}
      {eventTypesError && <Alert color="red">{eventTypesError}</Alert>}

      {!eventTypesLoading && !eventTypesError && eventTypes.length === 0 && (
        <Text c="dimmed">No event types yet.</Text>
      )}

      <Stack gap="sm" mb="xl">
        {eventTypes.map((eventType) => (
          <Card key={eventType.id} withBorder radius="md" p="md">
            <Group justify="space-between">
              <div>
                <Text fw={500}>{eventType.name}</Text>
                <Text size="sm" c="dimmed">
                  {eventType.description}
                </Text>
              </div>
              <Text size="sm" c="dimmed">
                {eventType.durationMinutes} min
              </Text>
            </Group>
          </Card>
        ))}
      </Stack>

      <Title order={3} mb="md">
        Bookings
      </Title>

      {bookingsLoading && <Loader />}
      {bookingsError && <Alert color="red">{bookingsError}</Alert>}

      {!bookingsLoading && !bookingsError && bookings.length === 0 && <Text c="dimmed">No bookings yet.</Text>}

      <Stack gap="sm">
        {bookings.map((booking) => {
          const eventType = eventTypes.find((item) => item.id === booking.eventTypeId);
          const slot = slotsById[booking.slotId];

          return (
            <Card key={booking.id} withBorder radius="md" p="md">
              <Group justify="space-between" wrap="nowrap">
                <div>
                  <Text fw={500}>{booking.guest.name}</Text>
                  <Text size="sm" c="dimmed">
                    {booking.guest.email}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {eventType?.name ?? 'Unknown event type'}
                    {slot ? ` · ${dayjs(slot.startTime).format('MMM D, YYYY h:mm A')}` : ''}
                  </Text>
                </div>
                <ActionIcon
                  color="red"
                  variant="subtle"
                  aria-label="Cancel booking"
                  onClick={() => {
                    setBookingToCancel(booking);
                    openCancelModal();
                  }}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Group>
            </Card>
          );
        })}
      </Stack>

      <CreateEventTypeModal opened={modalOpened} onClose={closeModal} onCreate={handleCreate} />
      <CancelBookingModal
        opened={cancelModalOpened}
        onClose={closeCancelModal}
        booking={bookingToCancel}
        onConfirm={handleCancelBooking}
      />
    </Container>
  );
}
