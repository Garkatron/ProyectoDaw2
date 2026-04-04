import { type ProviderService } from "@limpora/common";

export const SLOT_STEP = 15;

export const PAYMENT_METHODS_LIST = [
  { label: "Bizum", value: "Bizum" },
  { label: "Bank Transfer", value: "BankTransfer" },
  { label: "Paypal", value: "Paypal" },
  { label: "Tarjeta (Stripe)", value: "Stripe" },
] as const;

export type SlotState = "available" | "occupied" | "past" | "outside";

export function formatDuration(minutes?: number): string {
  if (!minutes || minutes <= 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m} min`;
}

export function calculateServicePrice(service?: ProviderService | null): number {
  if (!service) return 0;
  if (service.price != null && service.price > 0) return service.price;
  if (service.price_per_h != null && service.duration_minutes != null) {
    return (service.price_per_h / 60) * service.duration_minutes;
  }
  return 0;
}

export function slotToMinutes(slot: string): number {
  const [h, m] = slot.split(":").map(Number);
  return h * 60 + m;
}

export function computeSlotStates(
  allSlots: string[],
  selectedDate: Date,
  occupiedSlots: Set<string>,
  durationMin: number
): Record<string, SlotState> {
  const now = new Date();

  return Object.fromEntries(
    allSlots.map((slot) => {
      const [h, m] = slot.split(":").map(Number);
      const slotDate = new Date(selectedDate);
      slotDate.setHours(h, m, 0, 0);

      if (slotDate < now) return [slot, "past"];
      if (occupiedSlots.has(slot)) return [slot, "occupied"];
      if (durationMin === 0) return [slot, "available"];

      const startMin = slotToMinutes(slot);
      const endMin = startMin + durationMin;

      if (endMin > 24 * 60) return [slot, "outside"];

      for (let cursor = startMin; cursor < endMin; cursor += SLOT_STEP) {
        const key = `${String(Math.floor(cursor / 60)).padStart(2, "0")}:${String(cursor % 60).padStart(2, "0")}`;
        if (occupiedSlots.has(key)) return [slot, "occupied"];
      }

      return [slot, "available"];
    })
  );
}