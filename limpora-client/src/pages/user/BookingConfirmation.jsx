import { useLocation, useNavigate } from "react-router-dom";
import Calendar from "../../components/Calendar";
import Base from "../../layouts/Base";
import { useAuthStore } from '../../stores/auth.store';
import { useEffect, useState } from "react";
import { getUserServices } from "../../services/user_services.service";
import { addAppointment, getAppointments } from '../../services/appointments.service';

const PAYMENT_METHODS = ["Bizum", "Bank Transfer", "Paypal"];

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00",
];

export default function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);

  const providerId = location.state?.userId;

  // Calendario
  const [markedDates, setMarkedDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loadingAppts, setLoadingAppts] = useState(false);

  // Servicios del proveedor
  const [providerServices, setProviderServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);

  // Formulario
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedService, setSelectedService] = useState(null); // { service_id, name, price, ... }
  const [paymentMethod, setPaymentMethod] = useState("");

  // Envío
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch appointments del proveedor para marcar días ocupados
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
          if (statuses.every((s) => s === "completed" || s === "cancelled")) {
            status = "Completed";
          } else if (statuses.some((s) => s === "in process")) {
            status = "In Process";
          }

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

  // Fetch servicios del proveedor
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
    if (mark && (mark.status === "Pending" || mark.status === "In Process")) {
      return;
    }
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
      <div className="max-w-3xl mx-auto p-6 space-y-6">

        {/* CABECERA */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Nueva reserva</h1>
          <p className="text-sm text-gray-500 mt-1">
            Proveedor ID: <span className="font-medium text-gray-700">{providerId}</span>
          </p>
        </div>

        {/* PASO 1 — CALENDARIO */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-700 mb-3">1. Selecciona un día</h2>

          <div className="flex flex-wrap gap-4 mb-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Pendiente
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> En proceso
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400" /> Completado
            </span>
          </div>

          {loadingAppts && (
            <p className="text-xs text-gray-400 mb-2 animate-pulse">Cargando disponibilidad...</p>
          )}

          <Calendar
            markedDates={markedDates}
            onDateClick={handleDateClick}
            selectedDate={selectedDate}
          />
        </div>

        {/* PASO 2 — HORA */}
        {selectedDate && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-700 mb-3">2. Selecciona una hora</h2>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {TIME_SLOTS.map((slot) => {
                const selected = selectedTime === slot;
                return (
                  <button
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    className={`py-2 rounded-lg text-sm font-medium border transition-all
                      ${selected
                        ? "bg-gray-800 text-white border-gray-800 shadow"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                      }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PASO 3 — SERVICIO Y PAGO */}
        {selectedDate && selectedTime && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-base font-semibold text-gray-700">3. Detalles de la reserva</h2>

            {/* SELECTOR DE SERVICIO */}
            <div>
              <label className="block text-sm text-gray-600 mb-1.5 font-medium">
                Servicio
              </label>
              {loadingServices ? (
                <p className="text-xs text-gray-400 animate-pulse">Cargando servicios...</p>
              ) : providerServices.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Este proveedor no tiene servicios disponibles.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {providerServices.map((svc) => {
                    const isSelected = selectedService?.service_id === svc.service_id;
                    return (
                      <button
                        key={svc.service_id}
                        onClick={() => setSelectedService(svc)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm border transition-all text-left
                          ${isSelected
                            ? "bg-gray-800 text-white border-gray-800 shadow"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                          }`}
                      >
                        <span className="font-medium">{svc.name ?? svc.service_name ?? `Servicio #${svc.service_id}`}</span>
                        {svc.price != null && (
                          <span className={`ml-2 text-xs font-semibold ${isSelected ? "text-gray-300" : "text-gray-400"}`}>
                            {svc.price} €
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* MÉTODO DE PAGO */}
            <div>
              <label className="block text-sm text-gray-600 mb-1.5 font-medium">
                Método de pago
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2.5 rounded-xl text-sm font-medium border transition-all
                      ${paymentMethod === method
                        ? "bg-gray-800 text-white border-gray-800 shadow"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                      }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RESUMEN + CONFIRMAR */}
        {canConfirm && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-gray-700">Resumen</h2>
            <ul className="text-sm text-gray-600 space-y-1.5">
              <li>📅 <span className="font-medium">Fecha:</span>{" "}
                {selectedDate.toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </li>
              <li>🕐 <span className="font-medium">Hora:</span> {selectedTime}</li>
              <li>🛠 <span className="font-medium">Servicio:</span>{" "}
                {selectedService.name ?? selectedService.service_name ?? `#${selectedService.service_id}`}
                {selectedService.price != null && ` — ${selectedService.price} €`}
              </li>
              <li>💳 <span className="font-medium">Pago:</span> {paymentMethod}</li>
            </ul>

            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && (
              <p className="text-sm text-green-600 font-medium">✅ Cita confirmada. Redirigiendo...</p>
            )}

            <button
              onClick={handleConfirm}
              disabled={submitting || success}
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-300 text-white text-sm font-semibold rounded-xl transition-all shadow"
            >
              {submitting ? "Confirmando..." : "Confirmar reserva"}
            </button>
          </div>
        )}

      </div>
    </Base>
  );
}