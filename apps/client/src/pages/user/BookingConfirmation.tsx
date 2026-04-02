import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Calendar, { type MarkedDate } from "../../components/Calendar";
import Base from "../../layouts/Base";
import { useAuthStore } from "../../stores/auth.store";
import lang from "../../utils/LangManager";
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
import { PaymentMethod, type Appointment, type ProviderService } from "@limpora/common";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import CheckoutForm from "../../components/CheckoutForm";


/** Formats a minute count as "1h 30m", "1h", "45 min", etc. */
function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m} min`;
}

const PAYMENT_METHODS_LIST = [
  { label: "Bizum", value: PaymentMethod.Bizum },
  { label: "Bank Transfer", value: PaymentMethod.BankTransfer },
  { label: "Paypal", value: PaymentMethod.Paypal },
  { label: "Tarjeta (Stripe)", value: PaymentMethod.Stripe },
];

type SlotState = "available" | "occupied" | "past" | "outside";

const statusColorMap: Record<string, string> = {
  Completed: "green",
  Pending: "yellow",
  "In Process": "blue",
};

function addMinutes(slot: string, minutes: number): string {
  const [h, m] = slot.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function slotToMinutes(slot: string): number {
  const [h, m] = slot.split(":").map(Number);
  return h * 60 + m;
}

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
        backgroundColor: selected
          ? "var(--mantine-color-default-color)"
          : undefined,
        transition: "all 0.15s",
      }}
    >
      <Text
        component="div"
        size="sm"
        fw={500}
        c={selected ? "var(--mantine-color-body)" : "dimmed"}
      >
        {children}
      </Text>
    </Paper>
  </UnstyledButton>
);

const getSlotStyles = (): Record<
  SlotState,
  { bg?: string; text: string; label?: string }
> => ({
  available: { text: "dimmed" },
  occupied: {
    bg: "var(--mantine-color-red-0)",
    text: "var(--mantine-color-red-6)",
    label: lang("booking.slot_states.occupied"),
  },
  past: {
    bg: "var(--mantine-color-gray-1)",
    text: "var(--mantine-color-gray-5)",
  },
  outside: {
    bg: "var(--mantine-color-gray-1)",
    text: "var(--mantine-color-gray-4)",
    label: lang("booking.slot_states.outside"),
  },
});

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
  const disabled =
    state === "occupied" || state === "past" || state === "outside";
  const styles = getSlotStyles()[state];
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
          backgroundColor: selected
            ? "var(--mantine-color-default-color)"
            : styles.bg,
          transition: "all 0.15s",
          opacity: state === "past" || state === "outside" ? 0.45 : 1,
        }}
      >
        <Text
          size="sm"
          fw={500}
          c={selected ? "var(--mantine-color-body)" : styles.text}
        >
          {slot}
        </Text>
        {!selected && styles.label && (
          <Text size="10px" c={styles.text} mt={2}>
            {styles.label}
          </Text>
        )}
      </Paper>
    </UnstyledButton>
  );
};

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
}) => {
  if (slots.length === 0) return null;
  return (
    <Box>
      <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb="xs">
        {label}
      </Text>
      <SimpleGrid cols={{ base: 4, sm: 6 }} spacing="xs">
        {slots.map((slot) => (
          <SlotButton
            key={slot}
            slot={slot}
            state={slotStates[slot] ?? "outside"}
            selected={selectedTime === slot}
            onClick={() => onSelect(slot)}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const providerId = location.state?.userId;

  const [markedDates, setMarkedDates] = useState<MarkedDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loadingAppts, setLoadingAppts] = useState(false);
  const [providerServices, setProviderServices] = useState<ProviderService[]>(
    [],
  );
  const [loadingServices, setLoadingServices] = useState(false);
  const [selectedService, setSelectedService] =
    useState<ProviderService | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.BankTransfer,
  );
  const [allSlots, setAllSlots] = useState<string[]>([]);
  const [occupiedSlots, setOccupiedSlots] = useState<Set<string>>(new Set());
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    if (!providerId) return;
    (async () => {
      setLoadingAppts(true);
      try {
        const { data } = await API.bookings.me.get();
        const appointments: Appointment[] = data ?? [];
        const dateMap: Record<string, Appointment[]> = {};
        appointments.forEach((a) => {
          const k = new Date(a.start_time).toDateString();
          (dateMap[k] ??= []).push(a);
        });
        const marks: MarkedDate[] = [];
        Object.values(dateMap).forEach((appts) => {
          marks.push({
            date: new Date(appts[0].start_time),
            status: appts[0].status,
          });
        });
        setMarkedDates(marks);
      } finally {
        setLoadingAppts(false);
      }
    })();
  }, [providerId]);

  useEffect(() => {
    if (!providerId) return;
    (async () => {
      setLoadingServices(true);
      try {
        const { data } = await API.providers({
          provider_id: String(providerId),
        }).services.get();
        setProviderServices(data ?? []);
      } finally {
        setLoadingServices(false);
      }
    })();
  }, [providerId]);

  useEffect(() => {
    if (!providerId || !selectedDate) return;
    (async () => {
      setLoadingSlots(true);
      setAllSlots([]);
      setOccupiedSlots(new Set());
      setSelectedTime(null);
      try {
        // Use local date parts to avoid UTC offset shifting the day
        const pad2 = (n: number) => String(n).padStart(2, "0");
        const dateStr = `${selectedDate.getFullYear()}-${pad2(selectedDate.getMonth() + 1)}-${pad2(selectedDate.getDate())}`;
        const { data } = await API.bookings
          .provider({ provider_id: String(providerId) })
          .availability.get({ query: { date: dateStr } });
        setAllSlots(data?.all_slots ?? []);
        setOccupiedSlots(new Set(data?.occupied_slots ?? []));
      } finally {
        setLoadingSlots(false);
      }
    })();
  }, [providerId, selectedDate]);

  const SLOT_STEP = 15;

  const slotStates: Record<string, SlotState> = (() => {
    if (!selectedDate || allSlots.length === 0) return {};
    const now = new Date();
    const durationMin = selectedService?.duration_minutes ?? 0;

    return Object.fromEntries(
      allSlots.map((slot) => {
        const [h, m] = slot.split(":").map(Number);
        const slotDate = new Date(selectedDate);
        slotDate.setHours(h, m, 0, 0);

        if (slotDate < now) return [slot, "past"];
        if (occupiedSlots.has(slot)) return [slot, "occupied"];

        if (!selectedService || durationMin === 0)
          return [slot, "available"];

        const startMin = slotToMinutes(slot);
        const endMin = startMin + durationMin;

        if (endMin > 24 * 60) return [slot, "outside"];

        for (let cursor = startMin; cursor < endMin; cursor += SLOT_STEP) {
          const key = `${String(Math.floor(cursor / 60)).padStart(2, "0")}:${String(cursor % 60).padStart(2, "0")}`;
          if (occupiedSlots.has(key)) return [slot, "occupied"];
        }

        return [slot, "available"];
      }),
    );
  })();

  const morningSlots = allSlots.filter((s) => slotToMinutes(s) < 14 * 60);
  const afternoonSlots = allSlots.filter((s) => slotToMinutes(s) >= 14 * 60);

  const handleDateClick = (date: Date) => {
    if (date < new Date()) return;
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (slot: string) => {
    const state = slotStates[slot];
    if (state === "occupied" || state === "past" || state === "outside") return;
    setSelectedTime(slot);
  };

  const canConfirm =
    selectedDate && selectedTime && selectedService && paymentMethod;

  const handleConfirm = async () => {
    if (!canConfirm || !currentUser) return;

    if (paymentMethod === PaymentMethod.Stripe && (!stripe || !elements)) {
      setError("El sistema de pagos no está listo. Inténtalo de nuevo.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const pad = (n: number) => String(n).padStart(2, "0");
      const start_time = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}T${selectedTime}:00`;

      const { data: appointment, error: errAppt } = await API.bookings.me.post({
        provider_id: providerId,
        service_id: selectedService.service_id,
        start_time,
        payment_method: paymentMethod,
      });

      if (errAppt || !appointment) throw new Error("Error al crear la reserva");

      if (paymentMethod === PaymentMethod.Stripe) {
        // 1. Calculate safely (Ensure price_per_h exists)
        const unitPrice = selectedService.price_per_h ?? 0;
        const totalAmount = Math.round(unitPrice * 100);

        if (totalAmount <= 0) {
          throw new Error("El precio del servicio no es válido.");
        }

        // 2. Call your backend to create the PaymentIntent
        const { data: paymentData, error: errPay } = await API.payment.post({
          amount: totalAmount
        });

        if (errPay || !paymentData?.client_secret) {
          console.error("Backend Error:", errPay);
          throw new Error("No se pudo iniciar el pago con el servidor.");
        }

        // 3. Use Stripe.js to handle the actual card logic
        const cardElement = elements!.getElement(CardElement);

        // Use the client_secret returned from your backend
        const result = await stripe!.confirmCardPayment(paymentData.client_secret, {
          payment_method: {
            card: cardElement!,
            billing_details: {
              name: currentUser.name
            }
          },
        });

        if (result.error) {
          throw new Error(result.error.message);
        }

        // 4. Confirm the booking on your backend once Stripe clears the charge
        if (result.paymentIntent?.status === "succeeded") {
          const { error: confirmErr } = await API.payment.confirm.post({
            appointmentId: appointment.id,
            paymentIntentId: result.paymentIntent.id
          });

          if (confirmErr) throw new Error("Pago completado, pero falló la confirmación de la cita.");
        }
      }

      setSuccess(true);
      setTimeout(() => navigate("/appointments"), 2000);

    } catch (e: any) {
      setError(e.message || "Ocurrió un error inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Base>
      <Stack maw={768} mx="auto" p="lg" gap="lg">
        <Box>
          <Title order={1} fz="1.5rem" fw={600}>
            {lang("booking.title")}
          </Title>
        </Box>

        {/* Paso 1 — Calendario */}
        <Paper withBorder p="lg" shadow="sm">
          <Text fw={600} mb="sm">
            {lang("booking.step1")}
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
                  {lang(`booking.status.${label}`)}
                </Text>
              </Group>
            ))}
          </Group>
          {loadingAppts && (
            <Text size="xs" c="dimmed" mb="xs">
              {lang("booking.loading_appointments")}
            </Text>
          )}
          <Calendar
            markedDates={markedDates}
            onDateClick={handleDateClick}
            selectedDate={selectedDate ?? new Date()}
          />
        </Paper>

        {/* Paso 2 — Servicio */}
        {selectedDate && (
          <Paper withBorder p="lg" shadow="sm">
            <Text fw={600} mb="lg">
              {lang("booking.step2")}
            </Text>
            {loadingServices ? (
              <Stack gap="xs">
                <Skeleton height={48} />
                <Skeleton height={48} />
              </Stack>
            ) : providerServices.length === 0 ? (
              <Text size="sm" c="dimmed" fs="italic">
                {lang("booking.no_services")}
              </Text>
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
                {providerServices.map((svc) => (
                  <ToggleButton
                    key={svc.service_id}
                    selected={selectedService?.service_id === svc.service_id}
                    onClick={() => {
                      setSelectedService(svc);
                      setSelectedTime(null);
                    }}
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
                        {svc.service_name ??
                          svc.name ??
                          `Servicio #${svc.service_id}`}
                      </Text>
                      <Group gap={6}>
                        {svc.duration_minutes && (
                          <Text size="xs" c="dimmed">
                            {formatDuration(svc.duration_minutes)}
                          </Text>
                        )}
                        {svc.price != null && (
                          <Text size="xs" fw={600} c="dimmed">
                            {svc.price} €
                          </Text>
                        )}
                      </Group>
                    </Group>
                  </ToggleButton>
                ))}
              </SimpleGrid>
            )}
          </Paper>
        )}

        {/* Paso 3 — Hora */}
        {selectedDate && selectedService && (
          <Paper withBorder p="lg" shadow="sm">
            <Group justify="space-between" mb="md">
              <Text fw={600}>{lang("booking.step3")}</Text>
              <Group gap="md">
                {(
                  [
                    {
                      key: "available",
                      color: "var(--mantine-color-default-border)",
                    },
                    { key: "occupied", color: "var(--mantine-color-red-4)" },
                    { key: "past", color: "var(--mantine-color-gray-4)" },
                  ] as const
                ).map(({ key, color }) => (
                  <Group key={key} gap={6}>
                    <Box
                      w={10}
                      h={10}
                      style={{ borderRadius: "50%", backgroundColor: color }}
                    />
                    <Text size="xs" c="dimmed">
                      {lang(`booking.slot_states.${key}`)}
                    </Text>
                  </Group>
                ))}
              </Group>
            </Group>

            <Text size="xs" c="dimmed" mb="md">
              ℹ️{" "}
              {lang("booking.slot_info").replace(
                "{duration}",
                formatDuration(selectedService.duration_minutes),
              )}
            </Text>

            {loadingSlots ? (
              <Stack gap="xs">
                <Skeleton height={16} width={60} />
                <SimpleGrid cols={{ base: 4, sm: 6 }} spacing="xs">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} height={48} />
                  ))}
                </SimpleGrid>
              </Stack>
            ) : allSlots.length === 0 ? (
              <Text size="sm" c="dimmed" fs="italic">
                {lang("booking.no_slots")}
              </Text>
            ) : (
              <Stack gap="lg">
                <SlotGroup
                  label={lang("booking.morning")}
                  slots={morningSlots}
                  slotStates={slotStates}
                  selectedTime={selectedTime}
                  onSelect={handleTimeSelect}
                />
                <SlotGroup
                  label={lang("booking.afternoon")}
                  slots={afternoonSlots}
                  slotStates={slotStates}
                  selectedTime={selectedTime}
                  onSelect={handleTimeSelect}
                />
              </Stack>
            )}
          </Paper>
        )}

        {/* Paso 4 — Pago */}
        {selectedDate && selectedService && selectedTime && (
          <Paper withBorder p="lg" shadow="sm">
            <Text fw={600} mb="md">
              {lang("booking.step4")}
            </Text>

            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs" mb="md">
              {PAYMENT_METHODS_LIST.map((method) => (
                <ToggleButton
                  key={method.value}
                  selected={paymentMethod === method.value}
                  onClick={() => setPaymentMethod(method.value)}
                >
                  {method.label}
                </ToggleButton>
              ))}
            </SimpleGrid>

            {paymentMethod === PaymentMethod.Stripe && (
              <Box mt="xl">
                <CheckoutForm
                  amount={selectedService.price * 100}
                />
              </Box>
            )}
          </Paper>
        )}
        {canConfirm && (
          <Paper withBorder p="lg" shadow="sm">
            <Text fw={600} mb="md">
              {lang("booking.summary")}
            </Text>
            <Stack gap={6} mb="lg">
              <Text size="sm">
                📅{" "}
                <Text span fw={500}>
                  {lang("booking.summary_date")}:
                </Text>{" "}
                {selectedDate.toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
              <Text size="sm">
                🕐{" "}
                <Text span fw={500}>
                  {lang("booking.summary_time")}:
                </Text>{" "}
                {selectedTime} →{" "}
                {addMinutes(selectedTime, selectedService.duration_minutes)}
              </Text>
              <Text size="sm">
                🛠{" "}
                <Text span fw={500}>
                  {lang("booking.summary_service")}:
                </Text>{" "}
                {selectedService.service_name ??
                  selectedService.name ??
                  `#${selectedService.service_id}`}
                {selectedService.price != null &&
                  ` — ${selectedService.price} €`}
              </Text>
              <Text size="sm">
                💳{" "}
                <Text span fw={500}>
                  {lang("booking.summary_payment")}:
                </Text>{" "}
                {lang(`booking.payment_methods.${paymentMethod}`)}
              </Text>
            </Stack>

            {error && (
              <Alert color="red" mb="md">
                {error}
              </Alert>
            )}
            {success && (
              <Alert color="green" mb="md">
                {lang("booking.success")}
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
              {lang("booking.confirm")}
            </Button>
          </Paper>
        )}
      </Stack>
    </Base>
  );
}
