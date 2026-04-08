import { useState, useEffect } from "react";
import Base from "../../layouts/Base";
import { ProviderCard } from "../../components/ProviderCard";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import {
  Box,
  Button,
  Center,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { API } from "../../lib/api";
import type { ProviderService, Service, User } from "@limpora/common";
import { useTranslation } from "react-i18next";

type UserSummary = Pick<
  User,
  "name" | "role" | "id" | "total_points" | "member_since"
> & {
  provider_services?: ProviderService[];
};

export default function UserFinder() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserSummary[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [activeServices, setActiveServices] = useState<string[]>([]);

  const { t } = useTranslation();

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchServices()]);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [debouncedSearch, activeServices, users]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: userData, error: userError } = await API.user.get();

    if (!userError && userData) {
      const providers = (userData as UserSummary[]).filter(
        (u) => u.role === "provider"
      );

      const hydratedProviders: UserSummary[] = await Promise.all(
        providers.map(async (user) => {
          const { data: sData, error: sError } = await API.providers({
            provider_id: user.id,
          }).services.get();

          return {
            id: user.id,
            name: user.name,
            role: user.role,
            total_points: user.total_points,
            member_since: user.member_since,
            provider_services: !sError && sData ? sData : [],
          };
        })
      );

      setUsers(hydratedProviders);
    }
    setLoading(false);
  };

  const fetchServices = async () => {
    const { data, error } = await API.services.get();
    if (!error && data) setServices(data);
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter((u) =>
        u.name.toLowerCase().includes(query)
      );
    }

    if (activeServices.length > 0) {
      filtered = filtered.filter((u) => {
        return u.provider_services?.some((ps) =>
          activeServices.includes(ps.service_name)
        );
      });
    }

    setFilteredUsers(filtered);
  };

  const toggleService = (serviceName: string) => {
    setActiveServices((prev) =>
      prev.includes(serviceName)
        ? prev.filter((name) => name !== serviceName)
        : [...prev, serviceName]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setActiveServices([]);
  };

  const hasFilters = activeServices.length > 0 || searchTerm !== "";

  return (
    <Base>
      <Stack gap="lg">
        <Paper withBorder p="lg">
          <Stack gap="md">
            <TextInput
              placeholder={t("search.input.placeholder")}
              leftSection={<Search size={18} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.currentTarget.value)}
              size="md"
            />

            <Group gap="xs" wrap="wrap">
              {services.map((s) => {
                const isActive = activeServices.includes(s.name);
                return (
                  <Button
                    key={s.id}
                    onClick={() => toggleService(s.name)}
                    size="xs"
                    radius="lg"
                    variant={isActive ? "filled" : "light"}
                    color={isActive ? "blue" : "gray"}
                  >
                    {s.name}
                  </Button>
                );
              })}
            </Group>

            {hasFilters && (
              <Button
                onClick={clearFilters}
                size="xs"
                variant="light"
                color="red"
                w="fit-content"
              >
                Limpiar filtros
              </Button>
            )}
          </Stack>
        </Paper>

        <Paper withBorder p="lg">
          <Title order={2} fz="1.25rem" fw={600} mb="lg">
            {t("search.title", { count: filteredUsers.length })}
          </Title>

          {loading ? (
            <Center py={64}><Loader size="lg" /></Center>
          ) : filteredUsers.length === 0 ? (
            <Text ta="center" py={64} fz="lg" c="dimmed">
              No se encontraron usuarios
            </Text>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
              {filteredUsers.map((user) => (
                <Link
                  key={user.id}
                  to="/booking"
                  state={{ userId: user.id }}
                  style={{ textDecoration: "none" }}
                >
                  <Box
                    style={{
                      transition: "transform 0.2s ease",
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    <ProviderCard user={user} />
                  </Box>
                </Link>
              ))}
            </SimpleGrid>
          )}
        </Paper>
      </Stack>
    </Base>
  );
}