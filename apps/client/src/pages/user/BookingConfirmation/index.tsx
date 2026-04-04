import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Stack, Title } from "@mantine/core";
import { PaymentMethod, type ProviderService } from "@limpora/common";
import { useBookingData } from "../../../hooks/useBookingData";
import { computeSlotStates } from "./utils";
import Base from "../../../layouts/Base";
import StepCalendar from "./components/SteepCalendar";
import StepService from "./components/SteepService";
import StepTime from "./components/StepTime";
import StepPayment from "./components/StepPayment";
import lang from "../../../utils/LangManager";
import { useBookingSubmit } from "../../../hooks/useBookingSubmit";
import { useAuthStore } from "../../../stores/auth.store";



export default function BookingConfirmation() {
  const location = useLocation();
  const currentUser = useAuthStore((s) => s.user);
  const providerId: number | undefined = location.state?.userId;

  // Estado de selección del usuario
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedService, setSelectedService] = useState<ProviderService | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.BankTransfer);

  // Datos remotos
  const {
    markedDates,
    providerServices,
    allSlots,
    occupiedSlots,
    loadingServices,
    loadingSlots,
    loadSlots,
  } = useBookingData(providerId);

  // Submit
  const { submitting, error, success, confirmManual, onStripeSuccess } = useBookingSubmit();

  // Precio final
  const finalPrice = selectedService
    ? (selectedService.price_per_h / 60) * selectedService.duration_minutes
    : 0;
  const finalPriceCents = Math.round(finalPrice * 100);

  // Estados visuales de los slots (memoizado)
  const slotStates = useMemo(() => {
    if (!selectedDate || allSlots.length === 0) return {};
    return computeSlotStates(
      allSlots,
      selectedDate,
      occupiedSlots,
      selectedService?.duration_minutes ?? 0
    );
  }, [allSlots, selectedDate, selectedService, occupiedSlots]);

  // Handlers
  const handleDateClick = (date: Date) => {
    if (date < new Date()) return;
    setSelectedDate(date);
    setSelectedTime(null);
    loadSlots(date);
  };

  const handleServiceSelect = (svc: ProviderService) => {
    setSelectedService(svc);
    setSelectedTime(null);
  };

  const handleTimeSelect = (slot: string) => {
    const state = slotStates[slot];
    if (state !== "occupied" && state !== "past" && state !== "outside") {
      setSelectedTime(slot);
    }
  };

  const handleConfirmManual = () => {
    if (!selectedDate || !selectedTime || !selectedService || !providerId) return;
    confirmManual({
      providerId,
      selectedDate,
      selectedTime,
      selectedService,
      paymentMethod,
      currentUser,
    });
  };

  return (
    <Base>
      <Stack maw={768} mx="auto" p="lg" gap="lg">
        <Title order={1} fz="1.5rem" fw={600}>
          {lang("booking.title")}
        </Title>

        {/* Paso 1 */}
        <StepCalendar
          markedDates={markedDates}
          selectedDate={selectedDate}
          onDateClick={handleDateClick}
        />

        {/* Paso 2 */}
        {selectedDate && (
          <StepService
            services={providerServices}
            selectedService={selectedService}
            loading={loadingServices}
            onSelect={handleServiceSelect}
          />
        )}

        {/* Paso 3 */}
        {selectedDate && selectedService && (
          <StepTime
            allSlots={allSlots}
            slotStates={slotStates}
            selectedTime={selectedTime}
            loading={loadingSlots}
            onSelect={handleTimeSelect}
          />
        )}

        {/* Paso 4 */}
        {selectedDate && selectedService && selectedTime && (
          <StepPayment
            selectedService={selectedService}
            paymentMethod={paymentMethod}
            finalPrice={finalPrice}
            finalPriceCents={finalPriceCents}
            submitting={submitting}
            error={error}
            success={success}
            onMethodChange={setPaymentMethod}
            onConfirmManual={handleConfirmManual}
            onStripeSuccess={onStripeSuccess}
          />
        )}
      </Stack>
    </Base>
  );
}