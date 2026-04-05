import React from "react";
import { useTranslation } from "react-i18next";
import {
  Box, Stack, Text, Title, Divider, Anchor, Paper, Group, ThemeIcon, NavLink,
} from "@mantine/core";
import { FileText, Lock, Cookie, Scale } from "lucide-react";
import Base from "../../layouts/Base";

const Section = ({ id, icon: Icon, title, children }) => (
  <Box id={id} component="section">
    <Stack gap="md">
      <Group gap="xs">
        <ThemeIcon size={30} radius="xl" variant="light">
          <Icon size={15} />
        </ThemeIcon>
        <Title order={3} fz="1rem" fw={700}>{title}</Title>
      </Group>
      <Stack gap="sm">
        {children}
      </Stack>
    </Stack>
  </Box>
);

const P = ({ children }) => (
  <Text size="sm" lh={1.8} style={{ opacity: 0.75 }}>{children}</Text>
);

const Sub = ({ children }) => (
  <Text size="sm" fw={600} mt="xs">{children}</Text>
);

export default function Legal() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const nav = [
    { id: "aviso", icon: Scale, label: t("legal.nav.aviso") },
    { id: "privacidad", icon: Lock, label: t("legal.nav.privacidad") },
    { id: "cookies", icon: Cookie, label: t("legal.nav.cookies") },
    { id: "terminos", icon: FileText, label: t("legal.nav.terminos") },
  ];

  const scroll = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Base>
      <Box maw={860} mx="auto" p={{ base: "md", sm: "xl" }}>
        <Stack gap="xl">

          {/* Header */}
          <Stack gap={4}>
            <Title order={2} fz={{ base: "1.5rem", sm: "1.9rem" }} fw={700} style={{ letterSpacing: "-0.02em" }}>
              {t("legal.title")}
            </Title>
            <Text size="xs" style={{ opacity: 0.5 }}>{t("legal.updated")}: {year}</Text>
          </Stack>

          {/* Nav */}
          <Paper withBorder radius="xl" p="sm">
            <Group gap="xs" wrap="wrap">
              {nav.map(({ id, icon: Icon, label }) => (
                <NavLink
                  key={id}
                  label={label}
                  leftSection={<Icon size={13} />}
                  onClick={() => scroll(id)}
                  style={{ borderRadius: 999, width: "auto", padding: "6px 14px", cursor: "pointer" }}
                />
              ))}
            </Group>
          </Paper>

          {/* ── Aviso Legal ── */}
          <Section id="aviso" icon={Scale} title={t("legal.nav.aviso")}>
            <Sub>{t("legal.aviso.responsable_title")}</Sub>
            <P>
              {t("legal.aviso.responsable_body")}
            </P>
            <Sub>{t("legal.aviso.actividad_title")}</Sub>
            <P>{t("legal.aviso.actividad_body")}</P>
            <Sub>{t("legal.aviso.intermediario_title")}</Sub>
            <P>{t("legal.aviso.intermediario_body")}</P>
          </Section>

          <Divider />

          {/* ── Privacidad ── */}
          <Section id="privacidad" icon={Lock} title={t("legal.nav.privacidad")}>
            <Sub>{t("legal.privacidad.responsable_title")}</Sub>
            <P>{t("legal.privacidad.responsable_body")}</P>
            <Sub>{t("legal.privacidad.datos_title")}</Sub>
            <P>{t("legal.privacidad.datos_body")}</P>
            <Sub>{t("legal.privacidad.finalidad_title")}</Sub>
            <P>{t("legal.privacidad.finalidad_body")}</P>
            <Sub>{t("legal.privacidad.base_title")}</Sub>
            <P>{t("legal.privacidad.base_body")}</P>
            <Sub>{t("legal.privacidad.conservacion_title")}</Sub>
            <P>{t("legal.privacidad.conservacion_body")}</P>
            <Sub>{t("legal.privacidad.derechos_title")}</Sub>
            <P>
              {t("legal.privacidad.derechos_body")}{" "}
              <Anchor href="mailto:soporte@limpora.es" size="sm">soporte@limpora.es</Anchor>.
            </P>
            <Sub>{t("legal.privacidad.menores_title")}</Sub>
            <P>{t("legal.privacidad.menores_body")}</P>
            <Sub>{t("legal.privacidad.verificacion_title")}</Sub>
            <P>{t("legal.privacidad.verificacion_body")}</P>
          </Section>

          <Divider />

          {/* ── Cookies ── */}
          <Section id="cookies" icon={Cookie} title={t("legal.nav.cookies")}>
            <P>{t("legal.cookies.intro")}</P>
            <Sub>{t("legal.cookies.types_title")}</Sub>
            <P>{t("legal.cookies.types_body")}</P>
            <Sub>{t("legal.cookies.control_title")}</Sub>
            <P>{t("legal.cookies.control_body")}</P>
          </Section>

          <Divider />

          {/* ── Términos ── */}
          <Section id="terminos" icon={FileText} title={t("legal.nav.terminos")}>
            <Sub>{t("legal.terminos.uso_title")}</Sub>
            <P>{t("legal.terminos.uso_body")}</P>
            <Sub>{t("legal.terminos.reservas_title")}</Sub>
            <P>{t("legal.terminos.reservas_body")}</P>
            <Sub>{t("legal.terminos.comision_title")}</Sub>
            <P>{t("legal.terminos.comision_body")}</P>
            <Sub>{t("legal.terminos.responsabilidad_title")}</Sub>
            <P>{t("legal.terminos.responsabilidad_body")}</P>
            <Sub>{t("legal.terminos.ley_title")}</Sub>
            <P>{t("legal.terminos.ley_body")}</P>
          </Section>

          <Divider />

          <Text size="xs" style={{ opacity: 0.4 }} ta="center">
            © {year} Limpora · soporte@limpora.es
          </Text>

        </Stack>
      </Box>
    </Base>
  );
}