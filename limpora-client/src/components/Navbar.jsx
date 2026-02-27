import { Link, useLocation } from "react-router-dom";
import lang from "../utils/LangManager";
import { Group, Anchor, ActionIcon, ScrollArea, Paper } from "@mantine/core";
import { UserCircle } from "lucide-react";

const navItems = [
  { name: "nav.items.path.root", to: "/" },
  { name: "nav.items.path.currency", to: "/currency" },
  { name: "nav.items.path.appointments", to: "/appointments" },
  { name: "nav.items.path.userfinder", to: "/userfinder" },
  { name: "nav.items.path.topusers", to: "/top" },
];

const Navbar = () => {
  return (
    <Paper
      p="md"
      radius="md"
      shadow="xs"
      withBorder
      component="nav"
    >
      <Group justify="space-between" wrap="nowrap">
        <ScrollArea type="hover" offsetScrollbars scrollbarSize={4}>
          <Group gap="xs" wrap="nowrap">
            {navItems.map((item) => (
              <Anchor
                key={lang(item.name)}
                component={Link}
                to={item.to}
                size="sm"
                fw={500}
                px="sm"
                py={6}
                style={{ borderRadius: "var(--mantine-radius-md)", whiteSpace: "nowrap" }}
                styles={{
                  root: {
                    "&:hover": {
                      textDecoration: "none",
                    },
                  },
                }}
              >
                {lang(item.name)}
              </Anchor>
            ))}
          </Group>
        </ScrollArea>

        <ActionIcon
          component={Link}
          to="/panel/me"
          variant="subtle"
          size="xl"
          radius="xl"
          aria-label="Perfil"
          style={{ flexShrink: 0 }}
        >
          <UserCircle size={32} />
        </ActionIcon>
      </Group>
    </Paper>
  );
};

export default Navbar;