import { useLocation, useNavigate } from "react-router-dom";
import Calendar from "../../components/Calendar";
import Base from "../../layouts/Base";
import { useAuthStore } from "../../stores/auth.store";
import { useEffect, useState } from "react";
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

const PAYMENT_METHODS = ["Bizum", "Bank Transfer", "Paypal"];

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00",
];

const statusColorMap = {
  Completed: "green",
  Pending: "yellow",
  "In Process": "blue",
};

const ToggleButton = ({ selected, onClick, children }) => (
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
      <Text size="sm" fw={500} c={selected ? "var(--mantine-color-body)" : undefined}>
        {children}
      </Text>
    </Paper>
  </UnstyledButton>
);

export default function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);

  const providerId = location.state?.userId;

  const [markedDates, setMarkedDates] = useState<>([]);
  const [blockedDates, setBlockedDates] = useState(new Set());
  const [selectedDate, setSelectedDate] = useState(null);
  const [loadingAppts, setLoadingAppts] = useState(false);

  const [providerServices, setProviderServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);

  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!providerId) return;
    const fetchAppointments = async () => {
      setLoadingAppts(true);
      try {
        const appointments = await getAppointments(providerId);
        const dateMap = {};
        appointments.forEach((appt) => {
          const key = new Date(appt.date_time).toDateString();
          if (!dateMap[key]) dateMap[key] = [];
          dateMap[key].push(appt);
        });

        const marks = [];
        const blocked = new Set();

        Object.entries(dateMap).forEach(([key, appts]) => {
          const statuses = appts.map((a) => a.status?.toLowerCase());
          let status = "Pending";
          if (statuses.every((s) => s === "completed" || s === "cancelled")) status = "Completed";
          else if (statuses.some((s) => s === "in process")) status = "In Process";

          marks.push({ date: new Date(appts[0].date_time), status });
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

  useEffect(() => {
    if (!providerId) return;
    const fetchServices = async () => {
      setLoadingServices(true);
      try {
        const services = await getUserServices(providerId);
        setProviderServices(services);
      } catch (err) {
        console.error("Error fetching provider services:", err);
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, [providerId]);

  const handleDateClick = (date) => {
    if (blockedDates.has(date.toDateString())) return;
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const canConfirm = selectedDate && selectedTime && selectedService && paymentMethod;

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setSubmitting(true);
    setError(null);
    try {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const dateTime = new Date(selectedDate);
      dateTime.setHours(hours, minutes, 0, 0);
      await addAppointment({
        date: dateTime.toISOString(),
        clientId: currentUser.id,
        serviceId: selectedService.service_id,
        providerId,
        price: selectedService.price ?? 0,
        paymentMethod,
        totalAmount: selectedService.price ?? 0,
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

  return (
    <Base>
      <Stack maw={768} mx="auto" p="lg" gap="lg">

        {/* Header */}
        <Box>
          <Title order={1} fz="1.5rem" fw={600}>Nueva reserva</Title>
          <Text size="sm" c="dimmed" mt={4}>
            Proveedor ID: <Text span fw={500}>{providerId}</Text>
          </Text>
        </Box>

        {/* Paso 1 — Calendario */}
        <Paper withBorder p="lg" shadow="sm">
          <Text fw={600} mb="sm">1. Selecciona un día</Text>

          <Group gap="md" mb="md">
            {Object.entries(statusColorMap).map(([label, color]) => (
              <Group key={label} gap={6}>
                <Box
                  w={10} h={10}
                  style={{
                    borderRadius: "50%",
                    backgroundColor: `var(--mantine-color-${color}-5)`,
                  }}
                />
                <Text size="xs" c="dimmed">{label}</Text>
              </Group>
            ))}
          </Group>

          {loadingAppts && (
            <Text size="xs" c="dimmed" mb="xs">Cargando disponibilidad...</Text>
          )}

          <Calendar
            markedDates={markedDates}
            onDateClick={handleDateClick}
            selectedDate={selectedDate}
          />
        </Paper>

        {/* Paso 2 — Hora */}
        {selectedDate && (
          <Paper withBorder p="lg">
            <Text fw={600} mb="sm">2. Selecciona una hora</Text>
            <SimpleGrid cols={{ base: 4, sm: 6 }} spacing="xs">
              {TIME_SLOTS.map((slot) => (
                <ToggleButton
                  key={slot}
                  selected={selectedTime === slot}
                  onClick={() => setSelectedTime(slot)}
                >
                  {slot}
                </ToggleButton>
              ))}
            </SimpleGrid>
          </Paper>
        )}

        {/* Paso 3 — Servicio y pago */}
        {selectedDate && selectedTime && (
          <Paper withBorder p="lg" shadow="sm">
            <Text fw={600} mb="lg">3. Detalles de la reserva</Text>

            <Stack gap="lg">
              <Box>
                <Text size="sm" fw={500} c="dimmed" mb="xs">Servicio</Text>
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
                          <Text size="sm" fw={500} c={selectedService?.service_id === svc.service_id ? "var(--mantine-color-body)" : undefined}>
                            {svc.name ?? svc.service_name ?? `Servicio #${svc.service_id}`}
                          </Text>
                          {svc.price != null && (
                            <Text size="xs" fw={600} c="dimmed">{svc.price} €</Text>
                          )}
                        </Group>
                      </ToggleButton>
                    ))}
                  </SimpleGrid>
                )}
              </Box>

              <Box>
                <Text size="sm" fw={500} c="dimmed" mb="xs">Método de pago</Text>
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
            <Text fw={600} mb="md">Resumen</Text>
            <Stack gap={6} mb="lg">
              <Text size="sm">
                📅 <Text span fw={500}>Fecha:</Text>{" "}
                {selectedDate.toLocaleDateString("es-ES", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric",
                })}
              </Text>
              <Text size="sm">
                🕐 <Text span fw={500}>Hora:</Text> {selectedTime}
              </Text>
              <Text size="sm">
                🛠 <Text span fw={500}>Servicio:</Text>{" "}
                {selectedService.name ?? selectedService.service_name ?? `#${selectedService.service_id}`}
                {selectedService.price != null && ` — ${selectedService.price} €`}
              </Text>
              <Text size="sm">
                💳 <Text span fw={500}>Pago:</Text> {paymentMethod}
              </Text>
            </Stack>

            {error && <Alert color="red" mb="md">{error}</Alert>}
            {success && <Alert color="green" mb="md">✅ Cita confirmada. Redirigiendo...</Alert>}

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