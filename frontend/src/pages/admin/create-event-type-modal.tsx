import { useState } from 'react';
import { Button, Group, Modal, NumberInput, TextInput, Textarea } from '@mantine/core';
import type { CreateEventType } from '../../api/types';

interface CreateEventTypeModalProps {
  opened: boolean;
  onClose: () => void;
  onCreate: (data: CreateEventType) => Promise<void>;
}

const initialState: CreateEventType = {
  name: '',
  description: '',
  durationMinutes: 30,
};

export function CreateEventTypeModal({ opened, onClose, onCreate }: CreateEventTypeModalProps) {
  const [values, setValues] = useState<CreateEventType>(initialState);
  const [submitting, setSubmitting] = useState(false);

  const isValid = values.name.trim().length > 0 && values.description.trim().length > 0 && values.durationMinutes > 0;

  const handleClose = () => {
    setValues(initialState);
    onClose();
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      await onCreate(values);
      setValues(initialState);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Add new event type" centered>
      <TextInput
        label="Name"
        placeholder="30 Minute Meeting"
        value={values.name}
        onChange={(event) => {
          const name = event.currentTarget.value;
          setValues((prev) => ({ ...prev, name }));
        }}
        required
      />
      <Textarea
        label="Description"
        placeholder="A short meeting to discuss..."
        mt="sm"
        value={values.description}
        onChange={(event) => {
          const description = event.currentTarget.value;
          setValues((prev) => ({ ...prev, description }));
        }}
        required
      />
      <NumberInput
        label="Duration (minutes)"
        placeholder="30"
        mt="sm"
        min={1}
        value={values.durationMinutes}
        onChange={(value) => setValues((prev) => ({ ...prev, durationMinutes: Number(value) || 0 }))}
        required
      />

      <Group justify="flex-end" mt="lg">
        <Button variant="default" onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={submitting} disabled={!isValid}>
          Create
        </Button>
      </Group>
    </Modal>
  );
}
