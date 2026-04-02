import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
  Alert, Box, Button, Divider, Group, Paper, SimpleGrid,
  Skeleton, Stack, Text, Title, UnstyledButton,
} from "@mantine/core";

// --- Componentes y Utilidades Propias ---
import Calendar, { type MarkedDate } from "../../components/Calendar";
import Base from "../../layouts/Base";
import CheckoutForm from "../../components/CheckoutForm";
import { useAuthStore } from "../../stores/auth.store";
import lang from "../../utils/LangManager";
import { API } from "../../lib/api";
import { PaymentMethod, type Appointment, type ProviderService } from "@limpora/common";

// ==========================================
// UTILIDADES Y CONSTANTES
// ==========================================

const SLOT_STEP = 15;

const PAYMENT_METHODS_LIST = [
  { label: "Bizum", value: PaymentMethod.Bizum },
  { label: "Bank Transfer", value: PaymentMethod.BankTransfer },
  { label: "Paypal", value: PaymentMethod.Paypal },
  { label: "Tarjeta (Stripe)", value: PaymentMethod.Stripe },
];

const statusColorMap: Record<string, string> = {
  Completed: "green",
  Pending: "yellow",
  "In Process": "blue",
};

// Formatea minutos a "1h 30m"
function formatDuration(minutes?: number): string {
  if (!minutes || minutes <= 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m} min`;
}

// Calcula el precio real del servicio (Fijo vs Por Hora)
function calculateServicePrice(service?: ProviderService | null): number {
  if (!service) return 0;
  // 1. Si tiene precio fijo asignado, lo usamos
  if (service.price != null && service.price > 0) return service.price;
  // 2. Si tiene precio por hora, calculamos la proporción según los minutos
  if (service.price_per_h != null && service.duration_minutes != null) {
    return (service.price_per_h / 60) * service.duration_minutes;
  }
  return 0;
}

function addMinutes(slot: string, minutes: number): string {
  const [h, m] = slot.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function slotToMinutes(slot: string): number {
  const [h, m] = slot.split(":").map(Number);
  return h * 60 + m;
}

// ==========================================
// SUB-COMPONENTES UI
// ==========================================

type SlotState = "available" | "occupied" | "past" | "outside";

const getSlotStyles = (): Record<SlotState, { bg?: string; text: string; label?: string }> => ({
  available: { text: "dimmed" },
  occupied: { bg: "var(--mantine-color-red-0)", text: "var(--mantine-color-red-6)", label: lang("booking.slot_states.occupied") },
  past: { bg: "var(--mantine-color-gray-1)", text: "var(--mantine-color-gray-5)" },
  outside: { bg: "var(--mantine-color-gray-1)", text: "var(--mantine-color-gray-4)", label: lang("booking.slot_states.outside") },
});

const ToggleButton = ({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode; }) => (
  <UnstyledButton onClick={onClick} style={{ width: "100%" }}>
    <Paper
      withBorder p="sm" ta="center"
      style={{
        cursor: "pointer",
        backgroundColor: selected ? "var(--mantine-color-default-color)" : undefined,
        transition: "all 0.15s",
      }}
    >
      <Text size="sm" fw={500} c={selected ? "var(--mantine-color-body)" : "dimmed"}>
        {children}
      </Text>
    </Paper>
  </UnstyledButton>
);

const SlotButton = ({ slot, state, selected, onClick }: { slot: string; state: SlotState; selected: boolean; onClick: () => void; }) => {
  const disabled = state === "occupied" || state === "past" || state === "outside";
  const styles = getSlotStyles()[state];
  return (
    <UnstyledButton onClick={disabled ? undefined : onClick} style={{ width: "100%", cursor: disabled ? "not-allowed" : "pointer" }}>
      <Paper
        withBorder p="xs" ta="center"
        style={{ backgroundColor: selected ? "var(--mantine-color-default-color)" : styles.bg, opacity: state === "past" || state === "outside" ? 0.45 : 1 }}
      >
        <Text size="sm" fw={500} c={selected ? "var(--mantine-color-body)" : styles.text}>{slot}</Text>
        {!selected && styles.label && <Text size="10px" c={styles.text} mt={2}>{styles.label}</Text>}
      </Paper>
    </UnstyledButton>
  );
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const providerId = location.state?.userId;



  // Estados de la reserva
  const [markedDates, setMarkedDates] = useState<MarkedDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedService, setSelectedService] = useState<ProviderService | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.BankTransfer);

  // Estados de datos
  const [providerServices, setProviderServices] = useState<ProviderService[]>([]);
  const [allSlots, setAllSlots] = useState<string[]>([]);
  const [occupiedSlots, setOccupiedSlots] = useState<Set<string>>(new Set());

  // Estados de carga y error
  const [loadingAppts, setLoadingAppts] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Variables derivadas
  const currentPrice = calculateServicePrice(selectedService);
  const currentPriceCents = Math.round(currentPrice * 100);
  const canConfirm = selectedDate && selectedTime && selectedService && paymentMethod;

  // Stripe Hooks
  const stripe = useStripe();
  const elements = useElements();

  const calculateFinalPrice = (svc: ProviderService | null) => {
    if (!svc) return 0;
    const pricePerMinute = svc.price_per_h / 60;
    const total = pricePerMinute * svc.duration_minutes;
    return total;
  };

  const finalPrice = calculateFinalPrice(selectedService);
  const finalPriceCents = Math.round(finalPrice * 100);

  // 1. Cargar citas previas para el calendario
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
        setMarkedDates(Object.values(dateMap).map((appts) => ({
          date: new Date(appts[0].start_time),
          status: appts[0].status,
        })));
      } finally { setLoadingAppts(false); }
    })();
  }, [providerId]);

  // 2. Cargar servicios del proveedor
  useEffect(() => {
    if (!providerId) return;
    (async () => {
      setLoadingServices(true);
      try {
        const { data } = await API.providers({ provider_id: String(providerId) }).services.get();
        setProviderServices(data ?? []);
      } finally { setLoadingServices(false); }
    })();
  }, [providerId]);

  // 3. Cargar disponibilidad al seleccionar fecha
  useEffect(() => {
    if (!providerId || !selectedDate) return;
    (async () => {
      setLoadingSlots(true);
      setAllSlots([]); setOccupiedSlots(new Set()); setSelectedTime(null);
      try {
        const pad = (n: number) => String(n).padStart(2, "0");
        const dateStr = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`;
        const { data } = await API.bookings.provider({ provider_id: String(providerId) }).availability.get({ query: { date: dateStr } });
        setAllSlots(data?.all_slots ?? []);
        setOccupiedSlots(new Set(data?.occupied_slots ?? []));
      } finally { setLoadingSlots(false); }
    })();
  }, [providerId, selectedDate]);

  // Calcular el estado visual de cada hueco horario (Memoizado)
  const slotStates = useMemo(() => {
    if (!selectedDate || allSlots.length === 0) return {} as Record<string, SlotState>;
    const now = new Date();
    const durationMin = selectedService?.duration_minutes ?? 0;

    return Object.fromEntries(allSlots.map((slot) => {
      const [h, m] = slot.split(":").map(Number);
      const slotDate = new Date(selectedDate);
      slotDate.setHours(h, m, 0, 0);

      if (slotDate < now) return [slot, "past"];
      if (occupiedSlots.has(slot)) return [slot, "occupied"];
      if (!selectedService || durationMin === 0) return [slot, "available"];

      const startMin = slotToMinutes(slot);
      const endMin = startMin + durationMin;

      if (endMin > 24 * 60) return [slot, "outside"];
      for (let cursor = startMin; cursor < endMin; cursor += SLOT_STEP) {
        const key = `${String(Math.floor(cursor / 60)).padStart(2, "0")}:${String(cursor % 60).padStart(2, "0")}`;
        if (occupiedSlots.has(key)) return [slot, "occupied"];
      }
      return [slot, "available"];
    }));
  }, [allSlots, selectedDate, selectedService, occupiedSlots]);

  const morningSlots = allSlots.filter((s) => slotToMinutes(s) < 14 * 60);
  const afternoonSlots = allSlots.filter((s) => slotToMinutes(s) >= 14 * 60);

  // Manejadores de interfaz
  const handleDateClick = (date: Date) => {
    if (date < new Date()) return;
    setSelectedDate(date); setSelectedTime(null);
  };

  const handleTimeSelect = (slot: string) => {
    const state = slotStates[slot];
    if (state !== "occupied" && state !== "past" && state !== "outside") setSelectedTime(slot);
  };

  // Función principal de Confirmación (Para métodos MANUALES)
  const handleConfirmManual = async () => {
    if (!canConfirm || !currentUser) return;
    setSubmitting(true); setError(null);

    try {
      const pad = (n: number) => String(n).padStart(2, "0");
      const start_time = `${selectedDate!.getFullYear()}-${pad(selectedDate!.getMonth() + 1)}-${pad(selectedDate!.getDate())}T${selectedTime}:00`;

      const { data: appointment, error: errAppt } = await API.bookings.me.post({
        provider_id: providerId,
        service_id: selectedService!.service_id,
        start_time,
        payment_method: paymentMethod,
      });

      if (errAppt || !appointment) throw new Error("Error al crear la reserva");

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
        <Title order={1} fz="1.5rem" fw={600}>{lang("booking.title")}</Title>

        {/* PASO 1 — CALENDARIO */}
        <Paper withBorder p="lg" shadow="sm">
          <Text fw={600} mb="sm">{lang("booking.step1")}</Text>
          <Calendar markedDates={markedDates} onDateClick={handleDateClick} selectedDate={selectedDate ?? new Date()} />
        </Paper>

        {/* PASO 2 — SERVICIO */}
        {selectedDate && (
          <Paper withBorder p="lg" shadow="sm">
            <Text fw={600} mb="lg">{lang("booking.step2")}</Text>
            {loadingServices ? (
              <Stack gap="xs"><Skeleton height={48} /><Skeleton height={48} /></Stack>
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
                {providerServices.map((svc) => (
                  <ToggleButton
                    key={svc.service_id}
                    selected={selectedService?.service_id === svc.service_id}
                    onClick={() => { setSelectedService(svc); setSelectedTime(null); }}
                  >
                    <Group justify="space-between">
                      <Text size="sm">{svc.service_name ?? svc.name ?? `Servicio #${svc.service_id}`}</Text>
                      <Group gap={6}>
                        <Text size="xs" c="dimmed">{formatDuration(svc.duration_minutes)}</Text>
                        <Text size="xs" fw={600} c="dimmed">{calculateServicePrice(svc).toFixed(2)} €</Text>
                      </Group>
                    </Group>
                  </ToggleButton>
                ))}
              </SimpleGrid>
            )}
          </Paper>
        )}

        {/* PASO 3 — HORA */}
        {selectedDate && selectedService && (
          <Paper withBorder p="lg" shadow="sm">
            <Text fw={600} mb="md">{lang("booking.step3")}</Text>
            {loadingSlots ? (
              <Skeleton height={100} />
            ) : (
              <Stack gap="lg">
                {morningSlots.length > 0 && (
                  <Box>
                    <Text size="xs" fw={600} c="dimmed" mb="xs">{lang("booking.morning")}</Text>
                    <SimpleGrid cols={4} spacing="xs">
                      {morningSlots.map((s) => <SlotButton key={s} slot={s} state={slotStates[s]} selected={selectedTime === s} onClick={() => handleTimeSelect(s)} />)}
                    </SimpleGrid>
                  </Box>
                )}
                {afternoonSlots.length > 0 && (
                  <Box>
                    <Text size="xs" fw={600} c="dimmed" mb="xs">{lang("booking.afternoon")}</Text>
                    <SimpleGrid cols={4} spacing="xs">
                      {afternoonSlots.map((s) => <SlotButton key={s} slot={s} state={slotStates[s]} selected={selectedTime === s} onClick={() => handleTimeSelect(s)} />)}
                    </SimpleGrid>
                  </Box>
                )}
              </Stack>
            )}
          </Paper>
        )}

        {/* PASO 4 — PAGO Y CONFIRMACIÓN */}
        {selectedDate && selectedService && selectedTime && (
          <Paper withBorder p="lg" shadow="sm">
            <Text fw={600} mb="md">{lang("booking.step4")}</Text>

            {/* Selector de métodos */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs" mb="xl">
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

            <Divider my="lg" label="Resumen del servicio" labelPosition="center" />

            {/* Desglose de precios para el usuario */}
            <Group justify="space-between" mb="xs">
              <Stack gap={0}>
                <Text size="sm" fw={700}>{selectedService.service_name}</Text>
                <Text size="xs" c="dimmed">
                  {selectedService.price_per_h}€/h × {selectedService.duration_minutes} min
                </Text>
              </Stack>
              <Text fw={700} size="lg" c="blue">
                {finalPrice.toFixed(2)} €
              </Text>
            </Group>

            {/* Lógica de botones según el método */}
            {paymentMethod === PaymentMethod.Stripe ? (
              <Box mt="xl">
                {finalPriceCents > 0 ? (
                  <CheckoutForm amount={finalPriceCents} />
                ) : (
                  <Alert color="red">Error en el cálculo del precio.</Alert>
                )}
              </Box>
            ) : (
              <Stack mt="xl">
                <Alert variant="light" color="gray" >
                  Al confirmar, el profesional recibirá tu solicitud y el pago se gestionará mediante <b>{lang(`booking.payment_methods.${paymentMethod}`)}</b>.
                </Alert>

                {error && <Alert color="red">{error}</Alert>}

                <Button
                  onClick={handleConfirmManual}
                  loading={submitting}
                  disabled={success}
                  size="md"
                  fullWidth
                  color={success ? "green" : "blue"}
                >
                  {success ? "¡Reserva Realizada!" : "Confirmar Reserva"}
                </Button>
              </Stack>
            )}
          </Paper>
        )}
      </Stack>
    </Base>
  );
}