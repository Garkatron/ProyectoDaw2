import logo from "../../assets/logo.svg";
import { useAuthStore } from "../../stores/auth.store";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginSchema from "../../schemas/NewSessionSchema";
import lang from "../../utils/LangManager";
import { UserRole } from "@limpora/common";
import { Turnstile } from "react-turnstile";

import {
  TextInput, PasswordInput, Button, Paper, Title,
  Stack, Image, Center, Anchor, Text,
} from "@mantine/core";

export default function Login() {
  const login = useAuthStore((state) => state.login);
  const user = useAuthStore((state) => state.user);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleOAuth = () => {
    window.location.href =
      import.meta.env.MODE === "production"
        ? "https://api.limpora.xyz/google/redirect"
        : "/api/google/redirect";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = LoginSchema.safeParse({ email, password });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Validation error");
      return;
    }

    const response = await login(
      result.data.email,
      result.data.password,
      captchaToken!
    );

    if (response.success) {
      const currentUser = response.user;

      if (currentUser?.role === UserRole.Admin) {
        navigate("/panel/admin");
      } else {
        navigate("/panel/me");
      }
    } else {
      if (response.error?.includes("verified email")) {
        navigate("/verify-email", { state: { email } });
        return;
      }
      setError(response.error ?? lang("login.generic_error"));
    }
  };

  return (
    <Center mih="100vh" px="md">
      <Paper w="100%" maw={448} p={40} withBorder>
        <Stack align="center" mb="xl" gap="xs">
          <Image src={logo} alt="Limpora Logo" w={180} h={180} fit="contain" />
          <Title order={1} fw={300} fz="2rem">
            {lang("login.title")}
          </Title>
        </Stack>

        <form onSubmit={handleSubmit}>
          <Stack gap="md" mb="xl">
            <TextInput
              type="email"
              required
              label={lang("login.email")}
              placeholder={lang("login.placeholder.email")}
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />

            <PasswordInput
              required
              label={lang("login.password")}
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />

            <Turnstile
              key="turnstile-register"
              sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY!}
              onVerify={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken(null)}
              refreshExpired="auto"
            />

            {error && <Text c="red" size="sm">{error}</Text>}
          </Stack>

          <Stack gap="sm" mb="md">
            <Button type="submit" variant="default" fullWidth disabled={!captchaToken}>
              {lang("login.submit")}
            </Button>
            <Button type="button" variant="default" fullWidth onClick={handleOAuth}>
              Google
            </Button>
          </Stack>
        </form>

        <Center>
          <Anchor component={Link} to="/register" size="sm">
            {lang("login.register")}
          </Anchor>
        </Center>
      </Paper>
    </Center>
  );
}