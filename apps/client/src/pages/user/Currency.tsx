import { useEffect, useState, useMemo } from "react";
import Base from "../../layouts/Base";
import {
  Avatar,
  Badge,
  Center,
  Group,
  Loader,
  Paper,
  ScrollArea,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  Title,
  ThemeIcon,
  Progress,
  Divider,
} from "@mantine/core";
import {
  IconCurrencyDollar,
  IconCalendarCheck,
  IconCalendarX,
  IconTrendingUp,
  IconLock,
} from "@tabler/icons-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Earnings {
  closed_appointments: number;
  cancelled_appointments: number;
  total_money: number;
  retained_money: number;
}

interface Appointment {
  id: string | number;
  date_time: string;
  requester_name: string;
  total_amount: number;
  status: "Completed" | "Cancelled" | string;
}

// ─── StatCard ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Paper withBorder p="md" radius="md" shadow="xs">
      <Group gap="sm" wrap="nowrap">
        <ThemeIcon size={40} radius="md" color={color} variant="light">
          {icon}
        </ThemeIcon>
        <Stack gap={2}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts={0.5}>
            {label}
          </Text>
          <Text fw={700} fz="lg" lh={1}>
            {value}
          </Text>
        </Stack>
      </Group>
    </Paper>
  );
}

// ─── RetentionBar ─────────────────────────────────────────────────────────────

function RetentionBar({ total, retained }: { total: number; retained: number }) {
  const pct = total > 0 ? Math.round((retained / total) * 100) : 0;
  return (
    <Paper withBorder p="md" radius="md" shadow="xs">
      <Stack gap={6}>
        <Group justify="space-between">
          <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts={0.5}>
            Dinero retenido
          </Text>
          <Text size="xs" fw={700} c="red.6">
            {pct}%
          </Text>
        </Group>
        <Progress value={pct} color="red.4" size="sm" radius="xl" />
        <Group justify="space-between">
          <Text size="xs" c="dimmed">${retained} retenido</Text>
          <Text size="xs" c="dimmed">${total} total</Text>
        </Group>
      </Stack>
    </Paper>
  );
}

// ─── EarningsChart ───────────────────────────────────────────────────────────

function EarningsChart({ appointments }: { appointments: Appointment[] }) {
  const monthlyData = useMemo(() => {
    const map: Record<string, { month: string; total: number; count: number }> = {};
    appointments
      .filter((a) => a.status === "Completed")
      .forEach((a) => {
        const d = new Date(a.date_time);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = d.toLocaleDateString("es", { month: "short", year: "2-digit" });
        if (!map[key]) map[key] = { month: label, total: 0, count: 0 };
        map[key].total += a.total_amount;
        map[key].count += 1;
      });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v)
      .slice(-6);
  }, [appointments]);

  if (monthlyData.length === 0) {
    return (
      <Paper withBorder p="md" radius="md" shadow="xs">
        <Text size="sm" c="dimmed" ta="center">
          Sin datos de ingresos aún
        </Text>
      </Paper>
    );
  }

  const max = Math.max(...monthlyData.map((d) => d.total));

  return (
    <Paper withBorder p="md" radius="md" shadow="xs">
      <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts={0.5} mb="sm">
        Ingresos últimos 6 meses
      </Text>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={monthlyData} barSize={24}>
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "#868e96" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            formatter={(v: number) => [`$${v}`, "Total"]}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #dee2e6",
            }}
          />
          <Bar dataKey="total" radius={[4, 4, 0, 0]}>
            {monthlyData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.total === max ? "#339af0" : "#d0ebff"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}

// ─── UserInfoDisplay ─────────────────────────────────────────────────────────

function UserInfoDisplay({
  earnings,
  appointments,
}: {
  earnings: Earnings | null;
  appointments: Appointment[];
}) {
  return (
    <Paper shadow="md" p="lg" radius="md" h="100%">
      <Stack gap="md" h="100%">
        <Group justify="center">
          <Avatar
            src="https://placehold.co/300x300"
            alt="User"
            size={96}
            radius="50%"
          />
        </Group>

        <Divider />

        <SimpleGrid cols={2} spacing="sm">
          <StatCard
            label="Cerradas"
            value={earnings?.closed_appointments ?? 0}
            icon={<IconCalendarCheck size={18} />}
            color="green"
          />
          <StatCard
            label="Canceladas"
            value={earnings?.cancelled_appointments ?? 0}
            icon={<IconCalendarX size={18} />}
            color="yellow"
          />
          <StatCard
            label="Total"
            value={`$${earnings?.total_money ?? 0}`}
            icon={<IconCurrencyDollar size={18} />}
            color="blue"
          />
          <StatCard
            label="Neto"
            value={`$${(earnings?.total_money ?? 0) - (earnings?.retained_money ?? 0)}`}
            icon={<IconTrendingUp size={18} />}
            color="teal"
          />
        </SimpleGrid>

        <RetentionBar
          total={earnings?.total_money ?? 0}
          retained={earnings?.retained_money ?? 0}
        />

        <EarningsChart appointments={appointments} />
      </Stack>
    </Paper>
  );
}

