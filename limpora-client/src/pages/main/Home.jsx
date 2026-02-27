import React from "react";
import Base from "../../layouts/Base";
import Navbar from "../../components/Navbar";
import News from "../../components/News";
import logo from "../../assets/logo.svg";
import lang from "../../utils/LangManager";
import {
  Box,
  Center,
  Grid,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  Title,
  Divider,
  ThemeIcon,
  SimpleGrid,
} from "@mantine/core";
import { Star, Shield, Clock } from "lucide-react";

const features = [
  {
    icon: Star,
    title: "Proveedores verificados",
    description: "Todos nuestros profesionales pasan por un proceso de verificación riguroso.",
  },
  {
    icon: Shield,
    title: "Reservas seguras",
    description: "Tu información y pagos están protegidos en todo momento.",
  },
  {
    icon: Clock,
    title: "Disponibilidad 24/7",
    description: "Encuentra y reserva servicios en cualquier momento del día.",
  },
];

const AboutSection = () => (
  <Paper
    withBorder
    radius="xl"
    p="xl"
    h="100%"

  >
    <Stack gap="xl" h="100%" justify="center">
      {/* Intro */}
      <Stack gap="sm">
        <Text
          fz={{ base: "1.75rem", sm: "2.25rem" }}
          fw={300}
          lh={1.2}
          style={{ letterSpacing: "-0.02em" }}
        >
          Conectamos personas con{" "}
          <Text span fw={600}  inherit>
            los mejores profesionales
          </Text>
        </Text>
        <Text size="md" maw={480} lh={1.7}>
          Limpora es la plataforma que simplifica la búsqueda, comparación y
          reserva de servicios de limpieza profesional en tu área.
        </Text>
      </Stack>

      <Divider  />

      {/* Features */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
        {features.map(({ icon: Icon, title, description }) => (
          <Stack key={title} gap="xs">
            <ThemeIcon
              size={40}
              radius="xl"
              variant="light"
            >
              <Icon size={18} />
            </ThemeIcon>
            <Text size="sm" fw={600} >{title}</Text>
            <Text size="xs" lh={1.6}>{description}</Text>
          </Stack>
        ))}
      </SimpleGrid>

      {/* Stat strip */}
      <Paper
        withBorder
        radius="lg"
        p="md"
      >
        <SimpleGrid cols={3}>
          {[
            { value: "2.400+", label: "Profesionales" },
            { value: "18.000+", label: "Servicios completados" },
            { value: "4.9 ★", label: "Valoración media" },
          ].map(({ value, label }) => (
            <Stack key={label} align="center" gap={2}>
              <Text fw={700} fz="1.25rem" c="gray.9">{value}</Text>
              <Text size="xs" >{label}</Text>
            </Stack>
          ))}
        </SimpleGrid>
      </Paper>
    </Stack>
  </Paper>
);

export default function Home() {
  return (
    <Box mih="100vh">
      <Stack
        maw={1152}
        mx="auto"
        mih="calc(100vh - 2rem)"
        p={{ base: "md", sm: "xl" }}
        gap="lg"
      >
        {/* Header */}
        <Paper
          withBorder
          radius="xl"
          px="xl"
          py="md"
          shadow="xs"
        >
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <Image
                src={logo}
                alt="Limpora"
                w={52}
                h={52}
                fit="contain"
                style={{ flexShrink: 0 }}
              />
              <Stack gap={0}>
                <Title
                  order={1}
                  fz="1.5rem"
                  fw={600}
                  style={{ letterSpacing: "-0.03em" }}
                >
                  Limpora
                </Title>
                <Text size="xs" fw={400}>
                  Servicios profesionales
                </Text>
              </Stack>
            </Group>

            <Text size="xs"  visibleFrom="sm">
              {new Date().toLocaleDateString("es-ES", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </Text>
          </Group>
        </Paper>

        {/* Navbar */}
        <Navbar />

        {/* Main content */}
        <Grid gutter="lg" style={{ flex: 1 }}>
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <News />
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <AboutSection />
          </Grid.Col>
        </Grid>
      </Stack>
    </Box>
  );
}