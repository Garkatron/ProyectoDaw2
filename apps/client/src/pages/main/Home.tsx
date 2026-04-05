import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/Navbar";
import logo from "../../assets/logo.svg";
import HERO_IMAGE from "./../../assets/hero2.webp";
import {
  Box, Grid, Group, Image, Paper, Stack,
  Text, Title, Divider, ThemeIcon, SimpleGrid, Badge, Anchor,
} from "@mantine/core";
import { Star, Shield, Clock, Sparkles, CheckCircle } from "lucide-react";

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

const useFeatures = () => {
  const { t } = useTranslation();
  return [
    {
      icon: Star,
      title: t("home.info.three_section.verified.title"),
      description: t("home.info.three_section.verified.description"),
    },
    {
      icon: Shield,
      title: t("home.info.three_section.secure.title"),
      description: t("home.info.three_section.secure.description"),
    },
    {
      icon: Clock,
      title: t("home.info.three_section.available.title"),
      description: t("home.info.three_section.available.description"),
    },
  ];
};

const useServiceTypes = () => {
  const { t } = useTranslation();
  return [
    t("home.info.services_available.home_cleaning"),
    t("home.info.services_available.facade_exterior"),
    t("home.info.services_available.swimingpool"),
    t("home.info.services_available.vehicles"),
    t("home.info.services_available.high_value_articles"),
  ];
};

/* ─── Hero ─── */
const HeroSection = () => {
  const { t } = useTranslation();
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
            {t("home.hero.tag")}
          </Badge>
          <Text
            fz={{ base: "1.5rem", sm: "2.2rem" }}
            fw={700}
            lh={1.2}
            c="white"
            style={{ letterSpacing: "-0.02em", textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
          >
            {t("home.hero.title")}<br />
            <Text span fw={300} inherit>{t("home.hero.subtitle")}</Text>
          </Text>
        </Stack>
      </Box>
    </Box>
  );
};

/* ─── About / Features ─── */
const AboutSection = () => {
  const { t } = useTranslation();
  const ref = useFadeIn(100);
  const features = useFeatures();
  const serviceTypes = useServiceTypes();

  return (
    <Paper ref={ref} withBorder radius="xl" p={{ base: "lg", sm: "xl" }} h="100%">
      <Stack gap="xl" h="100%" justify="center">

        <Stack gap="sm">
          <Text fz={{ base: "1.5rem", sm: "2rem" }} fw={300} lh={1.25} style={{ letterSpacing: "-0.02em" }}>
            {t("home.info.title").split("profesionales de confianza")[0]}
            <Text span fw={700} inherit>{t("home.info.title").split("con ")[1]}</Text>
          </Text>
          <Text size="sm" maw={480} lh={1.75} style={{ opacity: 0.75 }}>
            {t("home.info.description")}
          </Text>
        </Stack>

        <Stack gap="xs">
          <Text size="xs" fw={600} tt="uppercase" style={{ letterSpacing: "0.08em", opacity: 0.5 }}>
            {t("home.info.services_available.title")}
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

        <Paper withBorder radius="lg" p="md">
          <SimpleGrid cols={3}>
            <AnimatedStat value="2.400+" label={t("home.info.three_section.stats.professionals")} />
            <AnimatedStat value="18.000+" label={t("home.info.three_section.stats.services")} />
            <AnimatedStat value="4.9 ★" label={t("home.info.three_section.stats.rating")} />
          </SimpleGrid>
        </Paper>

      </Stack>
    </Paper>
  );
};

const Header = () => {
  const { t } = useTranslation();
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
            <Text size="xs" style={{ opacity: 0.55 }}>{t("home.head.subtitle")}</Text>
          </Stack>
        </Group>
      </Group>
    </Paper>
  );
};

const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const links = [
    { label: t("footer.privacy"), href: "/legal" },
    { label: t("footer.terms"), href: "/legal" },
    { label: t("footer.cookies"), href: "/legal" },
    { label: t("footer.legal"), href: "/legal" },
    { label: t("footer.about"), href: "/about" },
  ];

  return (
    <Box component="footer" py="lg">
      <Divider mb="lg" />
      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        <Text size="xs" style={{ opacity: 0.45 }}>
          © {year} Limpora. {t("footer.rights")}
        </Text>
        <Group gap="lg" wrap="wrap">
          {links.map(({ label, href }) => (
            <Anchor
              key={href}
              href={href}
              size="xs"
              style={{ opacity: 0.55 }}
              underline="hover"
            >
              {label}
            </Anchor>
          ))}
        </Group>
      </Group>
    </Box>
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
          <Grid.Col span={12}>
            <AboutSection />
          </Grid.Col>
        </Grid>
        <Footer />
      </Stack>
    </Box>
  );
}