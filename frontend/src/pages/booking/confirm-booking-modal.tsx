import { useState } from 'react';
import dayjs from 'dayjs';
import { Alert, Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import type { EventType, Slot } from '../../api/types';

interface GuestDetails {
  name: string;
  email: string;
}

interface ConfirmBookingModalProps {
  opened: boolean;
  onClose: () => void;
  eventType: EventType;
  slot: Slot;
  onConfirm: (guest: GuestDetails) => Promise<void>;
}

const initialState: GuestDetails = { name: '', email: '' };

export function ConfirmBookingModal({ opened, onClose, eventType, slot, onConfirm }: ConfirmBookingModalProps) {
  const [values, setValues] = useState<GuestDetails>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = values.name.trim().length > 0 && values.email.trim().length > 0;

  const handleClose = () => {
    setValues(initialState);
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(values);
      setValues(initialState);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Confirm booking" centered>
      <Stack gap="xs" mb="md">
        <Text size="sm">
          <Text span fw={500}>
            Event:
          </Text>{' '}
          {eventType.name} ({eventType.durationMinutes} min)
        </Text>
        <Text size="sm">
          <Text span fw={500}>
            When:
          </Text>{' '}
          {dayjs(slot.startTime).format('dddd, MMMM D, YYYY [at] h:mm A')}
        </Text>
      </Stack>

      {error && (
        <Alert color="red" mb="sm">
          {error}
        </Alert>
      )}

      <TextInput
        label="Name"
        placeholder="Jane Doe"
        value={values.name}
        onChange={(event) => {
          const name = event.currentTarget.value;
          setValues((prev) => ({ ...prev, name }));
        }}
        required
      />
      <TextInput
        label="Email"
        placeholder="jane@example.com"
        type="email"
        mt="sm"
        value={values.email}
        onChange={(event) => {
          const email = event.currentTarget.value;
          setValues((prev) => ({ ...prev, email }));
        }}
        required
      />

      <Group justify="flex-end" mt="lg">
        <Button variant="default" onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={submitting} disabled={!isValid}>
          Confirm
        </Button>
      </Group>
    </Modal>
  );
}
