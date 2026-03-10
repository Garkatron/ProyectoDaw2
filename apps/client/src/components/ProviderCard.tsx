import { useState, useEffect } from "react";

import type { User } from "@limpora/common";
import { Group, Text, Box, Paper, Stack, Badge, Divider, Avatar } from '@mantine/core';
import { useProfileImage } from "../hooks/useProfileImage";

type UserSummary = Pick<User, "name" | "role" | "id" | "total_points" | "member_since"> & {
  services?: { name: string }[];
  avg_rating?: number;
  city?: string;
};

const ROLE_COLORS: Record<string, string> = {
  provider: "blue",
  client: "gray",
  admin: "red",
};

const ROLE_LABELS: Record<string, string> = {
  provider: "Proveedor",
  client: "Cliente",
  admin: "Admin",
};

function Stars({ rating }: { rating: number }) {
  return (
    <Group gap={2}>
      {Array.from({ length: 5 }, (_, i) => (
        <Text
          key={i}
          size="xs"
          c={i < Math.round(rating) ? "yellow.5" : "gray.3"}
          style={{ lineHeight: 1 }}
        >
          ★
        </Text>
      ))}
      <Text size="xs" c="dimmed" ml={2}>{rating.toFixed(1)}</Text>
    </Group>
  );
}


export function ProviderCard({ user }: { user: UserSummary }) {
  const { image, error, submitting } = useProfileImage(user.id);
  const imageUrl = image ? URL.createObjectURL(image) : undefined;


  const memberYear = user.member_since
    ? new Date(user.member_since).getFullYear()
    : null;



  return (
    <Paper
      withBorder
      p="md"
      radius="md"
      style={{
        cursor: "pointer",
        transition: "box-shadow 0.15s, transform 0.15s",
        height: "100%",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "";
        e.currentTarget.style.transform = "";
      }}
    >
      <Stack gap="sm">
        {/* Header */}
        <Group gap="sm" wrap="nowrap">
          <Avatar
            size={65}
            radius="50%"
            src={imageUrl}
            alt={user.name}
            style={{
              border: '3px solid var(--mantine-color-body)',
            }}
          >
            {user.name[0].toUpperCase()}
          </Avatar>
          <Box style={{ minWidth: 0 }}>
            <Text fw={600} size="sm" truncate>
              {user.name ?? "Sin nombre"}
            </Text>
            <Group gap={6} mt={2}>
              <Badge
                size="xs"
                color={ROLE_COLORS[user.role] ?? "gray"}
                variant="light"
              >
                {ROLE_LABELS[user.role] ?? user.role}
              </Badge>
              {user.city && (
                <Text size="xs" c="dimmed" truncate>
                  📍 {user.city}
                </Text>
              )}
            </Group>
          </Box>
        </Group>

        <Divider />

        {/* Stats */}
        <Group gap="lg">
          {user.avg_rating != null && user.avg_rating > 0 && (
            <Stars rating={user.avg_rating} />
          )}
          {user.total_points != null && (
            <Group gap={4}>
              <Text size="xs" c="dimmed">⭐</Text>
              <Text size="xs" c="dimmed">{user.total_points} pts</Text>
            </Group>
          )}
          {memberYear && (
            <Text size="xs" c="dimmed">desde {memberYear}</Text>
          )}
        </Group>

        {/* Services */}
        {user.services && user.services.length > 0 && (
          <Group gap="xs" wrap="wrap">
            {user.services.slice(0, 3).map((s) => (
              <Badge key={s.name} size="xs" variant="dot" color="blue">
                {s.name}
              </Badge>
            ))}
            {user.services.length > 3 && (
              <Text size="xs" c="dimmed">+{user.services.length - 3} más</Text>
            )}
          </Group>
        )}
      </Stack>
    </Paper>
  );
}