import { useEffect, useState } from "react";
import { AppointmentStatus, UserRole, type Appointment } from "@limpora/common";
import { useTranslation } from "react-i18next";
import { AppointmentCard } from "./components/AppointmentCard";
import { useAuthStore } from "../../../stores/auth.store";
import { API } from "../../../lib/api";
import type { MarkedDate } from "../../../components/Calendar";
import Base from '../../../layouts/Base';
import { Badge, Center, Loader, Paper, ScrollArea, SimpleGrid, Stack, Text, Title, Group } from "@mantine/core";
import Calendar from "../../../components/Calendar";

export default function Appointments() {
  const { t } = useTranslation();
  const currentUser = useAuthStore((state) => state.user);
  const isProvider = currentUser?.role === UserRole.Provider;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    const { data, error } = await API.bookings.me.get({});
    if (error) setError(t("appointments.error_fetch"));
    else setAppointments(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (currentUser?.id) fetchAll();
  }, [currentUser]);

  const handleStatusChange = async (id: number, status: AppointmentStatus) => {
    try {
      await API.bookings.me({ id }).status.patch({ status });
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a)),
      );
    } catch {
      await fetchAll();
    }
  };

  const markedDates: MarkedDate[] = appointments.map((appt) => ({
    date: new Date(appt.start_time),
    status: appt.status as AppointmentStatus,
  }));

  const appointmentsOnSelectedDate = appointments.filter(
    (a) => new Date(a.start_time).toDateString() === selectedDate.toDateString(),
  );

  if (loading)
    return (
      <Base>
        <Center maw={1152} mx="auto" p="xl">
          <Loader size="sm" />
        </Center>
      </Base>
    );

  return (
    <Base>
      <Stack maw={1152} mx="auto" p="xl" gap="lg">
        <Group justify="space-between">
          <Title order={2}>{t("appointments.title")}</Title>
          {isProvider && (
            <Badge color="blue" variant="light" size="lg">
              {t("appointments.provider_view")}
            </Badge>
          )}
        </Group>

        {error && <Text c="red" size="sm">{error}</Text>}

        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
          <Paper withBorder p="lg" radius="md">
            <Calendar
              markedDates={markedDates}
              onDateClick={setSelectedDate}
              selectedDate={selectedDate}
            />
          </Paper>

          <Stack>
            <Text fw={700} fz="lg" c="dimmed">
              {selectedDate.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
            </Text>
            <ScrollArea mah={500}>
              <Stack gap="sm">
                {appointmentsOnSelectedDate.length > 0 ? (
                  appointmentsOnSelectedDate.map((appt) => (
                    <AppointmentCard
                      key={appt.id}
                      appointment={appt}
                      isProvider={isProvider}
                      onReviewSuccess={fetchAll}
                      onStatusChange={handleStatusChange}
                    />
                  ))
                ) : (
                  <Center py={50}>
                    <Text c="dimmed">{t("appointments.no_events")}</Text>
                  </Center>
                )}
              </Stack>
            </ScrollArea>
          </Stack>
        </SimpleGrid>
      </Stack>
    </Base>
  );
}