import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendVerifycationCode, sendVerifycationEmail } from "../../services/email.service";
import { Modal } from "../../components/Modal";
import logo from "../../assets/logo-provisional.png";
import { useAuthStore } from "../../stores/auth.store";
import lang from "../../utils/LangManager";
import {
  TextInput,
  Button,
  Paper,
  Title,
  Text,
  Stack,
  Image,
  Center,
  Anchor,
} from "@mantine/core";

export default function EmailCode() {
  const [code, setCode] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await sendVerifycationCode(code);

      if (result) {
        setModalTitle(lang("verification.success_title") || "Éxito");
        setModalMessage(lang("verification.success_message") || "Código verificado correctamente");
        setSuccess(true);
      } else {
        setModalTitle(lang("verification.error_title") || "Error");
        setModalMessage(lang("verification.error_message") || "Código inválido o expirado");
      }

      setModalOpen(true);
    } catch (err) {
      setModalTitle(lang("verification.error_title") || "Error");
      setModalMessage(err.message || "Error al verificar el código");
      setModalOpen(true);
    }
  };

  const resendCode = async () => {
    try {
      await sendVerifycationEmail(user.id, user.email);
      setModalTitle(lang("verification.resent_title") || "Código reenviado");
      setModalMessage(lang("verification.resent_message") || "Se ha enviado un nuevo código a tu correo");
      setModalOpen(true);
    } catch (err) {
      setModalTitle(lang("verification.error_title") || "Error");
      setModalMessage(err.message || "No se pudo reenviar el código");
      setModalOpen(true);
    }
  };

  return (
    <Center mih="100vh" p="md">
      <Paper w="100%" maw={448} p={32} withBorder >
        <Stack align="center" mb="lg" gap="xs">
          <Image
            src={logo}
            alt="Logo"
            w={128}
            h={128}
            fit="contain"
          />
          <Title order={1} fw={300} c="gray.8" fz="1.5rem">
            {lang("verification.title") || "Verifica tu email"}
          </Title>
          <Text size="sm" c="gray.6" ta="center">
            {lang("verification.subtitle") || "Ingresa el código enviado a tu correo"}
          </Text>
        </Stack>

        <form onSubmit={handleSubmit}>
          <Stack gap="lg">
            <TextInput
              id="code"
              name="code"
              required
              label={lang("verification.code") || "Código"}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.currentTarget.value)}
              size="md"
              
            />

            <Button
              type="submit"
              variant="default"
              
              size="md"
              fullWidth
            >
              {lang("verification.submit") || "Verificar"}
            </Button>
          </Stack>
        </form>

        <Center mt="md">
          <Anchor
            component="button"
            type="button"
            size="sm"
            c="gray.6"
            onClick={resendCode}
          >
            {lang("verification.resend") || "Reenviar código"}
          </Anchor>
        </Center>
      </Paper>

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          if (success) navigate("/login");
        }}
        title={modalTitle}
        message={modalMessage}
      />
    </Center>
  );
}