import { useEffect, useState } from "react";
import Base from "../../layouts/Base";
import { getUserEarnings } from "../../services/earnings.service";
import {
  Avatar,
  Box,
  Center,
  Grid,
  Group,
  Loader,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Badge,
} from "@mantine/core";

function StatCard({ label, value }) {
  return (
    <Paper withBorder p="md" shadow="xs" style={{ flex: 1 }}>
      <Stack align="center" gap={4}>
        <Text size="sm" c="gray.5">{label}</Text>
        <Text fw={700} fz="lg" c="gray.9">{value}</Text>
      </Stack>
    </Paper>
  );
}

function UserInfoDisplay({ earnings }) {
  return (
    <Paper shadow="md" p="lg" h="100%">
      <Stack gap="lg" h="100%">
        <Group justify="center">
          <Avatar
            src="https://placehold.co/300x300"
            alt="User"
            size={128}
            radius="50%"
          />
        </Group>
        <Stack gap="sm" style={{ flex: 1 }}>
          <StatCard label="Citas cerradas" value={earnings?.closed_appointments || 0} />
          <StatCard label="Citas canceladas" value={earnings?.cancelled_appointments || 0} />
          <StatCard label="Dinero total" value={`$${earnings?.total_money || 0}`} />
          <StatCard label="Dinero retenido" value={`$${earnings?.retained_money || 0}`} />
        </Stack>
      </Stack>
    </Paper>
  );
}

function Appointment({ date, requesterName, totalPrice, status }) {
  const isCompleted = status === "Completed";
  const formattedDate = new Date(date).toLocaleDateString();

  return (
    <Paper
      p="md"
    
      shadow="xs"
      bg={isCompleted ? "green.0" : "yellow.0"}
    >
      <Group justify="space-between">
        <Stack gap={2}>
          <Text fw={600} c={isCompleted ? "green.9" : "yellow.9"}>{requesterName}</Text>
          <Text size="sm" c="gray.5">{formattedDate}</Text>
        </Stack>
        <Text fw={700} c="gray.9">${totalPrice}</Text>
      </Group>
    </Paper>
  );
}

function UserAppointmentsClosedList({ appointments }) {
  return (
    <Paper shadow="md" p="lg" h="100%">
      <Stack h="100%" gap="md">
        <Title order={3} fz="1.25rem" fw={600} c="gray.8">
          Appointments
        </Title>
        <ScrollArea style={{ flex: 1 }}>
          <Stack gap="sm">
            {appointments && appointments.length > 0 ? (
              appointments.map((appt) => (
                <Appointment
                  key={appt.id}
                  date={appt.date_time}
                  requesterName={appt.requester_name}
                  totalPrice={appt.total_amount}
                  status={appt.status}
                />
              ))
            ) : (
              <Text c="gray.5" ta="center">No appointments yet</Text>
            )}
          </Stack>
        </ScrollArea>
      </Stack>
    </Paper>
  );
}

export default function Currency() {
  const [data, setData] = useState({ earnings: null, appointments: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = 1;
        const result = await getUserEarnings(userId);
        setData({
          earnings: result.earnings,
          appointments: result.appointments,
        });
      } catch (error) {
        console.error("Error fetching earnings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Base>
        <Center h="100%">
          <Loader size="sm" />
        </Center>
      </Base>
    );
  }

  return (
    <Base>
      <SimpleGrid
        cols={{ base: 1, md: 2 }}
        spacing="lg"
        maw={1152}
        mx="auto"
        p="lg"
        h="100%"
      >
        <UserInfoDisplay earnings={data.earnings} />
        <UserAppointmentsClosedList appointments={data.appointments} />
      </SimpleGrid>
    </Base>
  );
}