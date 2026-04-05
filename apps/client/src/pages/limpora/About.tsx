import React from "react";
import { useTranslation } from "react-i18next";
import {
  Box, Stack, Paper, Title, Text, Group, ThemeIcon,
  Divider, Anchor, SimpleGrid, Badge,
} from "@mantine/core";
import { Mail, Globe, MapPin, Info, AlertCircle, Users } from "lucide-react";
import Base from "../../layouts/Base";

const Section = ({ icon: Icon, title, children }) => (
  <Stack gap="sm">
    <Group gap="xs">
      <ThemeIcon size={28} radius="xl" variant="light">
        <Icon size={15} />
      </ThemeIcon>
      <Text fw={600} size="sm">{title}</Text>
    </Group>
    {children}
  </Stack>
);

export default function About() {
  const { t } = useTranslation();

  return (
    <Base>
      <Box maw={720} mx="auto" p={{ base: "md", sm: "xl" }}>
        <Stack gap="xl">

          {/* Header */}
          <Stack gap={4}>
            <Badge variant="light" radius="xl" size="sm" w="fit-content">
              {t("about.badge")}
            </Badge>
            <Title order={2} fz={{ base: "1.6rem", sm: "2rem" }} fw={700} style={{ letterSpacing: "-0.02em" }}>
              {t("about.title")}
            </Title>
            <Text size="sm" style={{ opacity: 0.65 }} maw={540}>
              {t("about.description")}
            </Text>
          </Stack>

          <Divider />

          {/* What is Limpora */}
          <Paper withBorder radius="xl" p="lg">
            <Stack gap="xl">

              <Section icon={Info} title={t("about.what.title")}>
                <Text size="sm" lh={1.75} style={{ opacity: 0.75 }}>
                  {t("about.what.body")}
                </Text>
              </Section>

              <Section icon={Users} title={t("about.who.title")}>
                <Text size="sm" lh={1.75} style={{ opacity: 0.75 }}>
                  {t("about.who.body")}
                </Text>
              </Section>

              <Section icon={AlertCircle} title={t("about.disclaimer.title")}>
                <Text size="sm" lh={1.75} style={{ opacity: 0.75 }}>
                  {t("about.disclaimer.body")}
                </Text>
              </Section>

            </Stack>
          </Paper>

          {/* Contact */}
          <Stack gap="sm">
            <Text fw={600} size="sm" tt="uppercase" style={{ letterSpacing: "0.08em", opacity: 0.5 }}>
              {t("about.contact.title")}
            </Text>
            <Paper withBorder radius="xl" p="lg">
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">

                <Group gap="sm" align="flex-start">
                  <ThemeIcon size={32} radius="xl" variant="light" mt={2}>
                    <Mail size={15} />
                  </ThemeIcon>
                  <Stack gap={2}>
                    <Text size="xs" style={{ opacity: 0.5 }}>{t("about.contact.email_label")}</Text>
                    <Anchor href="mailto:soporte@limpora.es" size="sm" fw={500} underline="hover">
                      soporte@limpora.es
                    </Anchor>
                  </Stack>
                </Group>

                <Group gap="sm" align="flex-start">
                  <ThemeIcon size={32} radius="xl" variant="light" mt={2}>
                    <Globe size={15} />
                  </ThemeIcon>
                  <Stack gap={2}>
                    <Text size="xs" style={{ opacity: 0.5 }}>{t("about.contact.web_label")}</Text>
                    <Anchor href="https://limpora.es" size="sm" fw={500} underline="hover" target="_blank">
                      limpora.es
                    </Anchor>
                  </Stack>
                </Group>

                <Group gap="sm" align="flex-start">
                  <ThemeIcon size={32} radius="xl" variant="light" mt={2}>
                    <MapPin size={15} />
                  </ThemeIcon>
                  <Stack gap={2}>
                    <Text size="xs" style={{ opacity: 0.5 }}>{t("about.contact.location_label")}</Text>
                    <Text size="sm" fw={500}>España</Text>
                  </Stack>
                </Group>

              </SimpleGrid>
            </Paper>
          </Stack>

        </Stack>
      </Box>
    </Base>
  );
}