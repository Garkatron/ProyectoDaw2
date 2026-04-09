import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Paper, Group, Badge, Text, Stack, Button, Modal, Center, Rating 
} from "@mantine/core";
import { 
  Wrench, User, Clock, Banknote, Star 
} from "lucide-react";
import { AppointmentStatus, type Appointment } from "@limpora/common";
import { STATUS_CONFIG, NEXT_STATUSES_PROVIDER, NEXT_STATUSES_CLIENT } from "../appointments.constants";
import { useReviews } from "../../../../hooks/useReviews";

interface Props {
  appointment: Appointment;
  isProvider: boolean;
  onReviewSuccess: () => void;
  onStatusChange: (id: number, status: AppointmentStatus) => Promise<void>;
}

export const AppointmentCard = ({ appointment, isProvider, onReviewSuccess, onStatusChange }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [updating, setUpdating] = useState(false);
  const { handlePublishReview, reviewSubmitting, reviewError } = useReviews();

  const config = STATUS_CONFIG[appointment.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG[AppointmentStatus.Pending];
  const Icon = config.icon;
  const date = new Date(appointment.start_time);
  const end = new Date(appointment.end_time);
const nextStatuses = isProvider
  ? (NEXT_STATUSES_PROVIDER[appointment.status] ?? [])
  : (NEXT_STATUSES_CLIENT[appointment.status] ?? []);

  const handleStatusUpdate = async (status: AppointmentStatus) => {
    setUpdating(true);
    await onStatusChange(appointment.id, status);
    setUpdating(false);
  };

  return (
    <Paper withBorder p="md" shadow="xs" radius="md">
      <Group justify="space-between" mb="sm">
        <Badge color={config.color} variant="light" leftSection={<Icon size={12} />}>
          {t(`appointments.status.${appointment.status}`)}
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
              ? `${t("appointments.client")}: ${appointment.client_name ?? `#${appointment.client_id}`}`
              : `${t("appointments.provider")}: ${appointment.provider_name ?? `#${appointment.provider_id}`}`}
          </Text>
        </Group>

        <Group gap="xs">
          <Clock size={14} color="gray" />
          <Text size="sm">
            {date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })}
            {" – "}
            {end.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })}
          </Text>
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

      {nextStatuses.length > 0 && (
          <Group gap="xs" mt={4}>
            {nextStatuses.map((s) => (
              <Button
                key={s}
                size="xs"
                variant="light"
                color={STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.color ?? "gray"}
                loading={updating}
                onClick={() => handleStatusUpdate(s)}
              >
                {t("appointments.mark_as")} {t(`appointments.status.${s}`)}
              </Button>
            ))}
          </Group>
        )}

        <Button
          fullWidth
          size="xs"
          variant="light"
          color="blue"
          leftSection={<Star size={14} />}
          onClick={() => navigate("/review", { state: { appointmentId: appointment.id } })}
        >
          {t("appointments.see_reviews")}
        </Button>

        {!isProvider && appointment.status === AppointmentStatus.Completed && (
          <Button
            fullWidth
            size="xs"
            variant="light"
            color="yellow"
            leftSection={<Star size={14} />}
            onClick={() => setModalOpen(true)}
          >
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
          <Button color="yellow" onClick={async () => {
             const { error } = await handlePublishReview(appointment.id, content, rating);
             if (!error) { setModalOpen(false); onReviewSuccess(); }
          }} loading={reviewSubmitting}>
            {t("appointments.submit")}
          </Button>
        </Stack>
      </Modal>
    </Paper>
  );
};