import { Alert, Box, Button, Divider, Group, Paper, SimpleGrid, Stack, Text } from "@mantine/core";
import { PaymentMethod, type ProviderService } from "@limpora/common";
import { ToggleButton } from "./BookingUI";
import { PAYMENT_METHODS_LIST } from "../utils";
import { useTranslation } from "react-i18next";
import lang from "../../../utils/LangManager";
import CheckoutForm from "../../../components/CheckoutForm";


interface StepPaymentProps {
  selectedService: ProviderService;
  paymentMethod: PaymentMethod;
  finalPrice: number;
  finalPriceCents: number;
  submitting: boolean;
  error: string | null;
  success: boolean;
  onMethodChange: (method: PaymentMethod) => void;
  onConfirmManual: () => void;
  onStripeSuccess: () => void;
}

export default function StepPayment({
  selectedService,
  paymentMethod,
  finalPrice,
  finalPriceCents,
  submitting,
  error,
  success,
  onMethodChange,
  onConfirmManual,
  onStripeSuccess,
}: StepPaymentProps) {
  const { t } = useTranslation();
  
  return (
    <Paper withBorder p="lg" shadow="sm">
      <Text fw={600} mb="md">{lang("booking.step4")}</Text>

      {/* Selector de método */}
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs" mb="xl">
        {PAYMENT_METHODS_LIST.map((method) => (
          <ToggleButton
            key={method.value}
            selected={paymentMethod === method.value}
            onClick={() => onMethodChange(method.value as PaymentMethod)}
          >
            {method.label}
          </ToggleButton>
        ))}
      </SimpleGrid>

      <Divider my="lg" label="Resumen del servicio" labelPosition="center" />

      {/* Desglose de precio */}
      <Group justify="space-between" mb="xs">
        <Stack gap={0}>
          <Text size="sm" fw={700}>{selectedService.service_name}</Text>
          <Text size="xs" c="dimmed">
            {selectedService.price_per_h}€/h × {selectedService.duration_minutes} min
          </Text>
        </Stack>
        <Text fw={700} size="lg" c="blue">
          {finalPrice.toFixed(2)} €
        </Text>
      </Group>

      {/* Stripe */}
      {paymentMethod === PaymentMethod.Stripe ? (
        <Box mt="xl">
          {finalPriceCents > 0 ? (
            success ? (
              <Button mt="md" fullWidth color="green" onClick={onStripeSuccess}>
                Continuar
              </Button>
            ) : (
              <CheckoutForm amount={finalPriceCents} onSuccess={onStripeSuccess} />
            )
          ) : (
            <Alert color="red">Error en el cálculo del precio.</Alert>
          )}
        </Box>
      ) : (
        /* Métodos manuales */
        <Stack mt="xl">
          <Alert variant="light" color="gray">
            Al confirmar, el profesional recibirá tu solicitud y el pago se gestionará mediante{" "}
            <b>{lang(`booking.payment_methods.${paymentMethod}`)}</b>.
          </Alert>

          {error && <Alert color="red">{error}</Alert>}

          <Button
            onClick={onConfirmManual}
            loading={submitting}
            disabled={success}
            size="md"
            fullWidth
            color={success ? "green" : "blue"}
          >
            {success ? "¡Reserva Realizada!" : "Confirmar Reserva"}
          </Button>
        </Stack>
      )}
    </Paper>
  );
}