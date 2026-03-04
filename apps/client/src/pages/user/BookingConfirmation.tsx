import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Calendar, { type MarkedDate } from "../../components/Calendar";
import Base from "../../layouts/Base";
import { useAuthStore } from "../../stores/auth.store";
import {
  Alert,
  Box,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { API } from "../../lib/api";
import { PaymentMethod, type Appointment } from "@limpora/common";

interface ProviderService {
  service_id: number;
  user_id: number;
  price: number;
  is_active: boolean;
  service_name?: string;
  name?: string;
}

const PAYMENT_METHODS = ["Bizum", "Bank Transfer", "Paypal"];

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00",
];

const MORNING_SLOTS = TIME_SLOTS.filter((s) => parseInt(s) < 14);
const AFTERNOON_SLOTS = TIME_SLOTS.filter((s) => parseInt(s) >= 14);

type SlotState = "available" | "occupied" | "past";

const statusColorMap: Record<string, string> = {
  Completed: "green",
  Pending: "yellow",
  "In Process": "blue",
};

// ─── Toggle genérico ────────────────────────────────────────────────────────

const ToggleButton = ({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <UnstyledButton onClick={onClick} style={{ width: "100%" }}>
    <Paper
      withBorder
      p="sm"
      ta="center"
      style={{
        cursor: "pointer",
        backgroundColor: selected ? "var(--mantine-color-default-color)" : undefined,
        transition: "all 0.15s",
      }}
    >
      <Text component="div" size="sm" fw={500} c={selected ? "var(--mantine-color-body)" : "dimmed"}>
        {children}
      </Text>
    </Paper>
  </UnstyledButton>
);

// ─── Slot de hora con estado visual ─────────────────────────────────────────

const SlotButton = ({
  slot,
  state,
  selected,
  onClick,
}: {
  slot: string;
  state: SlotState;
  selected: boolean;
  onClick: () => void;
}) => {
  const disabled = state !== "available";

  const bg = selected
    ? "var(--mantine-color-default-color)"
    : state === "occupied"
    ? "var(--mantine-color-red-0)"
    : state === "past"
    ? "var(--mantine-color-gray-1)"
    : undefined;

  const textColor = selected
    ? "var(--mantine-color-body)"
    : state === "occupied"
    ? "var(--mantine-color-red-6)"
    : state === "past"
    ? "var(--mantine-color-gray-5)"
    : "dimmed";

  return (
    <UnstyledButton
      onClick={disabled ? undefined : onClick}
      style={{ width: "100%", cursor: disabled ? "not-allowed" : "pointer" }}
    >
      <Paper
        withBorder
        p="xs"
        ta="center"
        style={{
          backgroundColor: bg,
          transition: "all 0.15s",
          opacity: state === "past" ? 0.5 : 1,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Text size="sm" fw={500} c={textColor}>
          {slot}
        </Text>
        {state === "occupied" && (
          <Text size="10px" c="red.5" mt={2}>
            Ocupado
          </Text>
        )}
      </Paper>
    </UnstyledButton>
  );
};

// ─── Grupo de slots (mañana / tarde) ────────────────────────────────────────

const SlotGroup = ({
  label,
  slots,
  slotStates,
  selectedTime,
  onSelect,
}: {
  label: string;
  slots: string[];
  slotStates: Record<string, SlotState>;
  selectedTime: string | null;
  onSelect: (slot: string) => void;
}) => (
  <Box>
    <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb="xs">
      {label}
    </Text>
    <SimpleGrid cols={{ base: 4, sm: 6 }} spacing="xs">
      {slots.map((slot) => (
        <SlotButton
          key={slot}
          slot={slot}
          state={slotStates[slot] ?? "available"}
          selected={selectedTime === slot}
          onClick={() => onSelect(slot)}
        />
      ))}
    </SimpleGrid>
  </Box>
);

// ─── Página principal ────────────────────────────────────────────────────────

export default function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);

  const providerId = location.state?.userId;

  const [markedDates, setMarkedDates] = useState<MarkedDate[]>([]);
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loadingAppts, setLoadingAppts] = useState(false);

  const [providerServices, setProviderServices] = useState<ProviderService[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<ProviderService | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.BankTransfer);

  // Disponibilidad
  const [occupiedSlots, setOccupiedSlots] = useState<Set<string>>(new Set());
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ── Citas del usuario (para marcar calendario) ──────────────────────────
  useEffect(() => {
    if (!providerId) return;
    const fetchAppointments = async () => {
      setLoadingAppts(true);
      try {
        const { data } = await API.bookings.me.get();
        const appointments: Appointment[] = data ?? [];

        const dateMap: Record<string, Appointment[]> = {};
        appointments.forEach((appt) => {
          const key = new Date(appt.date_time).toDateString();
          if (!dateMap[key]) dateMap[key] = [];
          dateMap[key].push(appt);
        });

        const marks: MarkedDate[] = [];
        const blocked = new Set<string>();

        Object.entries(dateMap).forEach(([key, appts]) => {
          const statuses = appts.map((a) => a.status?.toLowerCase());
          let status = "Pending";
          if (statuses.every((s) => s === "completed" || s === "cancelled"))
            status = "Completed";
          else if (statuses.some((s) => s === "in process"))
            status = "In Process";

          marks.push({ date: new Date(appts[0].date_time), status: appts[0].status });
          if (status === "Pending" || status === "In Process") blocked.add(key);
        });

        setMarkedDates(marks);
        setBlockedDates(blocked);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      } finally {
        setLoadingAppts(false);
      }
    };
    fetchAppointments();
  }, [providerId]);

  // ── Servicios del proveedor ──────────────────────────────────────────────
  useEffect(() => {
    if (!providerId) return;
    const fetchServices = async () => {
      setLoadingServices(true);
      try {
        const { data } = await API.providers({ provider_id: String(providerId) }).services.get();
        setProviderServices(data ?? []);
      } catch (err) {
        console.error("Error fetching provider services:", err);
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, [providerId]);

  // ── Slots ocupados del proveedor para la fecha seleccionada ─────────────
  useEffect(() => {
    if (!providerId || !selectedDate) return;
    const fetchOccupied = async () => {
      setLoadingSlots(true);
      setOccupiedSlots(new Set());
      try {
        const dateStr = selectedDate.toISOString().split("T")[0]; // "YYYY-MM-DD"
        const { data } = await API.bookings
          .provider({ provider_id: String(providerId) })
          .availability.get({ query: { date: dateStr } });

        setOccupiedSlots(new Set(data?.occupied_slots ?? []));
      } catch (err) {
        console.error("Error fetching occupied slots:", err);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchOccupied();
  }, [providerId, selectedDate]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const getSlotState = (slot: string, date: Date): SlotState => {
    const [h, m] = slot.split(":").map(Number);
    const slotDate = new Date(date);
    slotDate.setHours(h, m, 0, 0);
    if (slotDate < new Date()) return "past";
    if (occupiedSlots.has(slot)) return "occupied";
    return "available";
  };

  const slotStates: Record<string, SlotState> = selectedDate
    ? Object.fromEntries(TIME_SLOTS.map((s) => [s, getSlotState(s, selectedDate)]))
    : {};

  const handleDateClick = (date: Date) => {
    if (blockedDates.has(date.toDateString())) return;
    if (date < new Date()) return;
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (slot: string) => {
    if (slotStates[slot] !== "available") return;
    setSelectedTime(slot);
  };

  const canConfirm = selectedDate && selectedTime && selectedService && paymentMethod;

  const handleConfirm = async () => {
    if (!canConfirm || !currentUser) return;
    setSubmitting(true);
    setError(null);
    try {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const dateTime = new Date(selectedDate);
      dateTime.setHours(hours, minutes, 0, 0);

      await API.bookings.me.post({
        provider_id: providerId,
        service_id: selectedService.service_id,
        start_time: dateTime.toISOString(),
        payment_method: paymentMethod as PaymentMethod,
        duration_hours: 2,
      });

      setSuccess(true);
      setTimeout(() => navigate(-1), 2000);
    } catch (err) {
      console.error("Error al confirmar cita:", err);
      setError("No se pudo confirmar la cita. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <Base>
      <Stack maw={768} mx="auto" p="lg" gap="lg">
        <Box>
          <Title order={1} fz="1.5rem" fw={600}>
            Nueva reserva
          </Title>
          <Text size="sm" c="dimmed" mt={4}>
            Proveedor ID:{" "}
            <Text span fw={500}>
              {providerId}
            </Text>
          </Text>
        </Box>

        {/* Paso 1 — Calendario */}
        <Paper withBorder p="lg" shadow="sm">
          <Text fw={600} mb="sm">
            1. Selecciona un día
          </Text>

          <Group gap="md" mb="md">
            {Object.entries(statusColorMap).map(([label, color]) => (
              <Group key={label} gap={6}>
                <Box
                  w={10}
                  h={10}
                  style={{
                    borderRadius: "50%",
                    backgroundColor: `var(--mantine-color-${color}-5)`,
                  }}
                />
                <Text size="xs" c="dimmed">
                  {label}
                </Text>
              </Group>
            ))}
          </Group>

          {loadingAppts && (
            <Text size="xs" c="dimmed" mb="xs">
              Cargando disponibilidad...
            </Text>
          )}

          <Calendar
            markedDates={markedDates}
            onDateClick={handleDateClick}
            selectedDate={selectedDate ?? new Date()}
          />
        </Paper>

        {/* Paso 2 — Hora */}
        {selectedDate && (
          <Paper withBorder p="lg" shadow="sm">
            <Group justify="space-between" mb="md">
              <Text fw={600}>2. Selecciona una hora</Text>
              {/* Leyenda de slots */}
              <Group gap="md">
                {(
                  [
                    { label: "Disponible", color: "var(--mantine-color-default-border)" },
                    { label: "Ocupado", color: "var(--mantine-color-red-4)" },
                    { label: "Pasado", color: "var(--mantine-color-gray-4)" },
                  ] as const
                ).map(({ label, color }) => (
                  <Group key={label} gap={6}>
                    <Box
                      w={10}
                      h={10}
                      style={{ borderRadius: "50%", backgroundColor: color }}
                    />
                    <Text size="xs" c="dimmed">
                      {label}
                    </Text>
                  </Group>
                ))}
              </Group>
            </Group>

            {loadingSlots ? (
              <Stack gap="xs">
                <Skeleton height={16} width={60} />
                <SimpleGrid cols={{ base: 4, sm: 6 }} spacing="xs">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} height={48} />
                  ))}
                </SimpleGrid>
              </Stack>
            ) : (
              <Stack gap="lg">
                <SlotGroup
                  label="Mañana"
                  slots={MORNING_SLOTS}
                  slotStates={slotStates}
                  selectedTime={selectedTime}
                  onSelect={handleTimeSelect}
                />
                <SlotGroup
                  label="Tarde"
                  slots={AFTERNOON_SLOTS}
                  slotStates={slotStates}
                  selectedTime={selectedTime}
                  onSelect={handleTimeSelect}
                />
              </Stack>
            )}
          </Paper>
        )}

        {/* Paso 3 — Servicio y pago */}
        {selectedDate && selectedTime && (
          <Paper withBorder p="lg" shadow="sm">
            <Text fw={600} mb="lg">
              3. Detalles de la reserva
            </Text>
            <Stack gap="lg">
              <Box>
                <Text size="sm" fw={500} c="dimmed" mb="xs">
                  Servicio
                </Text>
                {loadingServices ? (
                  <Stack gap="xs">
                    <Skeleton height={48} />
                    <Skeleton height={48} />
                  </Stack>
                ) : providerServices.length === 0 ? (
                  <Text size="sm" c="dimmed" fs="italic">
                    Este proveedor no tiene servicios disponibles.
                  </Text>
                ) : (
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
                    {providerServices.map((svc) => (
                      <ToggleButton
                        key={svc.service_id}
                        selected={selectedService?.service_id === svc.service_id}
                        onClick={() => setSelectedService(svc)}
                      >
                        <Group justify="space-between">
                          <Text
                            size="sm"
                            fw={500}
                            c={
                              selectedService?.service_id === svc.service_id
                                ? "var(--mantine-color-body)"
                                : "dimmed"
                            }
                          >
                            {svc.service_name ?? svc.name ?? `Servicio #${svc.service_id}`}
                          </Text>
                          {svc.price != null && (
                            <Text size="xs" fw={600} c="dimmed">
                              {svc.price} €
                            </Text>
                          )}
                        </Group>
                      </ToggleButton>
                    ))}
                  </SimpleGrid>
                )}
              </Box>

              <Box>
                <Text size="sm" fw={500} c="dimmed" mb="xs">
                  Método de pago
                </Text>
                <SimpleGrid cols={3} spacing="xs">
                  {PAYMENT_METHODS.map((method) => (
                    <ToggleButton
                      key={method}
                      selected={paymentMethod === method}
                      onClick={() => setPaymentMethod(method)}
                    >
                      {method}
                    </ToggleButton>
                  ))}
                </SimpleGrid>
              </Box>
            </Stack>
          </Paper>
        )}

        {/* Resumen + Confirmar */}
        {canConfirm && (
          <Paper withBorder p="lg" shadow="sm">
            <Text fw={600} mb="md">
              Resumen
            </Text>
            <Stack gap={6} mb="lg">
              <Text size="sm">
                📅 <Text span fw={500}>Fecha:</Text>{" "}
                {selectedDate.toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
              <Text size="sm">
                🕐 <Text span fw={500}>Hora:</Text> {selectedTime}
              </Text>
              <Text size="sm">
                🛠 <Text span fw={500}>Servicio:</Text>{" "}
                {selectedService.service_name ?? selectedService.name ?? `#${selectedService.service_id}`}
                {selectedService.price != null && ` — ${selectedService.price} €`}
              </Text>
              <Text size="sm">
                💳 <Text span fw={500}>Pago:</Text> {paymentMethod}
              </Text>
            </Stack>

            {error && <Alert color="red" mb="md">{error}</Alert>}
            {success && (
              <Alert color="green" mb="md">
                ✅ Cita confirmada. Redirigiendo...
              </Alert>
            )}

            <Button
              onClick={handleConfirm}
              disabled={submitting || success}
              loading={submitting}
              variant="default"
              size="md"
              fullWidth
            >
              Confirmar reserva
            </Button>
          </Paper>
        )}
      </Stack>
    </Base>
  );
}