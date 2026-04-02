import { useUserPanel } from "./useUserPanel";
import { useServices } from "./useServices";
import { useReviews } from "./useReviews";
import ProfileHeader from "./components/ProfileHeader";
import InfoSection from "./components/InfoSection";
import MetricsBar from "./components/MetricsBar";
import ServicesSection from "./components/ServicesSection";
import Base from "../../../layouts/Base";
import { Box, Loader, Center, Text, Paper, Stack } from "@mantine/core";
import ScheduleSettings from "../ScheduleSettings";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function UserPanel() {
  const { targetUser, isSelf, loading, error, handleLogout } = useUserPanel();
  const services = useServices(targetUser, isSelf);
  const navigate = useNavigate();

  if (loading)
    return (
      <Base>
        <Center maw={1152} mx="auto" p="xl">
          <Loader size="sm" />
        </Center>
      </Base>
    );

  useEffect(() => {
    if (error || !targetUser) navigate("/login");
  }, [error, targetUser]);

  if (error || !targetUser) return null;

  return (
    <Base>
      <Box maw={1152} mx="auto" p={{ base: "md", sm: "xl" }}>
        <Paper withBorder radius="md">
          <ProfileHeader
            targetUser={targetUser}
            isSelf={isSelf}
            onLogout={handleLogout}
          />

          <Stack gap="lg" p="lg">
            <InfoSection targetUser={targetUser} />
            <MetricsBar targetUser={targetUser} />

            {targetUser.role === "provider" && (
              <ServicesSection isSelf={isSelf} {...services} />
            )}
            {targetUser.role === "provider" && (
              <ScheduleSettings providerId={targetUser.id} isSelf={isSelf} />
            )}
          </Stack>
        </Paper>
      </Box>
    </Base>
  );
}
