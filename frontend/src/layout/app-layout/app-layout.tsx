import type { ReactNode } from 'react';
import { Anchor, Burger, Container, Divider, Drawer, Group, ScrollArea, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, NavLink as RouterNavLink } from 'react-router-dom';
import classes from './app-layout.module.css';

const navLinks = [
  { link: '/bookings/new', label: 'Create Booking' },
  { link: '/admin', label: 'Administration' },
];

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [opened, { toggle, close }] = useDisclosure(false);

  const items = navLinks.map((link) => (
    <RouterNavLink
      key={link.label}
      to={link.link}
      className={({ isActive }) => `${classes.link} ${isActive ? classes.linkActive : ''}`}
      onClick={close}
    >
      {link.label}
    </RouterNavLink>
  ));

  return (
    <>
      <header className={classes.header}>
        <Container size="md" className={classes.inner}>
          <Text className={classes.title}>Calculator</Text>
          <Group gap={5} visibleFrom="xs">
            {items}
          </Group>

          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="xs"
            size="sm"
            aria-label="Toggle navigation"
          />
        </Container>

        <Drawer
          opened={opened}
          onClose={close}
          size="100%"
          padding="md"
          title="Navigation"
          hiddenFrom="xs"
          zIndex={1000000}
        >
          <ScrollArea h="calc(100vh - 80px)" mx="-md">
            <Divider my="sm" />
            {items}
          </ScrollArea>
        </Drawer>
      </header>

      <main className={classes.main}>{children}</main>

      <div className={classes.footer}>
        <Container className={classes.footerInner}>
          <Text size="sm" c="dimmed">
            © {new Date().getFullYear()} Calculator
          </Text>
          <Group className={classes.footerLinks} gap="lg">
            {navLinks.map((link) => (
              <Anchor key={link.label} component={Link} to={link.link} c="dimmed" size="sm">
                {link.label}
              </Anchor>
            ))}
          </Group>
        </Container>
      </div>
    </>
  );
}
