import { Link, useLocation } from "react-router-dom";
import lang from "../utils/LangManager";
import { Group, Anchor, ActionIcon, Paper, Box, Stack } from "@mantine/core";
import { UserCircle, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { name: "nav.items.path.root", to: "/" },
  { name: "nav.items.path.currency", to: "/currency" },
  { name: "nav.items.path.appointments", to: "/appointments" },
  { name: "nav.items.path.userfinder", to: "/userfinder" },
  { name: "nav.items.path.topusers", to: "/top" },
];

// Visibles siempre en la barra
const mainItems = [
  { name: "nav.items.path.root", to: "/" },
  { name: "nav.items.path.userfinder", to: "/userfinder" }, // "Buscar" es suficiente
  { name: "nav.items.path.appointments", to: "/appointments" }, // Citas
];

// En la hamburguesa
const menuItems = [
  { name: "nav.items.path.currency", to: "/currency" }, // Ganancias
  { name: "nav.items.path.topusers", to: "/top" }, // Profesionales
];

const NavItem = ({
  item,
  pathname,
  onClick,
}: {
  item: (typeof navItems)[0];
  pathname: string;
  onClick?: () => void;
}) => {
  const isActive = pathname === item.to;
  return (
    <Anchor
      component={Link}
      to={item.to}
      size="sm"
      fw={isActive ? 600 : 400}
      px="md"
      py={7}
      onClick={onClick}
      style={{
        borderRadius: "var(--mantine-radius-xl)",
        whiteSpace: "nowrap",
        textDecoration: "none",
        position: "relative",
        transition: "opacity 0.2s ease",
        opacity: isActive ? 1 : 0.6,
        display: "block",
      }}
      styles={{
        root: {
          backgroundColor: isActive
            ? "var(--mantine-color-primary-light)"
            : "transparent",
          "&:hover": {
            textDecoration: "none",
            opacity: 1,
            backgroundColor: isActive
              ? "var(--mantine-color-primary-light)"
              : "var(--mantine-color-gray-0)",
          },
        },
      }}
    >
      {isActive && (
        <Box
          component="span"
          style={{
            position: "absolute",
            bottom: 3,
            left: "50%",
            transform: "translateX(-50%)",
            width: 4,
            height: 4,
            borderRadius: "50%",
            backgroundColor: "var(--mantine-color-primary-filled)",
            opacity: 0.8,
          }}
        />
      )}
      {lang(item.name)}
    </Anchor>
  );
};

const Navbar = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <Paper px="md" py="sm" radius="xl" shadow="xs" withBorder component="nav">
      <Group justify="space-between" wrap="nowrap">
        {/* Desktop: todos */}
        <Group gap={4} wrap="nowrap" visibleFrom="sm">
          {navItems.map((item) => (
            <NavItem key={item.to} item={item} pathname={pathname} />
          ))}
        </Group>

        {/* Mobile: main items siempre visibles */}
        <Group gap={4} wrap="nowrap" hiddenFrom="sm" style={{ flex: 1 }}>
          {mainItems.map((item) => (
            <NavItem key={item.to} item={item} pathname={pathname} />
          ))}
        </Group>

        {/* Mobile: botón hamburguesa */}
        <ActionIcon
          hiddenFrom="sm"
          variant="subtle"
          size="lg"
          radius="xl"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menú"
          style={{ transition: "transform 0.2s ease" }}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </ActionIcon>

        {/* Perfil */}
        <ActionIcon
          component={Link}
          to="/panel/me"
          variant="subtle"
          size="lg"
          radius="xl"
          aria-label="Perfil"
          style={{ flexShrink: 0, transition: "transform 0.2s ease" }}
          styles={{ root: { "&:hover": { transform: "scale(1.08)" } } }}
        >
          <UserCircle size={28} />
        </ActionIcon>
      </Group>

      {/* Menú desplegable mobile */}
      <Box
        hiddenFrom="sm"
        style={{
          overflow: "hidden",
          maxHeight: open ? 300 : 0,
          transition: "max-height 0.3s ease",
        }}
      >
        <Stack gap={4} pt="sm">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              item={item}
              pathname={pathname}
              onClick={() => setOpen(false)}
            />
          ))}
        </Stack>
      </Box>
    </Paper>
  );
};

export default Navbar;
