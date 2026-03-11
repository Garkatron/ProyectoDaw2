import { useState } from "react";
import {
  ActionIcon, Box, Group, Indicator, Paper,
  SimpleGrid, Text, UnstyledButton,
} from "@mantine/core";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { AppointmentStatus } from "@limpora/common";

const MONTHS = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];
const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const statusColorMap: Partial<Record<AppointmentStatus, string>> = {
  Completed: "green",
  Pending: "yellow",
  "In Process": "blue",
};

export type MarkedDate = { date: Date; status: AppointmentStatus };

export default function Calendar({
  markedDates = [],
  onDateClick,
  selectedDate,
}: {
  markedDates?: MarkedDate[];
  onDateClick: (date: Date) => void;
  selectedDate: Date;
}) {
  const [current, setCurrent] = useState(new Date());
  const [direction, setDirection] = useState(0); // 1 = forward, -1 = backward

  const changeMonth = (offset: number) => {
    setDirection(offset);
    setCurrent(new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  const normalizedMarks = markedDates.map((m) => ({
    date: m.date instanceof Date ? m.date : new Date(m.date),
    status: m.status,
    color: statusColorMap[m.status] ?? "gray",
  }));

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - firstDay.getDay());

  const days = Array.from({ length: 42 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const mark = normalizedMarks.find(
      (m) => m.date.toDateString() === date.toDateString()
    );
    const isCurrentMonth = date.getMonth() === month;
    const isSelected = selectedDate
      ? date.toDateString() === selectedDate.toDateString()
      : date.toDateString() === current.toDateString();
    return { date, mark, isCurrentMonth, isSelected };
  });

  const variants = {
    enter: (dir: number) => ({ x: dir * 40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir * -40, opacity: 0 }),
  };

  return (
    <Paper withBorder p="md" radius="md" w="100%" maw={400} mx="auto">
      {/* Header */}
      <Group justify="space-between" align="center" mb="md">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`${year}-${month}`}
            custom={direction}
            variants={{
              enter: (dir: number) => ({ x: dir * 20, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (dir: number) => ({ x: dir * -20, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <Text fw={600} fz="lg">
              {MONTHS[month]} {year}
            </Text>
          </motion.div>
        </AnimatePresence>

        <Group gap="xs">
          <ActionIcon variant="default" radius="md" onClick={() => changeMonth(-1)} aria-label="Mes anterior">
            <ChevronLeft size={16} />
          </ActionIcon>
          <ActionIcon variant="default" radius="md" onClick={() => changeMonth(1)} aria-label="Mes siguiente">
            <ChevronRight size={16} />
          </ActionIcon>
        </Group>
      </Group>

      {/* Weekday headers — estáticos, no se animan */}
      <SimpleGrid cols={7} spacing={4} mb="xs">
        {WEEKDAYS.map((w) => (
          <Text key={w} size="xs" c="dimmed" fw={600} tt="uppercase" ta="center">{w}</Text>
        ))}
      </SimpleGrid>

      {/* Day grid — animado por mes */}
      <Box style={{ position: "relative", overflow: "hidden" }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`${year}-${month}`}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <SimpleGrid cols={7} spacing={4}>
              {days.map(({ date, mark, isCurrentMonth, isSelected }) => {
                const dayContent = (
                  <UnstyledButton
                    onClick={() => {
                      if (!isCurrentMonth) return;
                      if (onDateClick) onDateClick(date);
                      setCurrent(date);
                    }}
                    style={{ width: "100%" }}
                  >
                    <Box
                      h={40}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "var(--mantine-radius-md)",
                        cursor: isCurrentMonth ? "pointer" : "default",
                        backgroundColor: isSelected
                          ? "var(--mantine-color-default-color)"
                          : mark && isCurrentMonth
                            ? `var(--mantine-color-${mark.color}-0)`
                            : undefined,
                        border: isSelected
                          ? undefined
                          : mark && isCurrentMonth
                            ? `1px solid var(--mantine-color-${mark.color}-3)`
                            : "1px solid transparent",
                        transition: "background 0.15s",
                        opacity: isCurrentMonth ? 1 : 0.3,
                      }}
                    >
                      <Text
                        size="sm"
                        fw={isSelected ? 700 : 400}
                        c={
                          isSelected
                            ? "var(--mantine-color-body)"
                            : mark && isCurrentMonth
                              ? `${mark.color}.7`
                              : "dimmed"
                        }
                      >
                        {date.getDate()}
                      </Text>
                    </Box>
                  </UnstyledButton>
                );

                if (mark && isCurrentMonth && !isSelected) {
                  return (
                    <Indicator key={date.toISOString()} size={5} color={mark.color} offset={4}>
                      {dayContent}
                    </Indicator>
                  );
                }

                return <Box key={date.toISOString()}>{dayContent}</Box>;
              })}
            </SimpleGrid>
          </motion.div>
        </AnimatePresence>
      </Box>
    </Paper>
  );
}