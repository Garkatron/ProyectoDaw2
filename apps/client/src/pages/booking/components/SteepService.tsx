import { Paper, Text, SimpleGrid, Skeleton, Stack, Group } from "@mantine/core";
import { type ProviderService } from "@limpora/common";
import { ToggleButton } from "./BookingUI";
import { formatDuration, calculateServicePrice } from "../utils";
import { useTranslation } from "react-i18next";

interface StepServiceProps {
  services: ProviderService[];
  selectedService: ProviderService | null;
  loading: boolean;
  onSelect: (svc: ProviderService) => void;
}

export default function StepService({ services, selectedService, loading, onSelect }: StepServiceProps) {
  const { t } = useTranslation();
  return (
    <Paper withBorder p="lg" shadow="sm">
      <Text fw={600} mb="lg">{t("booking.step2")}</Text>

      {loading ? (
        <Stack gap="xs">
          <Skeleton height={48} />
          <Skeleton height={48} />
        </Stack>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
          {services.map((svc) => (
            <ToggleButton
              key={svc.service_id}
              selected={selectedService?.service_id === svc.service_id}
              onClick={() => onSelect(svc)}
            >
              <Group justify="space-between">
                <Text size="sm">{svc.service_name ?? `Servicio #${svc.service_id}`}</Text>
                <Group gap={6}>
                  <Text size="xs" c="dimmed">{formatDuration(svc.duration_minutes)}</Text>
                  <Text size="xs" fw={600} c="dimmed">{calculateServicePrice(svc).toFixed(2)} €</Text>
                </Group>
              </Group>
            </ToggleButton>
          ))}
        </SimpleGrid>
      )}
    </Paper>
  );
}