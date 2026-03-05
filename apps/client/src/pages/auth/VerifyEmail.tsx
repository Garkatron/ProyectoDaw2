import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Paper,
  Stack,
  Title,
  Text,
  Group,
  Button,
  PinInput,
  Anchor,
  TextInput,
} from "@mantine/core";
import { MailCheck } from "lucide-react";
import { API } from "../../lib/api";

const RESEND_COOLDOWN = 60;

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const email: string = state?.email ?? "";

  useEffect(() => {
    startCooldown();
    return () => clearTimer();
  }, []);

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    clearTimer();
    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearTimer();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleVerify = async () => {
    if (code.length < 6) {
      setError("Introduce los 6 dígitos.");
      return;
    }
    setLoading(true);
    setError("");

    const { data, error } = await API.auth.verify.post({ email, code });

    setLoading(false);

    if (error) {
      setError("Código incorrecto o expirado.");
      return;
    }

    if (data.success) {
      navigate("/login");
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      startCooldown();
    } catch {
      setError("No se pudo reenviar el correo.");
    }
  };

  return (
    <Box
      mih="100vh"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      p="md"
    >
      <Paper withBorder radius="xl" p="xl" w="100%" maw={420}>
        <Stack align="center" gap="lg">
          <Box
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "var(--mantine-color-primary-light)",
            }}
          >
            <MailCheck size={26} />
          </Box>

          <Stack align="center" gap={4}>
            <Title
              order={2}
              fz="1.4rem"
              fw={700}
              style={{ letterSpacing: "-0.02em" }}
            >
              Verifica tu correo
            </Title>
            <Text size="sm" ta="center" style={{ opacity: 0.65 }}>
              Hemos enviado un código de 6 dígitos a{" "}
              <Text span fw={600} style={{ opacity: 1 }}>
                {email}
              </Text>
            </Text>
          </Stack>

          <PinInput
            length={6}
            type="number"
            size="lg"
            value={code}
            onChange={(val) => {
              setCode(val);
              setError("");
            }}
            onComplete={handleVerify}
            error={!!error}
            autoFocus
          />

          {error && (
            <Text size="xs" c="red" ta="center">
              {error}
            </Text>
          )}

          <Button
            fullWidth
            radius="xl"
            size="md"
            loading={loading}
            disabled={code.length < 6}
            onClick={handleVerify}
          >
            Verificar
          </Button>

          <Group gap={4}>
            <Text size="xs" style={{ opacity: 0.6 }}>
              ¿No recibiste el correo?
            </Text>
            {cooldown > 0 ? (
              <Text size="xs" style={{ opacity: 0.5 }}>
                Reenviar en {cooldown}s
              </Text>
            ) : (
              <Anchor size="xs" fw={500} onClick={handleResend}>
                Reenviar
              </Anchor>
            )}
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}
