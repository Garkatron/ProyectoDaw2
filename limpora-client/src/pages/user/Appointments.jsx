import { useEffect, useState } from "react";
import { useAuthStore } from "../../stores/auth.store";
import { getAppointments } from "../../services/appointments.service";
import Base from "../../layouts/Base";
import Calendar from "../../components/Calendar";
import { 
  ClockIcon, 
  BanknotesIcon, 
  CheckCircleIcon,
  ClockIcon as PendingIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

const statusConfig = {
  Completed: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    badge: "bg-green-100 text-green-700",
    icon: CheckCircleIcon,
  },
  Pending: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-700",
    icon: PendingIcon,
  },
  "In Process": {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    badge: "bg-blue-100 text-blue-700",
    icon: ArrowPathIcon,
  },
};

const AppointmentCard = ({ appointment }) => {
  const config = statusConfig[appointment.status] || statusConfig.Pending;
  const Icon = config.icon;
  const date = new Date(appointment.date_time);

  return (
    <div
      className={`${config.bg} ${config.border} border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${config.text}`} />
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${config.badge}`}>
            {appointment.status}
          </span>
        </div>
        <p className="text-xs text-gray-500">
          {date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <ClockIcon className="h-4 w-4 text-gray-400" />
          <span className="text-gray-700">
            {date.toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <BanknotesIcon className="h-4 w-4 text-gray-400" />
          <span className="font-semibold text-gray-800">
            €{appointment.total_amount?.toFixed(2) || appointment.price.toFixed(2)}
          </span>
          <span className="text-xs text-gray-500">
            ({appointment.payment_method})
          </span>
        </div>

        {appointment.service_name && (
          <p className="text-xs text-gray-600 mt-2 pt-2 border-t border-gray-200">
            Servicio: <span className="font-medium">{appointment.service_name}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default function Appointments() {
  const currentUser = useAuthStore((state) => state.user);
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAppointments() {
      if (!currentUser?.id) {
        setError("Usuario no autenticado");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getAppointments(currentUser.id);
        setAppointments(data || []);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("No se pudieron cargar las citas");
      } finally {
        setLoading(false);
      }
    }

    fetchAppointments();
  }, [currentUser]);

  const markedDates = appointments.map((app) => ({
    date: new Date(app.date_time),
    status: app.status,
  }));

  const appointmentsOnSelectedDate = appointments.filter((app) => {
    const appDate = new Date(app.date_time);
    return (
      appDate.getDate() === selectedDate.getDate() &&
      appDate.getMonth() === selectedDate.getMonth() &&
      appDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  if (loading) {
    return (
      <Base>
        <div className="max-w-6xl mx-auto p-4 sm:p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-100 rounded-xl" />
              <div className="h-96 bg-gray-100 rounded-xl" />
            </div>
          </div>
        </div>
      </Base>
    );
  }

  if (error) {
    return (
      <Base>
        <div className="max-w-6xl mx-auto p-4 sm:p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </Base>
    );
  }

  return (
    <Base>
      <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Mis Citas</h1>
            <p className="text-sm text-gray-500 mt-1">
              {appointments.length} cita{appointments.length !== 1 ? "s" : ""} en total
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-200" />
              <span className="text-gray-600">Completado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-200" />
              <span className="text-gray-600">En proceso</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-amber-200" />
              <span className="text-gray-600">Pendiente</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200/60">
            <Calendar
              markedDates={markedDates}
              onDateClick={handleDateClick}
              selectedDate={selectedDate}
            />
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200/60 shadow-sm">
            <div className="mb-4 pb-3 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">
                {selectedDate.toLocaleDateString("es-ES", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {appointmentsOnSelectedDate.length} cita
                {appointmentsOnSelectedDate.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {appointmentsOnSelectedDate.length > 0 ? (
                appointmentsOnSelectedDate.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))
              ) : (
                <div className="text-center py-12">
                  <ClockIcon className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">
                    No hay citas para este día
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = appointments.filter((a) => a.status === status).length;
            const Icon = config.icon;

            return (
              <div
                key={status}
                className={`${config.bg} ${config.border} border rounded-lg p-4 flex items-center gap-3`}
              >
                <div className={`w-10 h-10 rounded-full ${config.badge} flex items-center justify-center`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">{status}</p>
                  <p className={`text-2xl font-bold ${config.text}`}>{count}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Base>
  );
}