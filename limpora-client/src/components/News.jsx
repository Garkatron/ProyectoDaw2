import React from "react";
import { Paper, Text, Stack } from "@mantine/core";

const NewsItem = ({ title }) => (
  <Paper withBorder p="md" radius={0} style={{ cursor: "pointer" }}>
    <Text size="sm" fw={500}>{title}</Text>
  </Paper>
);

const NewsPanel = () => {
  return (
    <Paper withBorder p="lg" radius={0}>
      <Paper withBorder p="sm" radius={0} mb="md" ta="center">
        <Text fz="1.25rem" fw={300}>Noticias</Text>
      </Paper>

      <Stack gap="md">
        <NewsItem title="Noticia Principal del Día" />
        <NewsItem title="Actualización Importante del Sistema" />
        <NewsItem title="Análisis de Rendimiento Semanal" />
      </Stack>
    </Paper>
  );
};

export default NewsPanel;