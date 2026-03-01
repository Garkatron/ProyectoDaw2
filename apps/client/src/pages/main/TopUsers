import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Base from "../../layouts/Base";
import logo from "../../assets/logo-provisional.png";
import lang from "../../utils/LangManager";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Center,
  Divider,
  Grid,
  Group,
  Image,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";

const RANK_COLORS = {
  1: { bg: "#fef08a", bar: "#facc15" },
  2: { bg: "#e5e7eb", bar: "#9ca3af" },
  3: { bg: "#fed7aa", bar: "#fb923c" },
};

const getAvatarBg = (rank) => {
  if (rank === 1) return "yellow.2";
  if (rank === 2) return "gray.2";
  if (rank === 3) return "orange.2";
  return "blue.1";
};

const Podium = ({ topUsers, selectedUser, onClick }) => {
  if (!topUsers || topUsers.length < 3) return null;
  const podiumUsers = topUsers.slice(0, 3);
  const orderedUsers = [podiumUsers[1], podiumUsers[0], podiumUsers[2]];

  return (
    <Group justify="center" align="flex-end" mb="lg" pt="sm" gap="md">
      {orderedUsers.map((user) => {
        const barHeight = user.rank === 1 ? 70 : user.rank === 2 ? 55 : 40;
        const isSelected = selectedUser?.id === user.id;
        return (
          <UnstyledButton
            key={user.id}
            onClick={() => onClick(user)}
            style={{
              transform: isSelected ? "scale(1.1)" : "scale(1)",
              transition: "transform 0.2s",
            }}
          >
            <Stack align="center" gap={4}>
              <Box style={{ position: "relative" }}>
                <Box
                  w={64}
                  style={{
                    height: barHeight,
                    backgroundColor: RANK_COLORS[user.rank]?.bar,
                    borderRadius: "8px 8px 0 0",
                  }}
                />
                <Avatar
                  size={48}
                  radius="50%"
                  bg={getAvatarBg(user.rank)}
                  style={{
                    position: "absolute",
                    top: -20,
                    left: "50%",
                    transform: "translateX(-50%)",
                    border: "2px solid white",
                    fontWeight: 700,
                    fontSize: "1.125rem",
                    color: "var(--mantine-color-gray-8)",
                  }}
                >
                  {user.name[0].toUpperCase()}
                </Avatar>
              </Box>
              <Text size="sm" fw={500} c="gray.8">{user.name.split(" ")[0]}</Text>
              <Text size="xs" fw={600} c="gray.5">{user.total_points}</Text>
            </Stack>
          </UnstyledButton>
        );
      })}
    </Group>
  );
};

const UserListItem = ({ user, isSelected, onClick }) => (
  <UnstyledButton onClick={() => onClick(user)} style={{ width: "100%" }}>
    <Paper
      withBorder
      p="sm"
      radius="md"
      shadow="xs"
      bg={isSelected ? "gray.2" : "white"}
      style={{ transition: "all 0.15s" }}
    >
      <Group justify="space-between">
        <Group gap="sm">
          <Text size="sm" fw={700} c="gray.7" w={20} ta="center">{user.rank}</Text>
          <Text size="sm" fw={500} c="gray.8">{user.name}</Text>
        </Group>
        <Text size="xs" fw={600} c="gray.6">{user.total_points}</Text>
      </Group>
    </Paper>
  </UnstyledButton>
);

const MetricCard = ({ label, value }) => (
  <Paper withBorder p="md" radius="md" shadow="xs" bg="gray.0">
    <Text size="xs" fw={300} c="gray.5" tt="uppercase">{label}</Text>
    <Text fz="1.25rem" fw={600} c="gray.8">{value}</Text>
  </Paper>
);

