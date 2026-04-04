import { Box, Paper, SimpleGrid, Skeleton, Stack, Text } from "@mantine/core";
import { SlotButton } from "./BookingUI";
import { slotToMinutes, type SlotState } from "../utils";
import { useTranslation } from "react-i18next";
interface StepTimeProps {
  allSlots: string[];
  slotStates: Record<string, SlotState>;
  selectedTime: string | null;
  loading: boolean;
  onSelect: (slot: string) => void;
}

export default function StepTime({ allSlots, slotStates, selectedTime, loading, onSelect }: StepTimeProps) {
  const morningSlots = allSlots.filter((s) => slotToMinutes(s) < 14 * 60);
  const afternoonSlots = allSlots.filter((s) => slotToMinutes(s) >= 14 * 60);
  const { t } = useTranslation();

  return (
    <Paper withBorder p="lg" shadow="sm">
      <Text fw={600} mb="md">{t("booking.step3")}</Text>

      {loading ? (
        <Skeleton height={100} />
      ) : (
        <Stack gap="lg">
          {morningSlots.length > 0 && (
            <Box>
              <Text size="xs" fw={600} c="dimmed" mb="xs">{t("booking.morning")}</Text>
              <SimpleGrid cols={4} spacing="xs">
                {morningSlots.map((s) => (
                  <SlotButton
                    key={s}
                    slot={s}
                    state={slotStates[s]}
                    selected={selectedTime === s}
                    onClick={() => onSelect(s)}
                  />
                ))}
              </SimpleGrid>
            </Box>
          )}

          {afternoonSlots.length > 0 && (
            <Box>
              <Text size="xs" fw={600} c="dimmed" mb="xs">{t("booking.afternoon")}</Text>
              <SimpleGrid cols={4} spacing="xs">
                {afternoonSlots.map((s) => (
                  <SlotButton
                    key={s}
                    slot={s}
                    state={slotStates[s]}
                    selected={selectedTime === s}
                    onClick={() => onSelect(s)}
                  />
                ))}
              </SimpleGrid>
            </Box>
          )}
        </Stack>
      )}
    </Paper>
  );
}