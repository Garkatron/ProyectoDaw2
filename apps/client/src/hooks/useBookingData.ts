import { useEffect, useState } from "react";
import { type ProviderService } from "@limpora/common";
import type { MarkedDate } from "../components/Calendar";
import { API } from "../lib/api";


export function useBookingData(providerId: string | undefined) {
  const [markedDates, setMarkedDates] = useState<MarkedDate[]>([]);
  const [providerServices, setProviderServices] = useState<ProviderService[]>([]);
  const [allSlots, setAllSlots] = useState<string[]>([]);
  const [occupiedSlots, setOccupiedSlots] = useState<Set<string>>(new Set());

  const [loadingAppts, setLoadingAppts] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Citas previas para el calendario
  useEffect(() => {
    if (!providerId) return;
    (async () => {
      setLoadingAppts(true);
      try {
        const { data } = await API.bookings.me.get();
        const appointments = data ?? [];
        const dateMap: Record<string, typeof appointments> = {};
        appointments.forEach((a) => {
          const k = new Date(a.start_time).toDateString();
          (dateMap[k] ??= []).push(a);
        });
        setMarkedDates(
          Object.values(dateMap).map((appts) => ({
            date: new Date(appts[0].start_time),
            status: appts[0].status,
          }))
        );
      } finally {
        setLoadingAppts(false);
      }
    })();
  }, [providerId]);

  // Servicios del proveedor
  useEffect(() => {
    if (!providerId) return;
    (async () => {
      setLoadingServices(true);
      try {
        const { data } = await API.providers({ provider_id: String(providerId) }).services.get();
        setProviderServices(data ?? []);
      } finally {
        setLoadingServices(false);
      }
    })();
  }, [providerId]);

  // Slots de disponibilidad al seleccionar fecha
  const loadSlots = async (selectedDate: Date) => {
    if (!providerId) return;
    setLoadingSlots(true);
    setAllSlots([]);
    setOccupiedSlots(new Set());

    try {
      const pad = (n: number) => String(n).padStart(2, "0");
      const dateStr = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`;
      const { data } = await API.bookings
        .provider({ provider_id: String(providerId) })
        .availability.get({ query: { date: dateStr } });
      setAllSlots(data?.all_slots ?? []);
      setOccupiedSlots(new Set(data?.occupied_slots ?? []));
    } finally {
      setLoadingSlots(false);
    }
  };

  return {
    markedDates,
    providerServices,
    allSlots,
    occupiedSlots,
    loadingAppts,
    loadingServices,
    loadingSlots,
    loadSlots,
  };
}