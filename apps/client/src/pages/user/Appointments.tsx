import { useEffect, useState } from "react";
import { useAuthStore } from "../../stores/auth.store";
import Base from "../../layouts/Base";
import Calendar, { type MarkedDate } from "../../components/Calendar";
import {
  CheckCircle,
  Clock,
  Banknote,
  RefreshCw,
  Star,
  User,
  Wrench,
  MapPin,
} from "lucide-react";
import {
  Badge,
  Box,
  Button,
  Center,
  Group,
  Loader,
  Menu,
  Modal,
  Paper,
  Rating,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { API } from "../../lib/api";
import { AppointmentStatus, UserRole, type Appointment } from "@limpora/common";
import { useReviews } from "./UserPanel/useReviews";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const useStatusConfig = () => {
  const { t } = useTranslation();
  return {
    Completed:   { color: "green",  icon: CheckCircle, label: t("appointments.status.Completed") },
    Pending:     { color: "yellow", icon: Clock,       label: t("appointments.status.Pending") },
    "In Process":{ color: "blue",   icon: RefreshCw,   label: t("appointments.status.In Process") },
    Cancelled:   { color: "red",    icon: Clock,       label: t("appointments.status.Cancelled") },
  } as Record<string, { color: string; icon: typeof Clock; label: string }>;
};


// ─── AppointmentCard ──────────────────────────────────────────────────────────

const AppointmentCard = ({
  appointment,
  isProvider,
  onReviewSuccess,
  onStatusChange,
}: {
  appointment: Appointment;
  isProvider: boolean;
  onReviewSuccess: () => void;
  onStatusChange: (id: number, status: AppointmentStatus) => Promise<void>;
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [updating, setUpdating] = useState(false);
  const { handlePublishReview, reviewSubmitting, reviewError } = useReviews();
  const navigate = useNavigate();
  
  const { t } = useTranslation();
  const statusConfig = useStatusConfig();
  
  const Icon = config.icon;
  const date = new Date(appointment.start_time);
  const end = new Date(appointment.end_time);



  const nextStatuses = NEXT_STATUSES[appointment.status] ?? [];

  const handleStatusChange = async (status: AppointmentStatus) => {
    setUpdating(true);
    await onStatusChange(appointment.id, status);
    setUpdating(false);
  };

  const onSendReview = async () => {
    const { error } = await handlePublishReview(
      appointment.id,
      content,
      rating,
    );
    if (!error) {
      setModalOpen(false);
      onReviewSuccess();
    }
  };

  return (
 <Paper withBorder p="md" shadow="xs" radius="md">
      <Group justify="space-between" mb="sm">
        <Badge color={config.color} variant="light" leftSection={<Icon size={12} />}>
          {config.label}
        </Badge>
        <Text size="xs" c="dimmed">
          {date.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
        </Text>
      </Group>

      <Stack gap={6}>
        <Group gap="xs">
          <Wrench size={14} color="gray" />
          <Text fw={600} size="sm">{appointment.service_name}</Text>
        </Group>

        <Group gap="xs">
          <User size={14} color="gray" />
          <Text size="sm" c="dimmed">
            {isProvider
              ? `${t("appointments.client")}: ${appointment.client_name ?? `#${appointment.user_id}`}`
              : `${t("appointments.provider")}: ${appointment.provider_name ?? `#${appointment.provider_id}`}`}
          </Text>
        </Group>

        <Group gap="xs">
          <Clock size={14} color="gray" />
          <Text size="sm">
            {date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
            {" – "}
            {end.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
          </Text>
          {appointment.travel_buffer_min > 0 && (
            <Text size="xs" c="dimmed">
              ({t("appointments.travel_buffer", { count: appointment.travel_buffer_min })})
            </Text>
          )}
        </Group>

        <Group justify="space-between">
          <Group gap="xs">
            <Banknote size={14} color="gray" />
            <Text size="sm" fw={700}>€{appointment.total_price.toFixed(2)}</Text>
            {isProvider && (
              <Text size="xs" c="dimmed">
                ({t("appointments.net")}: €{appointment.provider_net.toFixed(2)})
              </Text>
            )}
          </Group>
          <Text size="xs" c="dimmed" fs="italic">{appointment.payment_method}</Text>
        </Group>

        {isProvider && nextStatuses.length > 0 && (
          <Group gap="xs" mt={4}>
            {nextStatuses.map((s) => (
              <Button
                key={s}
                size="xs"
                variant="light"
                color={statusConfig[s]?.color ?? "gray"}
                loading={updating}
                onClick={() => handleStatusChange(s)}
              >
                {t("appointments.mark_as")} {statusConfig[s]?.label ?? s}
              </Button>
            ))}
          </Group>
        )}

        <Button fullWidth size="xs" variant="light" color="blue" leftSection={<Star size={14} />}
          onClick={() => navigate("/review", { state: { appointmentId: appointment.id } })}>
          {t("appointments.see_reviews")}
        </Button>

        {!isProvider && appointment.status === AppointmentStatus.Completed && (
          <Button fullWidth size="xs" variant="light" color="yellow" leftSection={<Star size={14} />}
            onClick={() => setModalOpen(true)}>
            {t("appointments.rate_service")}
          </Button>
        )}
      </Stack>

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title={t("appointments.modal_title")} centered>
        <Stack>
          <Center><Rating value={rating} onChange={setRating} size="lg" /></Center>
          <textarea
            placeholder={t("appointments.comment_placeholder")}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ width: "100%", minHeight: 80, padding: 8, borderRadius: 8, border: "1px solid #ddd" }}
          />
          {reviewError && <Text c="red" size="xs">{reviewError}</Text>}
          <Button color="yellow" onClick={onSendReview} loading={reviewSubmitting}>
            {t("appointments.submit")}
          </Button>
        </Stack>
      </Modal>
    </Paper>
  );
  
};

// ─── Página ───────────────────────────────────────────────────────────────────

export default function Appointments() {
  const currentUser = useAuthStore((state) => state.user);
  const isProvider = currentUser?.role === UserRole.Provider;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { t } = useTranslation();

  const fetchAll = async () => {
    setLoading(true);
    const { data, error } = await API.bookings.me.get({});
    if (error) setError("Error al obtener las citas.");
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
    (a) =>
      new Date(a.start_time).toDateString() === selectedDate.toDateString(),
  );

  if (loading)
    return (
      <Base>
        <Center h="80vh">
          <Loader />
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
            <Calendar markedDates={markedDates} onDateClick={setSelectedDate} selectedDate={selectedDate} />
          </Paper>

          <Stack>
            <Text fw={700} fz="lg" c="dimmed">
              {selectedDate.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
            </Text>
            <ScrollArea mah={500}>
              <Stack gap="sm">
                {appointmentsOnSelectedDate.length > 0 ? (
                  appointmentsOnSelectedDate.map((appt) => (
                    <AppointmentCard key={appt.id} appointment={appt} isProvider={isProvider}
                      onReviewSuccess={fetchAll} onStatusChange={handleStatusChange} />
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
