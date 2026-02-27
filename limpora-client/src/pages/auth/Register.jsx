import logo from "../../assets/logo-provisional.png";
import { useState } from "react";
import { useAuthStore } from "../../stores/auth.store";
import { Link, useNavigate } from "react-router-dom";
import RegisterSchema from "../../schemas/RegisterSchema";
import {
  TextInput,
  PasswordInput,
  Select,
  Button,
  Paper,
  Title,
  Stack,
  Group,
  Image,
  Center,
  Modal,
  Text,
} from "@mantine/core";

export default function Register() {
  const register = useAuthStore((state) => state.register);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("client");

  const [success, setSuccess] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = RegisterSchema.safeParse({ name, email, password });

    if (!result.success) {
      setModalTitle("Validation Error");
      setModalMessage(result.error.issues[0].message);
      setModalOpen(true);
      return;
    }

    try {
      const data = await register(
        result.data.name,
        result.data.email,
        result.data.password,
        role
      );

      if (data.success) {
        setModalTitle("Registro exitoso");
        setModalMessage("Redirigiendo a login...");
        setSuccess(true);
      } else {
        setModalTitle("Error");
        setModalMessage(data.message || "Ocurrió un error.");
      }

      setModalOpen(true);
    } catch (err) {
      setModalTitle("Error");
      setModalMessage(err.message || "Error registrando usuario.");
      setModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    if (success) navigate("/login");
  };

  return (
    <Center mih="100vh" px="md">
      <Paper w="100%" maw={448} p={40} withBorder>
        <Stack align="center" mb="xl" gap="xs">
          <Image src={logo} alt="Limpora Logo" w={112} h={112} fit="contain" />
          <Title order={1} fw={300} fz="2rem">
            Registro
          </Title>
        </Stack>

        <form onSubmit={handleSubmit}>
          <Stack gap="md" mb="xl">
            <TextInput
              required
              placeholder="Nombre completo"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              size="md"
            />
            <TextInput
              type="email"
              required
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              size="md"
            />
            <PasswordInput
              required
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              size="md"
            />
            <Select
              value={role}
              onChange={setRole}
              size="md"
              data={[
                { value: "client", label: "Cliente" },
                { value: "provider", label: "Proveedor" },
                { value: "admin", label: "Admin" },
              ]}
            />
          </Stack>

          <Group grow gap="md">
            <Button type="submit" variant="default" size="md">
              Confirmar
            </Button>
            <Button component={Link} to="/login" variant="subtle" size="md">
              Cancelar
            </Button>
          </Group>
        </form>
      </Paper>

      <Modal opened={modalOpen} onClose={handleModalClose} title={modalTitle} centered>
        <Text size="sm">{modalMessage}</Text>
        <Button mt="md" fullWidth variant="default" onClick={handleModalClose}>
          Aceptar
        </Button>
      </Modal>
    </Center>
  );
}