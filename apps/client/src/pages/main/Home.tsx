import React, { useEffect, useRef, useState } from "react";
import Navbar from "../../components/Navbar";
import News from "../../components/News";
import logo from "../../assets/logo.svg";
import HERO_IMAGE from "./../../assets/hero2.jpg";
import {
  Box,
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
  Badge,
} from "@mantine/core";
import { Star, Shield, Clock, Sparkles, CheckCircle, ArrowRight } from "lucide-react";

/* ─── Animación de entrada suave ─── */
const useFadeIn = (delay = 0) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(18px)";
    el.style.transition = `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`;
    const t = setTimeout(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 60);
    return () => clearTimeout(t);
  }, [delay]);
  return ref;
};

/* ─── Contador animado ─── */
const AnimatedStat = ({ value, label }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Stack
      ref={ref}
      align="center"
      gap={2}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      <Text fw={800} fz={{ base: "1.3rem", sm: "1.5rem" }}>{value}</Text>
      <Text size="xs" ta="center" style={{ opacity: 0.7 }}>{label}</Text>
    </Stack>
  );
};

/* ─── Features ─── */
const features = [
  {
    icon: Star,
    title: "Profesionales verificados",
    description: "Cada autónomo pasa un proceso de verificación riguroso antes de operar.",
  },
  {
    icon: Shield,
    title: "Contratación segura",
    description: "Tu información y pagos están protegidos en todo momento.",
  },
  {
    icon: Clock,
    title: "Disponible 24/7",
    description: "Reserva servicios en cualquier momento, desde cualquier lugar.",
  },
];

const serviceTypes = [
  "Limpieza de hogar",
  "Fachadas y exteriores",
  "Piscinas",
  "Vehículos",
  "Artículos de alto valor",
];

/* ─── Hero ─── */
const HeroSection = () => {
  const ref = useFadeIn(0);
  return (
    <Box ref={ref} style={{ position: "relative", borderRadius: 16, overflow: "hidden" }}>
      <Image
        src={HERO_IMAGE}
        alt="Limpora hero"
        w="100%"
        h={{ base: 260, sm: 380 }}
        fit="cover"
        style={{ objectPosition: "center 10%", display: "block" }}
      />
      {/* Overlay con mensaje */}
      <Box
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.08) 55%, transparent 100%)",
          display: "flex",
          alignItems: "flex-end",
          padding: "1.5rem",
        }}
      >
        <Stack gap="xs">
          <Badge
            variant="filled"
            radius="xl"
            size="sm"
            leftSection={<Sparkles size={11} />}
            style={{ width: "fit-content", backdropFilter: "blur(6px)" }}
          >
            Plataforma de confianza
          </Badge>
          <Text
            fz={{ base: "1.5rem", sm: "2.2rem" }}
            fw={700}
            lh={1.2}
            c="white"
            style={{ letterSpacing: "-0.02em", textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
          >
            Limpieza profesional,<br />
            <Text span fw={300} inherit>cuando la necesitas.</Text>
          </Text>
        </Stack>
      </Box>
    </Box>
  );
};

/* ─── About / Features ─── */
const AboutSection = () => {
  const ref = useFadeIn(100);
  return (
    <Paper ref={ref} withBorder radius="xl" p={{ base: "lg", sm: "xl" }} h="100%">
      <Stack gap="xl" h="100%" justify="center">

        {/* Intro */}
        <Stack gap="sm">
          <Text
            fz={{ base: "1.5rem", sm: "2rem" }}
            fw={300}
            lh={1.25}
            style={{ letterSpacing: "-0.02em" }}
          >
            Conectamos personas con{" "}
            <Text span fw={700} inherit>
              profesionales de confianza
            </Text>
          </Text>
          <Text size="sm" maw={480} lh={1.75} style={{ opacity: 0.75 }}>
            Limpora simplifica la búsqueda, comparación y reserva de servicios de
            limpieza profesional. Rápido, seguro y siempre disponible.
          </Text>
        </Stack>

        {/* Tipos de servicio */}
        <Stack gap="xs">
          <Text size="xs" fw={600} tt="uppercase" style={{ letterSpacing: "0.08em", opacity: 0.5 }}>
            Servicios disponibles
          </Text>
          <Stack gap={6}>
            {serviceTypes.map((s) => (
              <Group key={s} gap="xs" align="center">
                <CheckCircle size={14} style={{ opacity: 0.6, flexShrink: 0 }} />
                <Text size="sm">{s}</Text>
              </Group>
            ))}
          </Stack>
        </Stack>

        <Divider />

        {/* Features */}
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          {features.map(({ icon: Icon, title, description }) => (
            <Stack key={title} gap="xs">
              <ThemeIcon size={38} radius="xl" variant="light">
                <Icon size={17} />
              </ThemeIcon>
              <Text size="sm" fw={600}>{title}</Text>
              <Text size="xs" lh={1.65} style={{ opacity: 0.7 }}>{description}</Text>
            </Stack>
          ))}
        </SimpleGrid>

        {/* Stats */}
        <Paper withBorder radius="lg" p="md">
          <SimpleGrid cols={3}>
            <AnimatedStat value="2.400+" label="Profesionales" />
            <AnimatedStat value="18.000+" label="Servicios realizados" />
            <AnimatedStat value="4.9 ★" label="Valoración media" />
          </SimpleGrid>
        </Paper>

      </Stack>
    </Paper>
  );
};

/* ─── Header ─── */
const Header = () => {
  const ref = useFadeIn(0);
  return (
    <Paper ref={ref} withBorder radius="xl" px="xl" py="md" shadow="xs">
      <Group justify="space-between" align="center">
        <Group gap="sm">
          <Image src={logo} alt="Limpora" w={70} h={70} fit="contain" style={{ flexShrink: 0 }} />
          <Stack gap={0}>
            <Title order={1} fz="1.4rem" fw={700} style={{ letterSpacing: "-0.03em" }}>
              Limpora
            </Title>
            <Text size="xs" style={{ opacity: 0.55 }}>Servicios profesionales</Text>
          </Stack>
        </Group>
        <Group gap="xs" visibleFrom="sm" align="center">
          <Text size="xs" style={{ opacity: 0.5 }}>
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long", day: "numeric", month: "long",
            })}
          </Text>
          <ArrowRight size={14} style={{ opacity: 0.3 }} />
        </Group>
      </Group>
    </Paper>
  );
};

/* ─── Page ─── */
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
        <Header />
        <Navbar />
        <HeroSection />

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