import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from 'react';
import { useTranslation } from "react-i18next";
import {
  Paper,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Badge,
  Alert,
  Divider,
  useMantineTheme,
  useMantineColorScheme,
} from "@mantine/core";
import {
  CreditCard,
  ShieldCheck,
  Lock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { API } from "../lib/api";

interface CheckoutFormProps {
  amount?: number;
  onSuccess?: () => void;
}

type PaymentStatus = "idle" | "loading" | "success" | "error";

const CheckoutForm = ({ amount = 2000, onSuccess }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const { t } = useTranslation();

  const [status, setStatus] = useState<PaymentStatus>("idle");

  const isDark = colorScheme === "dark";
  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: isDark ? theme.colors.gray[1] : theme.colors.dark[7],
        fontFamily: theme.fontFamily,
        "::placeholder": {
          color: isDark ? theme.colors.gray[6] : theme.colors.gray[5],
        },
        iconColor: isDark ? theme.colors.gray[3] : theme.colors.dark[4],
      },
      invalid: {
        color: theme.colors.red[6],
        iconColor: theme.colors.red[6],
      },
    },
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const { data, error } = await API.payment.post({ amount });
      if (error || !data?.client_secret) throw new Error("No client secret");

      const cardElement = elements?.getElement(CardElement);
      if (!stripe || !cardElement) throw new Error("Stripe not ready");

      const result = await stripe.confirmCardPayment(data.client_secret, {
        payment_method: { card: cardElement },
      });

      if (result.paymentIntent?.status === "succeeded") {
        setStatus("success");
        onSuccess?.();
      } else {
        throw new Error(result.error?.message ?? "Payment failed");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <Paper withBorder radius="md" p="xl" maw={440} mx="auto">
        <Stack align="center" gap="sm">
          <CheckCircle size={48} color={theme.colors.green[6]} strokeWidth={1.5} />
          <Title order={3}>{t("payment.success")}</Title>
          <Text c="dimmed" ta="center">{t("payment.successDetail")}</Text>
          {onSuccess && (
            <Button onClick={onSuccess} mt="xs">
              {t("payment.continue")}
            </Button>
          )}
        </Stack>
      </Paper>
    );
  }

  if (status === "error") {
    return (
      <Paper withBorder radius="md" p="xl" maw={440} mx="auto">
        <Stack align="center" gap="sm">
          <XCircle size={48} color={theme.colors.red[6]} strokeWidth={1.5} />
          <Title order={3}>{t("payment.error")}</Title>
          <Text c="dimmed" ta="center">{t("payment.errorDetail")}</Text>
          <Button
            leftSection={<RefreshCw size={16} />}
            variant="light"
            onClick={() => setStatus("idle")}
            mt="xs"
          >
            {t("payment.retry")}
          </Button>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper withBorder radius="md" p="xl" maw={440} mx="auto">
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Group justify="space-between" align="flex-start">
            <div>
              <Group gap="xs" mb={4}>
                <CreditCard size={20} />
                <Title order={4}>{t("payment.title")}</Title>
              </Group>
              <Text size="sm" c="dimmed">{t("payment.subtitle")}</Text>
            </div>
            <Badge leftSection={<Lock size={11} />} variant="light" color="green" size="sm">
              SSL
            </Badge>
          </Group>

          <Divider />

          <Group justify="space-between">
            <Text size="sm" c="dimmed">{t("payment.amount")}</Text>
            <Text fw={600}>{(amount / 100).toFixed(2)} €</Text>
          </Group>

          <Stack gap={6}>
            <Text size="sm" fw={500}>{t("payment.cardDetails")}</Text>
            <Paper
              withBorder
              p="sm"
              radius="sm"
              style={{ borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[4] }}
            >
              <CardElement options={cardElementOptions} />
            </Paper>
          </Stack>

          <Button
            type="submit"
            fullWidth
            loading={status === "loading"}
            leftSection={status !== "loading" && <ShieldCheck size={16} />}
            size="md"
          >
            {status === "loading" ? t("payment.processing") : t("payment.pay")}
          </Button>

          <Group justify="center" gap={4}>
            <Lock size={12} color={theme.colors.gray[5]} />
            <Text size="xs" c="dimmed">{t("payment.securedBy")}</Text>
          </Group>

          <Alert variant="light" color="blue" icon={<ShieldCheck size={16} />} p="xs">
            <Text size="xs">{t("payment.testMode")}</Text>
          </Alert>
        </Stack>
      </form>
    </Paper>
  );
};

export default CheckoutForm;