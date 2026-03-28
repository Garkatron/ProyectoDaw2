import { useTranslation } from "react-i18next";
import {
  Box, Stack, Paper, Text, Title, Group,
  SegmentedControl, ThemeIcon, Divider, ActionIcon,
} from "@mantine/core";
import { IconLanguage, IconSettings, IconSun, IconMoon } from "@tabler/icons-react";
import { useMantineColorScheme, useComputedColorScheme } from "@mantine/core";
import Base from "../../layouts/Base";

const SettingRow = ({
  icon, title, description, control,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  control: React.ReactNode;
}) => (
  <Group justify="space-between" align="center" wrap="nowrap" gap="xl">
    <Group gap="md" align="flex-start" wrap="nowrap">
      <ThemeIcon size={38} radius="xl" variant="light" mt={2}>
        {icon}
      </ThemeIcon>
      <Stack gap={2}>
        <Text size="sm" fw={600}>{title}</Text>
        <Text size="xs" style={{ opacity: 0.6 }}>{description}</Text>
      </Stack>
    </Group>
    {control}
  </Group>
);

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { setColorScheme } = useMantineColorScheme();
  const colorScheme = useComputedColorScheme("light");

  return (
    <Base>
      <Box maw={640} mx="auto" p={{ base: "md", sm: "xl" }}>
        <Stack gap="lg">

          {/* Cabecera */}
          <Stack gap={4}>
            <Group gap="sm" align="center">
              <IconSettings size={22} stroke={1.8} style={{ opacity: 0.7 }} />
              <Title order={2} fz="1.4rem" fw={700} style={{ letterSpacing: "-0.02em" }}>
                {t("settings.title")}
              </Title>
            </Group>
            <Text size="sm" style={{ opacity: 0.55 }}>
              {t("settings.subtitle")}
            </Text>
          </Stack>

          <Divider />

          {/* Secciones */}
          <Paper withBorder radius="xl" p={{ base: "lg", sm: "xl" }}>
            <Stack gap="lg">
              <SettingRow
                icon={<IconLanguage size={17} />}
                title={t("settings.language.title")}
                description={t("settings.language.description")}
                control={
                  <SegmentedControl
                    value={i18n.language}
                    onChange={(val) => i18n.changeLanguage(val)}
                    data={[
                      { label: t("settings.language.es"), value: "es" },
                      { label: t("settings.language.en"), value: "en" },
                    ]}
                    radius="xl"
                    size="xs"
                  />
                }
              />

              <Divider />

              <SettingRow
                icon={colorScheme === "light" ? <IconSun size={17} /> : <IconMoon size={17} />}
                title={t("settings.theme.title")}
                description={t("settings.theme.description")}
                control={
                  <ActionIcon
                    onClick={() => setColorScheme(colorScheme === "light" ? "dark" : "light")}
                    variant="default"
                    size="lg"
                    radius="xl"
                    aria-label="Toggle theme"
                  >
                    {colorScheme === "light" ? <IconMoon size={16} /> : <IconSun size={16} />}
                  </ActionIcon>
                }
              />
            </Stack>
          </Paper>

        </Stack>
      </Box>
    </Base>
  );
}