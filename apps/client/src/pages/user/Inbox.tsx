import { useEffect, useState } from "react";
import {
  Stack, Text, Paper, Group, Box,
  Loader, Center, Title, Badge, ActionIcon,
} from "@mantine/core";
import Base from "../../layouts/Base";
import { API } from "../../lib/api";

interface Notification {
  id: number;
  content: string;
  read: number;
  created_at: string;
  expires_at: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min  = Math.floor(diff / 60_000);
  const h    = Math.floor(diff / 3_600_000);
  const d    = Math.floor(diff / 86_400_000);
  if (min < 1)  return "ahora mismo";
  if (min < 60) return `hace ${min}min`;
  if (h   < 24) return `hace ${h}h`;
  return `hace ${d}d`;
}

export default function Inbox() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await API.notifications.me.get();
        setNotifications(data ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: number) => {
    // Optimistic
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: 1 } : n))
    );
    try {
      await API.notifications({ id }).read.patch();
    } catch {
      // revert
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: 0 } : n))
      );
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: 1 })));
    try {
      await API.notifications.read.patch();
    } catch {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: 0 })));
    }
  };

  return (
    <Base>
      <Stack maw={600} mx="auto" p="lg" gap="lg">

        <Group justify="space-between" align="center">
          <Box>
            <Group gap="sm">
              <Title order={1} fz="1.5rem" fw={600}>Bandeja de entrada</Title>
              {unreadCount > 0 && (
                <Badge color="blue" variant="filled" size="sm" circle>
                  {unreadCount}
                </Badge>
              )}
            </Group>
            <Text size="sm" c="dimmed" mt={4}>
              {notifications.length} notificación{notifications.length !== 1 ? "es" : ""}
            </Text>
          </Box>

          {unreadCount > 0 && (
            <Text
              size="xs"
              c="dimmed"
              style={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={markAllAsRead}
            >
              Marcar todas como leídas
            </Text>
          )}
        </Group>

        {loading ? (
          <Center py="xl"><Loader size="sm" /></Center>
        ) : notifications.length === 0 ? (
          <Paper withBorder p="xl" radius="md" ta="center">
            <span>﹀</span>
            <Text fw={500} mt="sm">Sin notificaciones</Text>
            <Text size="sm" c="dimmed" mt={4}>
              Aquí aparecerán tus notificaciones cuando las recibas.
            </Text>
          </Paper>
        ) : (
          <Stack gap="xs">
            {notifications.map((n) => (
              <Paper
                key={n.id}
                withBorder
                p="md"
                radius="md"
                style={{
                  borderLeft: !n.read
                    ? "3px solid var(--mantine-color-blue-5)"
                    : "3px solid transparent",
                  opacity: n.read ? 0.65 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                <Group justify="space-between" wrap="nowrap" align="flex-start">
                  <Box style={{ flex: 1 }}>
                    <Text size="sm" style={{ lineHeight: 1.6 }}>
                      {n.content}
                    </Text>
                    <Text size="xs" c="dimmed" mt={4}>
                      {timeAgo(n.created_at)}
                    </Text>
                  </Box>

                  {!n.read && (
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      size="sm"
                      title="Marcar como leída"
                      onClick={() => markAsRead(n.id)}
                    >
                      <span>X</span>
                    </ActionIcon>
                  )}
                </Group>
              </Paper>
            ))}
          </Stack>
        )}

      </Stack>
    </Base>
  );
}