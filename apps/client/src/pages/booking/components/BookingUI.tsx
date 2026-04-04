import { Paper, Text, UnstyledButton, Group } from "@mantine/core";
import { type SlotState } from "../utils";
import { useTranslation } from "react-i18next";

export const ToggleButton = ({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (

  <UnstyledButton onClick={onClick} style={{ width: "100%" }}>
    <Paper
      withBorder
      p="sm"
      ta="center"
      style={{
        cursor: "pointer",
        backgroundColor: selected ? "var(--mantine-color-default-color)" : undefined,
        transition: "all 0.15s",
      }}
    >
      <Text size="sm" fw={500} c={selected ? "var(--mantine-color-body)" : "dimmed"}>
        {children}
      </Text>
    </Paper>
  </UnstyledButton>
);


export const SlotButton = ({
  slot,
  state,
  selected,
  onClick,
}: {
  slot: string;
  state: SlotState;
  selected: boolean;
  onClick: () => void;
}) => {
  const { t } = useTranslation();

  const slotStyles: Record<SlotState, { bg?: string; text: string; label?: string }> = {
    available: { text: "dimmed" },
    occupied: {
      bg: "var(--mantine-color-red-0)",
      text: "var(--mantine-color-red-6)",
      label: t("booking.slot_states.occupied"),
    },
    past: { bg: "var(--mantine-color-gray-1)", text: "var(--mantine-color-gray-5)" },
    outside: {
      bg: "var(--mantine-color-gray-1)",
      text: "var(--mantine-color-gray-4)",
      label: t("booking.slot_states.outside"),
    },
  };

  const disabled = state === "occupied" || state === "past" || state === "outside";
  const styles = slotStyles[state];

  return (
    <UnstyledButton
      onClick={disabled ? undefined : onClick}
      style={{ width: "100%", cursor: disabled ? "not-allowed" : "pointer" }}
    >
      <Paper
        withBorder
        p="xs"
        ta="center"
        style={{
          backgroundColor: selected ? "var(--mantine-color-default-color)" : styles.bg,
          opacity: state === "past" || state === "outside" ? 0.45 : 1,
        }}
      >
        <Text size="sm" fw={500} c={selected ? "var(--mantine-color-body)" : styles.text}>
          {slot}
        </Text>
        {!selected && styles.label && (
          <Text size="10px" c={styles.text} mt={2}>
            {styles.label}
          </Text>
        )}
      </Paper>
    </UnstyledButton>
  );
};