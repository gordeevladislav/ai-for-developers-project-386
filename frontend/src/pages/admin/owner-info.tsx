import { IconAt, IconId } from '@tabler/icons-react';
import { Avatar, Group, Text } from '@mantine/core';
import type { CalendarOwner } from '../../api/types';
import classes from './owner-info.module.css';

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

interface OwnerInfoProps {
  owner: CalendarOwner;
}

export function OwnerInfo({ owner }: OwnerInfoProps) {
  return (
    <div>
      <Group wrap="nowrap">
        <Avatar size={94} radius="md" color="blue" alt={owner.name}>
          {getInitials(owner.name)}
        </Avatar>
        <div>
          <Text fz="xs" tt="uppercase" fw={700} c="dimmed">
            Calendar owner
          </Text>

          <Text fz="lg" fw={500} className={classes.name}>
            {owner.name}
          </Text>

          <Group wrap="nowrap" gap={10} mt={3}>
            <IconAt stroke={1.5} size={16} className={classes.icon} />
            <Text fz="xs" c="dimmed">
              {owner.email}
            </Text>
          </Group>

          <Group wrap="nowrap" gap={10} mt={5}>
            <IconId stroke={1.5} size={16} className={classes.icon} />
            <Text fz="xs" c="dimmed">
              {owner.id}
            </Text>
          </Group>
        </div>
      </Group>
    </div>
  );
}
