import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  ActionIcon,
  Divider,
  Select,
  Badge,
  NumberInput,
} from "@mantine/core";
import { API } from "../../lib/api";

interface ScheduleSlot {
  id?: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface Props {
  providerId: number;
  readOnly?: boolean;
  isSelf?: boolean;
}

const DAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

const DEFAULT_SLOT = { start_time: "09:00", end_time: "17:00" };

export default function ScheduleSettings({
  providerId,
  readOnly = false,
  isSelf = false,
}: Props) {
  const [schedule, setSchedule] = useState<Record<number, ScheduleSlot[]>>(
    Object.fromEntries(DAYS.map((_, i) => [i, []])),
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [travelBuffer, setTravelBuffer] = useState<number>(30);
  const [savingBuffer, setSavingBuffer] = useState(false);
  const [bufferSuccess, setBufferSuccess] = useState(false);
  const [bufferError, setBufferError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await API.bookings
          .provider({ provider_id: String(providerId) })
          .schedule.get();
        const map: Record<number, ScheduleSlot[]> = Object.fromEntries(
          DAYS.map((_, i) => [i, []]),
        );
        (data ?? []).forEach((slot: ScheduleSlot) =>
          map[slot.day_of_week].push(slot),
        );
        setSchedule(map);
      } catch {
        setError("No se pudo cargar el horario.");
      } finally {
        setLoading(false);
      }
    })();
  }, [providerId]);

  useEffect(() => {
    if (!isSelf) return;
    (async () => {
      try {
        const { data } = await API.user.me["provider-profile"].get();
        if (data) setTravelBuffer(data.travel_buffer_min);
      } catch {
        // silently ignore — default 30 is already set
      }
    })();
  }, [isSelf]);

  const handleSaveBuffer = async () => {
    setSavingBuffer(true);
    setBufferError(null);
    setBufferSuccess(false);
    try {
      await API.user.me["provider-profile"].patch({
        travel_buffer_min: travelBuffer,
      });
      setBufferSuccess(true);
      setTimeout(() => setBufferSuccess(false), 3000);
    } catch {
      setBufferError("No se pudo guardar el tiempo de desplazamiento.");
    } finally {
      setSavingBuffer(false);
    }
  };

  const addSlot = (day: number) =>
    setSchedule((p) => ({
      ...p,
      [day]: [...p[day], { ...DEFAULT_SLOT, day_of_week: day }],
    }));

  const removeSlot = (day: number, i: number) =>
    setSchedule((p) => ({ ...p, [day]: p[day].filter((_, j) => j !== i) }));

  const updateSlot = (
    day: number,
    i: number,
    field: "start_time" | "end_time",
    value: string,
  ) =>
    setSchedule((p) => {
      const updated = [...p[day]];
      updated[i] = { ...updated[i], [field]: value };
      return { ...p, [day]: updated };
    });

  const validate = (): string | null => {
    for (const [day, slots] of Object.entries(schedule)) {
      for (const slot of slots) {
        const [sh, sm] = slot.start_time.split(":").map(Number);
        const [eh, em] = slot.end_time.split(":").map(Number);
        if (sh * 60 + sm >= eh * 60 + em)
          return `${DAYS[Number(day)]}: inicio debe ser anterior al fin.`;
      }
      const sorted = [...slots].sort((a, b) =>
        a.start_time.localeCompare(b.start_time),
      );
      for (let i = 0; i < sorted.length - 1; i++)
        if (sorted[i].end_time > sorted[i + 1].start_time)
          return `${DAYS[Number(day)]}: hay franjas solapadas.`;
    }
    return null;
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(false);
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setSaving(true);
    try {
      const payload = Object.values(schedule)
        .flat()
        .map(({ day_of_week, start_time, end_time }) => ({
          day_of_week,
          start_time,
          end_time,
        }));
      await API.bookings
        .provider({ provider_id: String(providerId) })
        .schedule.put(payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("No se pudo guardar el horario.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <Text size="sm" c="dimmed">
        Cargando horario...
      </Text>
    );

  return (
    <Stack gap="md">
      <Box>
        <Text fw={600} size="sm">
          Horario de disponibilidad
        </Text>
        <Text size="xs" c="dimmed" mt={2}>
          Define las franjas en las que aceptas citas. Puedes añadir varias por
          día.
        </Text>
      </Box>

      {isSelf && (
        <Paper withBorder p="sm">
          <Stack gap="xs">
            <Box>
              <Text fw={500} size="sm">
                Tiempo de desplazamiento
              </Text>
              <Text size="xs" c="dimmed" mt={2}>
                Minutos de margen entre citas para que puedas desplazarte al
                siguiente cliente.
              </Text>
            </Box>
            <Group align="flex-end" gap="sm">
              <NumberInput
                w={160}
                label="Minutos de buffer"
                min={0}
                max={120}
                step={5}
                suffix=" min"
                value={travelBuffer}
                onChange={(val) => setTravelBuffer(Number(val))}
              />
              <Button
                variant="default"
                size="sm"
                loading={savingBuffer}
                onClick={handleSaveBuffer}
                style={{ alignSelf: "flex-end" }}
              >
                Guardar
              </Button>
            </Group>
            {bufferError && (
              <Text c="red" size="xs">
                {bufferError}
              </Text>
            )}
            {bufferSuccess && (
              <Text c="green" size="xs">
                ✅ Guardado.
              </Text>
            )}
          </Stack>
        </Paper>
      )}

      {DAYS.map((dayLabel, day) => {
        const slots = schedule[day];
        const isActive = slots.length > 0;

        return (
          <Paper key={day} withBorder p="sm">
            <Group justify="space-between" mb={isActive ? "sm" : 0}>
              <Group gap="sm">
                <Text fw={500} size="sm" w={80}>
                  {dayLabel}
                </Text>
                <Badge
                  color={isActive ? "green" : "gray"}
                  variant="light"
                  size="xs"
                >
                  {isActive ? "Activo" : "Sin horario"}
                </Badge>
              </Group>

              {!readOnly && (
                <ActionIcon
                  variant="light"
                  color="blue"
                  size="sm"
                  onClick={() => addSlot(day)}
                >
                  +
                </ActionIcon>
              )}
            </Group>

            {isActive && (
              <Stack gap="xs" mt="xs">
                <Divider />
                {slots.map((slot, i) => (
                  <Group key={i} gap="xs" align="center" wrap="nowrap">
                    <Select
                      size="xs"
                      w={90}
                      data={TIME_OPTIONS}
                      value={slot.start_time}
                      onChange={(v) => v && updateSlot(day, i, "start_time", v)}
                      allowDeselect={false}
                      disabled={readOnly}
                    />
                    <Text size="xs" c="dimmed">
                      →
                    </Text>
                    <Select
                      size="xs"
                      w={90}
                      data={TIME_OPTIONS}
                      value={slot.end_time}
                      onChange={(v) => v && updateSlot(day, i, "end_time", v)}
                      allowDeselect={false}
                      disabled={readOnly}
                    />
                    <Text size="xs" c="dimmed" style={{ minWidth: 60 }}>
                      {(() => {
                        const [sh, sm] = slot.start_time.split(":").map(Number);
                        const [eh, em] = slot.end_time.split(":").map(Number);
                        const diff = eh * 60 + em - (sh * 60 + sm);
                        if (diff <= 0) return "⚠️ inválido";
                        const h = Math.floor(diff / 60);
                        const m = diff % 60;
                        return h > 0 && m > 0
                          ? `${h}h ${m}min`
                          : h > 0
                            ? `${h}h`
                            : `${m}min`;
                      })()}
                    </Text>
                    {!readOnly && (
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="sm"
                        onClick={() => removeSlot(day, i)}
                      >
                        x
                      </ActionIcon>
                    )}
                  </Group>
                ))}
              </Stack>
            )}
          </Paper>
        );
      })}

      {error && (
        <Text c="red" size="xs">
          {error}
        </Text>
      )}
      {success && (
        <Text c="green" size="xs">
          ✅ Horario guardado.
        </Text>
      )}

      {!readOnly && (
        <Button
          onClick={handleSave}
          loading={saving}
          variant="default"
          size="sm"
        >
          Guardar horario
        </Button>
      )}
    </Stack>
  );
}
