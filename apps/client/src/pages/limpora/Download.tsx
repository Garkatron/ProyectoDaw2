import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Box, Stack, Text, Title, Group, ThemeIcon, Badge,
  Paper, Divider, Anchor,
} from "@mantine/core";
import { Download, ShieldCheck, Smartphone, Wifi, Star, AlertTriangle } from "lucide-react";
import Base from "../../layouts/Base";

/* ── Fade-in hook ── */
const useFadeIn = (delay = 0) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`;
    const t = setTimeout(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 60);
    return () => clearTimeout(t);
  }, [delay]);
  return ref;
};

/* ── Phone Mockup ── */
const PhoneMockup = () => (
  <Box
    style={{
      width: 200,
      height: 390,
      borderRadius: 36,
      border: "3px solid var(--mantine-color-default-border)",
      background: "var(--mantine-color-body)",
      boxShadow: "0 24px 64px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07)",
      position: "relative",
      flexShrink: 0,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}
  >
    {/* Notch */}
    <Box
      style={{
        width: 72,
        height: 22,
        borderRadius: "0 0 14px 14px",
        background: "var(--mantine-color-default-border)",
        margin: "0 auto",
        flexShrink: 0,
      }}
    />

    {/* Screen — placeholder */}
    <Box
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 8,
        opacity: 0.3,
      }}
    >
      <Smartphone size={40} strokeWidth={1.2} />
      <Text size="9px" tt="uppercase" style={{ letterSpacing: "0.12em" }}>
        App screenshot
      </Text>
    </Box>

    {/* Home bar */}
    <Box
      style={{
        width: 56,
        height: 4,
        borderRadius: 99,
        background: "var(--mantine-color-default-border)",
        margin: "10px auto 14px",
        flexShrink: 0,
      }}
    />

    {/* Side buttons */}
    {[90, 140].map((top) => (
      <Box
        key={top}
        style={{
          position: "absolute",
          left: -4,
          top,
          width: 4,
          height: 28,
          borderRadius: "2px 0 0 2px",
          background: "var(--mantine-color-default-border)",
        }}
      />
    ))}
    <Box
      style={{
        position: "absolute",
        right: -4,
        top: 110,
        width: 4,
        height: 44,
        borderRadius: "0 2px 2px 0",
        background: "var(--mantine-color-default-border)",
      }}
    />
  </Box>
);

/* ── Download Button ── */
const DownloadButton = ({ label, sublabel, href = "#" }) => (
  <Anchor
    href={href}
    download
    style={{ textDecoration: "none" }}
  >
    <Paper
      withBorder
      radius="xl"
      p="md"
      style={{
        cursor: "pointer",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <ThemeIcon size={44} radius="xl" variant="filled">
        <Download size={20} />
      </ThemeIcon>
      <Stack gap={1}>
        <Text size="xs" style={{ opacity: 0.5 }}>{sublabel}</Text>
        <Text fw={700} size="sm">{label}</Text>
      </Stack>
    </Paper>
  </Anchor>
);

/* ── Info pills ── */
const InfoRow = ({ icon: Icon, text }) => (
  <Group gap="xs" align="center">
    <Icon size={14} style={{ opacity: 0.55, flexShrink: 0 }} />
    <Text size="sm" style={{ opacity: 0.7 }}>{text}</Text>
  </Group>
);

/* ── Page ── */
export default function DownloadPage() {
  const { t } = useTranslation();
  const refLeft = useFadeIn(0);
  const refRight = useFadeIn(120);

  return (
    <Base>
      <Box maw={900} mx="auto" p={{ base: "md", sm: "xl" }}>
        <Stack gap="xl">

          {/* Header */}
          <Stack gap={4}>
            <Badge variant="light" radius="xl" size="sm" w="fit-content">
              {t("download.badge")}
            </Badge>
            <Title order={2} fz={{ base: "1.5rem", sm: "2rem" }} fw={700} style={{ letterSpacing: "-0.02em" }}>
              {t("download.title")}
            </Title>
            <Text size="sm" style={{ opacity: 0.6 }}>{t("download.subtitle")}</Text>
          </Stack>

          {/* Main card */}
          <Paper withBorder radius="xl" p={{ base: "lg", sm: "xl" }}>
            <Group
              gap="xl"
              align="center"
              wrap="wrap"
              style={{ flexDirection: "row" }}
            >

              {/* Phone mockup */}
              <Box ref={refLeft} style={{ display: "flex", justifyContent: "center" }}>
                <PhoneMockup />
              </Box>

              {/* Right content */}
              <Stack ref={refRight} gap="lg" style={{ flex: 1, minWidth: 240 }}>

                <Stack gap={4}>
                  <Text fw={700} fz="1.2rem" style={{ letterSpacing: "-0.01em" }}>
                    Limpora
                  </Text>
                  <Text size="sm" style={{ opacity: 0.6 }}>
                    {t("download.app_description")}
                  </Text>
                </Stack>

                {/* Meta info */}
                <Stack gap={8}>
                  <InfoRow icon={Smartphone} text={t("download.info.android")} />
                  <InfoRow icon={Wifi} text={t("download.info.size")} />
                  <InfoRow icon={Star} text={t("download.info.version")} />
                  <InfoRow icon={ShieldCheck} text={t("download.info.verified")} />
                </Stack>

                <Divider />

                {/* Download button */}
                <DownloadButton
                  href="/limpora.apk"
                  sublabel={t("download.btn.sublabel")}
                  label={t("download.btn.label")}
                />

                {/* Warning */}
                <Paper radius="lg" p="sm" style={{ background: "var(--mantine-color-yellow-light)" }}>
                  <Group gap="xs" align="flex-start">
                    <AlertTriangle size={14} style={{ marginTop: 2, flexShrink: 0, opacity: 0.7 }} />
                    <Text size="xs" lh={1.6} style={{ opacity: 0.8 }}>
                      {t("download.warning")}
                    </Text>
                  </Group>
                </Paper>

              </Stack>
            </Group>
          </Paper>

        </Stack>
      </Box>
    </Base>
  );
}