const UserDetailPanel = ({ user, onNavigate }) => {
  if (!user) {
    return (
      <Paper withBorder p="xl" radius="md" shadow="md" h="100%">
        <Center h="100%">
          <Text c="gray.5">Selecciona un usuario para ver sus detalles</Text>
        </Center>
      </Paper>
    );
  }

  return (
    <Paper withBorder p="xl" radius="md" shadow="md" h="100%">
      <Stack gap="lg">
        <Group justify="space-between" pb="md" style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}>
          <Group gap="md">
            <Avatar size={64} radius="50%" bg={getAvatarBg(user.rank)} color="gray.7" fw={700} fz="1.875rem">
              {user.name[0].toUpperCase()}
            </Avatar>
            <Box>
              <Title order={2} fz="1.875rem" fw={300} c="gray.8">{user.name}</Title>
              <Text size="sm" c="gray.5">Rank #{user.rank}</Text>
            </Box>
          </Group>
          <Button
            onClick={() => onNavigate(user.name)}
            color="dark"
            radius="md"
            size="sm"
          >
            Ver Perfil
          </Button>
        </Group>

        <Stack gap="sm">
          <Title order={3} fz="1.25rem" fw={500} c="gray.7">Métricas Principales</Title>
          <SimpleGrid cols={2} spacing="md">
            <MetricCard label="Puntuación Total" value={user.total_points || 0} />
            <MetricCard label="Citas Completadas" value={user.completed_appointments || 0} />
            <MetricCard label="Reseñas (Avg.)" value={`${(user.avg_rating || 0).toFixed(1)}/5`} />
            <MetricCard label="Antigüedad" value={`${user.member_years || 0} años`} />
          </SimpleGrid>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default function TopUsers() {
  const [topUsers, setTopUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        setLoading(true);
        const users = await getTopUsers(10);
        setTopUsers(users);
        if (users.length > 0) setSelectedUser(users[0]);
      } catch (err) {
        console.error("Error fetching top users:", err);
        setError("Error al cargar el ranking");
      } finally {
        setLoading(false);
      }
    };
    fetchTopUsers();
  }, []);

  const handleNavigateToProfile = (username) => navigate(`/user/${username}`);

  const renderState = () => {
    if (loading) return <Center py={32}><Loader /></Center>;
    if (error) return <Alert color="red" radius="md" ta="center">{error}</Alert>;
    if (topUsers.length === 0) return <Text c="gray.5" ta="center">No hay usuarios en el ranking aún</Text>;
    return null;
  };

  const stateContent = renderState();
  const listUsers = topUsers.slice(3);

  return (
    <Base>
      <Stack maw={1152} mx="auto" p={{ base: "md", sm: "xl" }} gap="xl">

        {/* Header */}
        <Paper withBorder p="lg" radius="md">
          <Center>
            <Group gap="md">
              <Image src={logo} alt="Logo" w={128} h={128} fit="contain" style={{ flexShrink: 0 }} />
              <Title order={1} fz="1.875rem" fw={300} c="gray.8">
                {lang("topusers.title") || "Top Usuarios"}
              </Title>
            </Group>
          </Center>
        </Paper>

        {stateContent ? (
          <Box>{stateContent}</Box>
        ) : (
          <Grid>
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <Paper withBorder p="lg" radius="md" shadow="md">
                <Paper bg="gray.1" p="sm" radius="md" withBorder mb="md" ta="center">
                  <Text fz="1.25rem" fw={300} c="gray.8">
                    🏆 {lang("topusers.title.ranking") || "Ranking"}
                  </Text>
                </Paper>

                <Podium
                  topUsers={topUsers}
                  selectedUser={selectedUser}
                  onClick={setSelectedUser}
                />

                {listUsers.length > 0 && (
                  <>
                    <Divider my="md" />
                    <Paper bg="gray.1" p="sm" radius="md" withBorder mb="md" ta="center">
                      <Text fz="sm" fw={300} c="gray.7">Otros Rankeados</Text>
                    </Paper>
                    <Stack gap="sm">
                      {listUsers.map((user) => (
                        <UserListItem
                          key={user.id}
                          user={user}
                          isSelected={selectedUser?.id === user.id}
                          onClick={setSelectedUser}
                        />
                      ))}
                    </Stack>
                  </>
                )}
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 8 }}>
              <UserDetailPanel user={selectedUser} onNavigate={handleNavigateToProfile} />
            </Grid.Col>
          </Grid>
        )}
      </Stack>
    </Base>
  );
}