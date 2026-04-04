import { Paper, Text } from "@mantine/core";
import Calendar, { type MarkedDate } from "../../../components/Calendar";
import { useTranslation } from "react-i18next";


interface StepCalendarProps {
  markedDates: MarkedDate[];
  selectedDate: Date | null;
  onDateClick: (date: Date) => void;
}


export default function StepCalendar({ markedDates, selectedDate, onDateClick }: StepCalendarProps) {
  const { t } = useTranslation();
  return (
    <Paper withBorder p="lg" shadow="sm">
      <Text fw={600} mb="sm">{t("booking.step1")}</Text>
      <Calendar
        markedDates={markedDates}
        onDateClick={onDateClick}
        selectedDate={selectedDate ?? new Date()}
      />
    </Paper>
  );
}