// ─── AppointmentItem ─────────────────────────────────────────────────────────

function AppointmentItem({ date, requesterName, totalPrice, status }: {
  date: string;
  requesterName: string;
  totalPrice: number;
  status: string;
}) {
  const isCompleted = status === "Completed";
  const formattedDate = new Date(date).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Paper p="sm" radius="md" shadow="xs" withBorder>
      <Group justify="space-between" wrap="nowrap">
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon
            size={32}
            radius="xl"
            color={isCompleted ? "green" : "yellow"}
            variant="light"
          >
            {isCompleted ? (
              <IconCalendarCheck size={16} />
            ) : (
              <IconCalendarX size={16} />
            )}
          </ThemeIcon>
          <Stack gap={1}>
            <Text fw={600} size="sm" lh={1.2}>
              {requesterName}
            </Text>
            <Text size="xs" c="dimmed">
              {formattedDate}
            </Text>
          </Stack>
        </Group>
        <Stack gap={4} align="flex-end">
          <Text fw={700} size="sm">
            ${totalPrice}
          </Text>
          <Badge
            size="xs"
            color={isCompleted ? "green" : "yellow"}
            variant="light"
          >
            {isCompleted ? "Completada" : "Cancelada"}
          </Badge>
        </Stack>
      </Group>
    </Paper>
  );
}

// ─── AppointmentsList ─────────────────────────────────────────────────────────

type FilterValue = "all" | "Completed" | "Cancelled";

function AppointmentsList({ appointments }: { appointments: Appointment[] }) {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [sort, setSort] = useState<"date" | "amount">("date");

  const filtered = useMemo(() => {
    let list = [...appointments];
    if (filter !== "all") list = list.filter((a) => a.status === filter);
    list.sort((a, b) =>
      sort === "date"
        ? new Date(b.date_time).getTime() - new Date(a.date_time).getTime()
        : b.total_amount - a.total_amount
    );
    return list;
  }, [appointments, filter, sort]);

  const counts = useMemo(
    () => ({
      all: appointments.length,
      completed: appointments.filter((a) => a.status === "Completed").length,
      cancelled: appointments.filter((a) => a.status === "Cancelled").length,
    }),
    [appointments]
  );

  return (
    <Paper shadow="md" p="lg" radius="md" h="100%">
      <Stack h="100%" gap="md">
        <Group justify="space-between" align="center">
          <Title order={4} fw={700} c="gray.8">
            Citas
          </Title>
          <Text size="xs" c="dimmed">
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </Text>
        </Group>

        <Group gap="xs">
          <SegmentedControl
            size="xs"
            value={filter}
            onChange={(v) => setFilter(v as FilterValue)}
            data={[
              { label: `Todas (${counts.all})`, value: "all" },
              { label: `Completadas (${counts.completed})`, value: "Completed" },
              { label: `Canceladas (${counts.cancelled})`, value: "Cancelled" },
            ]}
          />
        </Group>

        <SegmentedControl
          size="xs"
          value={sort}
          onChange={(v) => setSort(v as "date" | "amount")}
          data={[
            { label: "Por fecha", value: "date" },
            { label: "Por importe", value: "amount" },
          ]}
        />

        <ScrollArea style={{ flex: 1 }}>
          <Stack gap="sm">
            {filtered.length > 0 ? (
              filtered.map((appt) => (
                <AppointmentItem
                  key={appt.id}
                  date={appt.date_time}
                  requesterName={appt.requester_name}
                  totalPrice={appt.total_amount}
                  status={appt.status}
                />
              ))
            ) : (
              <Text c="dimmed" ta="center" size="sm" mt="xl">
                Sin citas para este filtro
              </Text>
            )}
          </Stack>
        </ScrollArea>
      </Stack>
    </Paper>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Currency() {
  const [data, setData] = useState<{
    earnings: Earnings | null;
    appointments: Appointment[];
  }>({ earnings: null, appointments: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data: result, error } = await API.currency.me.get();
        if (error) {
          console.error("Error fetching earnings:", error);
          return;
        }
        setData({
          earnings: result.earnings,
          appointments: result.appointments,
        });
      } catch (err) {
        console.error("Error fetching earnings:", err);
      } finally {
        setLoading(false);
      }
    })();
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
        <UserInfoDisplay earnings={data.earnings} appointments={data.appointments} />
        <AppointmentsList appointments={data.appointments} />
      </SimpleGrid>
    </Base>
  );
}