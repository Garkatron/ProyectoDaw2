import { useEffect, useState } from "react";
import { useAuthStore } from "../../stores/auth.store";
import { getAppointments, getUserServiceById } from "../../services/appointments.service";
import Base from "../../layouts/Base";
import Calendar from "../../components/Calendar";
import { CheckCircle, Clock, Banknote, RefreshCw } from "lucide-react";
import {
  Alert,
  Badge,
  Box,
  Center,
  Divider,
  Group,
  Paper,
  ScrollArea,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
  ThemeIcon,
} from "@mantine/core";

const statusConfig = {
  Completed: { color: "green", icon: CheckCircle },
  Pending: { color: "yellow", icon: Clock },
  "In Process": { color: "blue", icon: RefreshCw },
};

const AppointmentCard = ({ appointment }) => {
  const config = statusConfig[appointment.status] || statusConfig.Pending;
  const Icon = config.icon;
  const date = new Date(appointment.date_time);

  return (
    <Paper withBorder p="md" shadow="xs">
      <Group justify="space-between" mb="sm">
        <Group gap="xs">
          <ThemeIcon color={config.color} variant="light" size="sm">
            <Icon size={14} />
          </ThemeIcon>
          <Badge color={config.color} variant="light" size="sm">
            {appointment.status}
          </Badge>
        </Group>
        <Text size="xs" c="dimmed">
          {date.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
        </Text>
      </Group>

      <Stack gap={6}>
        <Group gap="xs">
          <Clock size={14} />
          <Text size="sm">
            {date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </Group>

        <Group gap="xs">
          <Banknote size={14} />
          <Text size="sm" fw={600}>
            €{appointment.total_amount ?? appointment.price ?? 0}
          </Text>
          <Text size="xs" c="dimmed">({appointment.payment_method})</Text>
        </Group>

        {appointment.service_name && (
          <>
            <Divider />
            <Text size="xs" c="dimmed">
              Servicio: <Text span fw={500}>{appointment.service_name}</Text>
            </Text>
          </>
        )}

        {appointment.provider_id && (
          <Text size="xs" c="dimmed">
            Proveedor ID: <Text span fw={500}>{appointment.provider_id}</Text>
          </Text>
        )}
      </Stack>
    </Paper>
  );
};

export default function Appointments() {
  const currentUser = useAuthStore((state) => state.user);
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const raw = await getAppointments(currentUser.id);
        const data = raw || [];

        const enriched = await Promise.all(
          data.map(async (appt) => {
            if (appt.service_name || !appt.service_id) return appt;
            try {
              const svc = await getUserServiceById(appt.provider_id ?? currentUser.id, appt.service_id);
              return { ...appt, service_name: svc?.name ?? svc?.service_name ?? null };
            } catch {
              return appt;
            }
          })
        );

        setAppointments(enriched);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("No se pudieron cargar las citas");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [currentUser]);

  // Construir markedDates para el Calendar custom
  const markedDates = Object.entries(
    appointments.reduce((acc, appt) => {
      const key = new Date(appt.date_time).toDateString();
      if (!acc[key]) acc[key] = { date: new Date(appt.date_time), status: appt.status };
      else if (appt.status === "In Process") acc[key].status = "In Process";
      else if (appt.status === "Pending" && acc[key].status !== "In Process") acc[key].status = "Pending";
      return acc;
    }, {})
  ).map(([, val]) => val);

  const appointmentsOnSelectedDate = appointments.filter((app) => {
    const d = new Date(app.date_time);
    return (
      d.getDate() === selectedDate.getDate() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getFullYear() === selectedDate.getFullYear()
    );
  });

  if (loading) {
    return (
      <Base>
        <Stack maw={1152} mx="auto" p={{ base: "md", sm: "xl" }} gap="lg">
          <Skeleton height={32} width={192} />
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
            <Skeleton height={384} />
            <Skeleton height={384} />
          </SimpleGrid>
        </Stack>
      </Base>
    );
  }

  if (error) {
    return (
      <Base>
        <Box maw={1152} mx="auto" p={{ base: "md", sm: "xl" }}>
          <Alert color="red" ta="center">{error}</Alert>
        </Box>
      </Base>
    );
  }

  return (
    <Base>
      <Stack maw={1152} mx="auto" p={{ base: "md", sm: "xl" }} gap="lg">

        {/* Header */}
        <Group justify="space-between">
          <Box>
            <Title order={1} fz="1.5rem" fw={700}>Mis Citas</Title>
            <Text size="sm" c="dimmed" mt={4}>
              {appointments.length} cita{appointments.length !== 1 ? "s" : ""} en total
            </Text>
          </Box>
          <Group gap="md" visibleFrom="sm">
            {Object.entries(statusConfig).map(([status, config]) => (
              <Group key={status} gap={6}>
                <Box
                  w={12} h={12}
                  style={{
                    borderRadius: "50%",
                    backgroundColor: `var(--mantine-color-${config.color}-5)`,
                  }}
                />
                <Text size="xs" c="dimmed">{status}</Text>
              </Group>
            ))}
          </Group>
        </Group>

        {/* Calendar + Day Panel */}
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
          <Paper withBorder p={{ base: "md", sm: "lg" }}>
            <Calendar
              markedDates={markedDates}
              onDateClick={setSelectedDate}
              selectedDate={selectedDate}
            />
          </Paper>

          <Paper withBorder p={{ base: "md", sm: "lg" }}>
            <Box
              pb="sm"
              mb="sm"
              style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}
            >
              <Text fw={600} fz="lg" tt="capitalize">
                {selectedDate.toLocaleDateString("es-ES", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric",
                })}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                {appointmentsOnSelectedDate.length} cita{appointmentsOnSelectedDate.length !== 1 ? "s" : ""}
              </Text>
            </Box>

            <ScrollArea mah={500} pr="xs">
              <Stack gap="sm">
                {appointmentsOnSelectedDate.length > 0 ? (
                  appointmentsOnSelectedDate.map((appt) => (
                    <AppointmentCard key={appt.id} appointment={appt} />
                  ))
                ) : (
                  <Center py={48}>
                    <Stack align="center" gap="xs">
                      <Clock size={48} color="var(--mantine-color-dimmed)" />
                      <Text size="sm" c="dimmed">No hay citas para este día</Text>
                    </Stack>
                  </Center>
                )}
              </Stack>
            </ScrollArea>
          </Paper>
        </SimpleGrid>

        {/* Summary Stats */}
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = appointments.filter((a) => a.status === status).length;
            const Icon = config.icon;
            return (
              <Paper key={status} withBorder p="md">
                <Group gap="md">
                  <ThemeIcon color={config.color} variant="light" size={40}>
                    <Icon size={20} />
                  </ThemeIcon>
                  <Box>
                    <Text size="xs" c="dimmed" fw={500}>{status}</Text>
                    <Text fz="1.5rem" fw={700} c={`${config.color}.5`}>{count}</Text>
                  </Box>
                </Group>
              </Paper>
            );
          })}
        </SimpleGrid>

      </Stack>
    </Base>
  );
}