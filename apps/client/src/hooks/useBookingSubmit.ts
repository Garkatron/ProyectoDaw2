import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { PaymentMethod, type ProviderService } from "@limpora/common";
import { API } from "../lib/api";

interface SubmitParams {
  providerId: number;
  selectedDate: Date;
  selectedTime: string;
  selectedService: ProviderService;
  paymentMethod: PaymentMethod;
  currentUser: { id: number } | null;
}

export function useBookingSubmit() {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSuccess = () => {
    setSuccess(true);
    setTimeout(() => navigate("/appointments"), 2000);
  };

  const confirmManual = async (params: SubmitParams) => {
    const { providerId, selectedDate, selectedTime, selectedService, paymentMethod, currentUser } = params;
    if (!currentUser) return;

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

      handleSuccess();
    } catch (e: any) {
      setError(e.message || "Ocurrió un error inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitting,
    error,
    success,
    confirmManual,
    onStripeSuccess: handleSuccess,
  };
}