import { useEffect, useState } from "react";
import {
  Stack, Text, Paper, Group, Box,
  Loader, Center, Title, Badge, ActionIcon,
} from "@mantine/core";
import Base from "../../layouts/Base";
import { API } from "../../lib/api";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  IconBell,
  IconBellOff,
  IconCheck,
  IconChecks,
  IconInbox,
} from "@tabler/icons-react";

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

const itemVariants = {
  hidden: { opacity: 0, y: -12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1], delay: i * 0.05 },
  }),
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
} as const;

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
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: 1 } : n))
    );
    try {
      await API.notifications({ id }).read.patch();
    } catch {
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

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <Group justify="space-between" align="center">
            <Box>
              <Group gap="sm" align="center">
                <IconBell size={22} stroke={1.8} />
                <Title order={1} fz="1.5rem" fw={600}>Bandeja de entrada</Title>
                <AnimatePresence>
                  {unreadCount > 0 && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "backOut" }}
                    >
                      <Badge color="blue" variant="filled" size="sm" circle>
                        {unreadCount}
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Group>
              <Text size="sm" c="dimmed" mt={4}>
                {notifications.length} notificación{notifications.length !== 1 ? "es" : ""}
              </Text>
            </Box>

            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Group
                    gap={4}
                    style={{ cursor: "pointer" }}
                    onClick={markAllAsRead}
                  >
                    <IconChecks size={14} stroke={1.8} color="var(--mantine-color-dimmed)" />
                    <Text size="xs" c="dimmed" style={{ textDecoration: "underline" }}>
                      Marcar todas como leídas
                    </Text>
                  </Group>
                </motion.div>
              )}
            </AnimatePresence>
          </Group>
        </motion.div>

        {/* Content */}
        {loading ? (
          <Center py="xl"><Loader size="sm" /></Center>
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Paper withBorder p="xl" radius="md" ta="center">
              <IconBellOff size={32} stroke={1.4} color="var(--mantine-color-dimmed)" />
              <Text fw={500} mt="sm">Sin notificaciones</Text>
              <Text size="sm" c="dimmed" mt={4}>
                Aquí aparecerán tus notificaciones cuando las recibas.
              </Text>
            </Paper>
          </motion.div>
        ) : (
          <Stack gap="xs">
            <AnimatePresence initial={true}>
              {notifications.map((n, i) => (
                <motion.div
                  key={n.id}
                  custom={i}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                >
                  <Paper
                    withBorder
                    p="md"
                    radius="md"
                    style={{
                      borderLeft: !n.read
                        ? "3px solid var(--mantine-color-blue-5)"
                        : "3px solid transparent",
                      opacity: n.read ? 0.65 : 1,
                      transition: "opacity 0.25s ease",
                    }}
                  >
                    <Group justify="space-between" wrap="nowrap" align="flex-start">
                      <Group wrap="nowrap" align="flex-start" gap="sm" style={{ flex: 1 }}>
                        <Box pt={2}>
                          <IconInbox
                            size={16}
                            stroke={1.8}
                            color={
                              !n.read
                                ? "var(--mantine-color-blue-5)"
                                : "var(--mantine-color-dimmed)"
                            }
                          />
                        </Box>
                        <Box style={{ flex: 1 }}>
                          <Text size="sm" style={{ lineHeight: 1.6 }}>
                            {n.content}
                          </Text>
                          <Text size="xs" c="dimmed" mt={4}>
                            {timeAgo(n.created_at)}
                          </Text>
                        </Box>
                      </Group>

                      <AnimatePresence>
                        {!n.read && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.7 }}
                            transition={{ duration: 0.15 }}
                          >
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              size="sm"
                              title="Marcar como leída"
                              onClick={() => markAsRead(n.id)}
                            >
                              <IconCheck size={14} stroke={2} />
                            </ActionIcon>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Group>
                  </Paper>
                </motion.div>
              ))}
            </AnimatePresence>
          </Stack>
        )}

      </Stack>
    </Base>
  );
}