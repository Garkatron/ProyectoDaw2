import { useTranslation } from "react-i18next";
import ServiceCard from "./cards/ServiceCard";
import {
  Alert,
  Button,
  Divider,
  Group,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";

const APP_COMMISSION = 0.2;

function calcEarnings(pricePerHour: number, durationMinutes: number) {
  const gross = pricePerHour * (durationMinutes / 60);
  const net = gross * (1 - APP_COMMISSION);
  return { gross, net };
}

export default function ServicesSection({
  isSelf,
  userServices,
  allServices,
  onDelete,
  onAdd,
  selectedServiceId,
  setSelectedServiceId,
  selectedServicePrice,
  setSelectedServicePrice,
  selectedServiceMinutes,
  setSelectedServiceMinutes,
  serviceSubmitting,
  serviceError,
}) {
  const availableServices = allServices
    .filter((s) => !userServices.some((us) => us.service_id === s.id))
    .map((s) => ({ value: String(s.id), label: s.name }));
  const { t } = useTranslation();

  const price = Number(selectedServicePrice);
  const minutes = Number(selectedServiceMinutes);
  const showPreview = price > 0 && minutes >= 15;
  const { gross, net } = showPreview
    ? calcEarnings(price, minutes)
    : { gross: 0, net: 0 };

  return (
    <Stack gap="md">
      <Title order={2} fw={300} fz="xl">
        {t("userpanel.title.services") ?? "Servicios"}
      </Title>
      <Divider />

      {userServices.length > 0 ? (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          {userServices.map((service) => (
            <ServiceCard
              key={service.service_id}
              service={service}
              isSelf={isSelf}
              onDelete={onDelete}
            />
          ))}
        </SimpleGrid>
      ) : (
        <Text size="sm" c="dimmed">
          {t("userpanel.services.no_services")}
        </Text>
      )}

      {isSelf && (
        <Stack gap="sm" pt="sm">
          <Divider />
          <Title order={3} fw={300} fz="lg">
            {t("userpanel.services.add_title")}
          </Title>

          {serviceError && (
            <Alert color="red" variant="light">
              {serviceError}
            </Alert>
          )}

          <form onSubmit={onAdd}>
            <Stack gap="sm">
              <Group align="flex-end" gap="sm" wrap="wrap">
                <Select
                  style={{ flex: 1, minWidth: 180 }}
                  placeholder={t("userpanel.services.select_placeholder")}
                  data={availableServices}
                  value={selectedServiceId ? String(selectedServiceId) : null}
                  onChange={(val) => setSelectedServiceId(Number(val))}
                  required
                />

                <NumberInput
                  w={160}
                  label={t("userpanel.services.price_label")}
                  placeholder={t("userpanel.services.price_placeholder")}
                  min={50}
                  decimalScale={2}
                  suffix=" €/h"
                  value={selectedServicePrice}
                  onChange={setSelectedServicePrice}
                  required
                />

                <NumberInput
                  w={180}
                  label={t("userpanel.services.duration_label")}
                  description={t("userpanel.services.duration_description")}
                  placeholder={t("userpanel.services.duration_placeholder")}
                  min={15}
                  max={480}
                  step={15}
                  suffix=" min"
                  value={selectedServiceMinutes}
                  onChange={(val) => setSelectedServiceMinutes(Number(val))}
                />

                <Button
                  type="submit"
                  variant="default"
                  loading={serviceSubmitting}
                  style={{ alignSelf: "flex-end" }}
                >
                  {t("userpanel.services.add_button")}
                </Button>
              </Group>

              {showPreview && (
                <Paper
                  withBorder
                  p="sm"
                  radius="md"
                  bg="var(--mantine-color-green-light)"
                >
                  <Text size="sm" c="green" fw={500}>
                    💰{" "}
                    {t("userpanel.services.earnings_preview")
                      .replace("{{total}}", gross.toFixed(2))
                      .replace("{{net}}", net.toFixed(2))}
                  </Text>
                </Paper>
              )}
            </Stack>
          </form>
        </Stack>
      )}
    </Stack>
  );
}
