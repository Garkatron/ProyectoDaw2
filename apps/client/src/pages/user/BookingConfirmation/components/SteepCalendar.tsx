import { Paper, Text } from "@mantine/core";
import type { MarkedDate } from "../../../../components/Calendar";
import Calendar from "../../../../components/Calendar";
import lang from "../../../../utils/LangManager";

interface StepCalendarProps {
  markedDates: MarkedDate[];
  selectedDate: Date | null;
  onDateClick: (date: Date) => void;
}

export default function StepCalendar({ markedDates, selectedDate, onDateClick }: StepCalendarProps) {
  return (
    <Paper withBorder p="lg" shadow="sm">
      <Text fw={600} mb="sm">{lang("booking.step1")}</Text>
      <Calendar
        markedDates={markedDates}
        onDateClick={onDateClick}
        selectedDate={selectedDate ?? new Date()}
      />
    </Paper>
  );
}