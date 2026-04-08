import logo from "../../assets/logo.svg";
import { useState } from "react";
import { useAuthStore } from "../../stores/auth.store";
import { Link, useNavigate } from "react-router-dom";
import RegisterSchema from "../../schemas/RegisterSchema";
import lang from "../../utils/LangManager";
import { Turnstile } from "react-turnstile";

import {
  TextInput, PasswordInput, Select, Button, Paper,
  Title, Stack, Group, Image, Center, Text,
} from "@mantine/core";

export default function Register() {
  const register = useAuthStore((state) => state.register);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("client");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError("");

    if (!captchaToken) {
      setError("Verifica que no eres un bot");
      return;
    }

    const result = RegisterSchema.safeParse({ username, email, password });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? lang("register.validation_error"));
      return;
    }

    const data = await register(
      result.data.username,
      result.data.email,
      result.data.password,
      role,
      captchaToken
    );

    if (data.success) {
      navigate("/verify-email", { state: { email } });
    } else {
      setError(data.error || lang("register.generic_error"));
    }
  };
  

  return (
    <Center mih="100vh" px="md">
      <Paper w="100%" maw={448} p={40} withBorder>
        <Stack align="center" mb="xl" gap="xs">
          <Image src={logo} alt="Limpora Logo" w={180} h={180} fit="contain" />
          <Title order={1} fw={300} fz="2rem">
            {lang("register.title")}
          </Title>
        </Stack>

        <form onSubmit={handleSubmit}>
          <Stack gap="md" mb="xl">
            <TextInput
              required
              placeholder={lang("register.placeholder.username")}
              value={username}
              onChange={(e) => setUsername(e.currentTarget.value)}
            />

            <TextInput
              type="email"
              required
              placeholder={lang("register.placeholder.email")}
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />

            <PasswordInput
              required
              placeholder={lang("register.placeholder.password")}
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />

            <Select
              value={role}
              onChange={(value) => setRole(value ?? "client")}
              data={[
                { value: "client", label: lang("register.roles.client") },
                { value: "provider", label: lang("register.roles.provider") },
              ]}
            />
            <Turnstile
              sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY!}
              onVerify={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken(null)}
              refreshExpired="auto"
            />

            {error && <Text c="red" size="sm">{error}</Text>}
          </Stack>

          <Group grow gap="md">
            <Button type="submit" variant="default" disabled={!captchaToken}>
              {lang("register.submit")}
            </Button>
            <Button component={Link} to="/login" variant="subtle">
              {lang("register.cancel")}
            </Button>
          </Group>
        </form>
      </Paper>
    </Center>
  );
}