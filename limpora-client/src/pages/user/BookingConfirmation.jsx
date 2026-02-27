import { useLocation, useNavigate } from "react-router-dom";
import Calendar from "../../components/Calendar";
import Base from "../../layouts/Base";
import { useAuthStore } from "../../stores/auth.store";
import { useEffect, useState } from "react";
import { getUserServices } from "../../services/user_services.service";
import { addAppointment, getAppointments } from "../../services/appointments.service";
import {
  Alert,
  Box,
  Button,
  Group,
  Loader,
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

const LegendDot = ({ color, label }) => (
  <Group gap={6}>
    <Box w={10} h={10} style={{ borderRadius: "50%", backgroundColor: color }} />
    <Text size="xs" c="gray.5">{label}</Text>
  </Group>
);

const ToggleButton = ({ selected, onClick, children, fullWidth = false }) => (
  <UnstyledButton
    onClick={onClick}
    style={{ width: fullWidth ? "100%" : undefined }}
  >
    <Paper
      withBorder
      p="sm"
      radius="md"
      ta="center"
      style={{
        cursor: "pointer",
        backgroundColor: selected ? "var(--mantine-color-dark-8)" : "white",
        borderColor: selected ? "var(--mantine-color-dark-8)" : "var(--mantine-color-gray-3)",
        color: selected ? "white" : "var(--mantine-color-gray-7)",
        transition: "all 0.15s",
      }}
    >
      {children}
    </Paper>
  </UnstyledButton>
);

export default function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);

  const providerId = location.state?.userId;

  const [markedDates, setMarkedDates] = useState([]);
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
          const dateKey = new Date(appt.date_time).toDateString();
          if (!dateMap[dateKey]) dateMap[dateKey] = [];
          dateMap[dateKey].push(appt);
        });
        const marks = Object.entries(dateMap).map(([, appts]) => {
          const date = new Date(appts[0].date_time);
          const statuses = appts.map((a) => a.status?.toLowerCase());
          let status = "Pending";
          if (statuses.every((s) => s === "completed" || s === "cancelled")) status = "Completed";
          else if (statuses.some((s) => s === "in process")) status = "In Process";
          return { date, status };
        });
        setMarkedDates(marks);
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
    const mark = markedDates.find(
      (m) => new Date(m.date).toDateString() === date.toDateString()
    );
    if (mark && (mark.status === "Pending" || mark.status === "In Process")) return;
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
          <Title order={1} fz="1.5rem" fw={600} c="gray.8">Nueva reserva</Title>
          <Text size="sm" c="gray.5" mt={4}>
            Proveedor ID: <Text span fw={500} c="gray.7">{providerId}</Text>
          </Text>
        </Box>

        {/* Paso 1 — Calendario */}
        <Paper withBorder  p="lg" shadow="sm">
          <Text fw={600} c="gray.7" mb="sm">1. Selecciona un día</Text>

          <Group gap="md" mb="md">
            <LegendDot color="var(--mantine-color-yellow-4)" label="Pendiente" />
            <LegendDot color="var(--mantine-color-blue-4)" label="En proceso" />
            <LegendDot color="var(--mantine-color-green-4)" label="Completado" />
          </Group>

          {loadingAppts && (
            <Text size="xs" c="gray.4" mb="xs">Cargando disponibilidad...</Text>
          )}

          <Calendar
            markedDates={markedDates}
            onDateClick={handleDateClick}
            selectedDate={selectedDate}
          />
        </Paper>

        {/* Paso 2 — Hora */}
        {selectedDate && (
          <Paper withBorder  p="lg" >
            <Text fw={600} c="gray.7" mb="sm">2. Selecciona una hora</Text>
            <SimpleGrid cols={{ base: 4, sm: 6 }} spacing="xs">
              {TIME_SLOTS.map((slot) => (
                <ToggleButton
                  key={slot}
                  selected={selectedTime === slot}
                  onClick={() => setSelectedTime(slot)}
                >
                  <Text size="sm" fw={500}>{slot}</Text>
                </ToggleButton>
              ))}
            </SimpleGrid>
          </Paper>
        )}

        {/* Paso 3 — Servicio y pago */}
        {selectedDate && selectedTime && (
          <Paper withBorder  p="lg" shadow="sm">
            <Text fw={600} c="gray.7" mb="lg">3. Detalles de la reserva</Text>

            <Stack gap="lg">
              {/* Servicio */}
              <Box>
                <Text size="sm" fw={500} c="gray.6" mb="xs">Servicio</Text>
                {loadingServices ? (
                  <Stack gap="xs">
                    <Skeleton height={48} radius="md" />
                    <Skeleton height={48} radius="md" />
                  </Stack>
                ) : providerServices.length === 0 ? (
                  <Text size="sm" c="red.4" fs="italic">
                    Este proveedor no tiene servicios disponibles.
                  </Text>
                ) : (
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
                    {providerServices.map((svc) => {
                      const isSelected = selectedService?.service_id === svc.service_id;
                      return (
                        <UnstyledButton key={svc.service_id} onClick={() => setSelectedService(svc)}>
                          <Paper
                            withBorder
                            px="md"
                            py="sm"
                            radius="md"
                            style={{
                              cursor: "pointer",
                              backgroundColor: isSelected ? "var(--mantine-color-dark-8)" : "white",
                              borderColor: isSelected ? "var(--mantine-color-dark-8)" : "var(--mantine-color-gray-3)",
                              transition: "all 0.15s",
                            }}
                          >
                            <Group justify="space-between">
                              <Text size="sm" fw={500} c={isSelected ? "white" : "gray.7"}>
                                {svc.name ?? svc.service_name ?? `Servicio #${svc.service_id}`}
                              </Text>
                              {svc.price != null && (
                                <Text size="xs" fw={600} c={isSelected ? "gray.4" : "gray.4"}>
                                  {svc.price} €
                                </Text>
                              )}
                            </Group>
                          </Paper>
                        </UnstyledButton>
                      );
                    })}
                  </SimpleGrid>
                )}
              </Box>

              {/* Método de pago */}
              <Box>
                <Text size="sm" fw={500} c="gray.6" mb="xs">Método de pago</Text>
                <SimpleGrid cols={3} spacing="xs">
                  {PAYMENT_METHODS.map((method) => (
                    <ToggleButton
                      key={method}
                      selected={paymentMethod === method}
                      onClick={() => setPaymentMethod(method)}
                    >
                      <Text size="sm" fw={500}>{method}</Text>
                    </ToggleButton>
                  ))}
                </SimpleGrid>
              </Box>
            </Stack>
          </Paper>
        )}

        {/* Resumen + Confirmar */}
        {canConfirm && (
          <Paper withBorder  p="lg" bg="gray.0" shadow="sm">
            <Text fw={600} c="gray.7" mb="md">Resumen</Text>
            <Stack gap={6} mb="lg">
              <Text size="sm" c="gray.6">
                📅 <Text span fw={500}>Fecha:</Text>{" "}
                {selectedDate.toLocaleDateString("es-ES", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric",
                })}
              </Text>
              <Text size="sm" c="gray.6">
                🕐 <Text span fw={500}>Hora:</Text> {selectedTime}
              </Text>
              <Text size="sm" c="gray.6">
                🛠 <Text span fw={500}>Servicio:</Text>{" "}
                {selectedService.name ?? selectedService.service_name ?? `#${selectedService.service_id}`}
                {selectedService.price != null && ` — ${selectedService.price} €`}
              </Text>
              <Text size="sm" c="gray.6">
                💳 <Text span fw={500}>Pago:</Text> {paymentMethod}
              </Text>
            </Stack>

            {error && <Alert color="red" radius="md" mb="md">{error}</Alert>}
            {success && (
              <Alert color="green" radius="md" mb="md">
                ✅ Cita confirmada. Redirigiendo...
              </Alert>
            )}

            <Button
              onClick={handleConfirm}
              disabled={submitting || success}
              loading={submitting}
              color="dark"
              
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