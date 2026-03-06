import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Stack, Text, Paper, Group, Box, Divider,
  Loader, Center, Title, Button, Badge,
} from "@mantine/core";
import Base from "../../layouts/Base";
import { API } from "../../lib/api";
import type { Review } from "@limpora/common";

function Stars({ rating }: { rating: number }) {
  return (
    <Group gap={2}>
      {Array.from({ length: 5 }, (_, i) => (
        <Text key={i} size="md" c={i < rating ? "yellow.5" : "gray.3"} style={{ lineHeight: 1 }}>
          ★
        </Text>
      ))}
    </Group>
  );
}

export default function AppointmentReviewPage() {
  const location  = useLocation();
  const navigate  = useNavigate();

  const appointmentId: number = location.state?.appointmentId;

  const [review,  setReview]  = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!appointmentId) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await API.reviews
          .appointment({ appointment_id: appointmentId })
          .get();
        if (error) { setNotFound(true); return; }
        setReview(data as Review ?? null);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [appointmentId]);

  const hue = review
    ? [...review.reviewer_name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360
    : 0;

  const date = review
    ? new Date(review.created_at).toLocaleDateString("es-ES", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  return (
    <Base>
      <Stack maw={560} mx="auto" p="lg" gap="lg">

        <Group gap="sm">
          <Button
            variant="subtle"
            color="gray"
            size="xs"
            leftSection={"<"}
            onClick={() => navigate(-1)}
          >
            Volver
          </Button>
        </Group>

        <Box>
          <Title order={1} fz="1.5rem" fw={600}>Reseña de la cita</Title>
          <Text size="sm" c="dimmed" mt={4}>
            Cita #{appointmentId}
          </Text>
        </Box>

        {!appointmentId ? (
          <Text c="red" size="sm">No se proporcionó una cita.</Text>
        ) : loading ? (
          <Center py="xl"><Loader size="sm" /></Center>
        ) : notFound || !review ? (
          <Paper withBorder p="xl" radius="md" ta="center">
            <Text fz={32} mb="xs">📭</Text>
            <Text fw={500}>Sin reseña</Text>
            <Text size="sm" c="dimmed" mt={4}>
              Esta cita todavía no tiene ninguna reseña publicada.
            </Text>
          </Paper>
        ) : (
          <Paper withBorder p="lg" radius="md">
            <Group justify="space-between" mb="md" wrap="nowrap">
              <Group gap="sm">
                <Box
                  w={40} h={40}
                  style={{
                    borderRadius: "50%",
                    background: `hsl(${hue}, 55%, 50%)`,
                    display: "flex", alignItems: "center",
                    justifyContent: "center", flexShrink: 0,
                  }}
                >
                  <Text size="sm" fw={700} c="white">
                    {review.reviewer_name.charAt(0).toUpperCase()}
                  </Text>
                </Box>
                <Box>
                  <Text fw={600}>{review.reviewer_name}</Text>
                  <Text size="xs" c="dimmed">{date}</Text>
                </Box>
              </Group>
              <Stack gap={4} align="flex-end">
                <Stars rating={review.rating} />
                <Badge variant="light" color="yellow" size="xs">
                  {review.rating} / 5
                </Badge>
              </Stack>
            </Group>

            {review.content && (
              <>
                <Divider mb="md" />
                <Text size="sm" c="dimmed" style={{ lineHeight: 1.7 }}>
                  {review.content}
                </Text>
              </>
            )}
          </Paper>
        )}

      </Stack>
    </Base>
  );
}