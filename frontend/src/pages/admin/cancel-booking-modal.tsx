import { useState } from 'react';
import { Alert, Button, Group, Modal, Text } from '@mantine/core';
import type { Booking } from '../../api/types';

interface CancelBookingModalProps {
  opened: boolean;
  onClose: () => void;
  booking: Booking | null;
  onConfirm: () => Promise<void>;
}

export function CancelBookingModal({ opened, onClose, booking, onConfirm }: CancelBookingModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!booking) return null;

  return (
    <Modal opened={opened} onClose={handleClose} title="Cancel booking" centered>
      <Text size="sm" mb="md">
        Cancel the booking for <b>{booking.guest.name}</b> ({booking.guest.email})? This will free up the time slot
        again.
      </Text>

      {error && (
        <Alert color="red" mb="sm">
          {error}
        </Alert>
      )}

      <Group justify="flex-end">
        <Button variant="default" onClick={handleClose} disabled={submitting}>
          Keep booking
        </Button>
        <Button color="red" onClick={handleConfirm} loading={submitting}>
          Cancel booking
        </Button>
      </Group>
    </Modal>
  );
}
