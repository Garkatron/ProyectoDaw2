import { Link, useLocation } from "react-router-dom";
import lang from "../utils/LangManager";
import {
  Group,
  Anchor,
  ActionIcon,
  Paper,
  Box,
  Stack,
  Text,
} from "@mantine/core";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconHome2,
  IconCurrencyEuro,
  IconCalendarEvent,
  IconUsersGroup,
  IconMail,
  IconMenu2,
  IconX,
  IconUserCircle,
  IconLanguage,
} from "@tabler/icons-react";
import i18n from "../i18n";
import { IconSettings } from "@tabler/icons-react";
import { useAuthStore } from "../stores/auth.store";

const allNavItems = [
  { name: "nav.home", to: "/", icon: IconHome2, providerOnly: false },
  {
    name: "nav.currency",
    to: "/currency",
    icon: IconCurrencyEuro,
    providerOnly: true,
  },
  {
    name: "nav.appointments",
    to: "/appointments",
    icon: IconCalendarEvent,
    providerOnly: false,
  },
  {
    name: "nav.search",
    to: "/userfinder",
    icon: IconUsersGroup,
    providerOnly: false,
  },
  { name: "nav.inbox", to: "/inbox", icon: IconMail, providerOnly: false },
  {
    name: "nav.settings",
    to: "/settings",
    icon: IconSettings,
    providerOnly: false,
  },
];

const allMainItems = [
  { name: "nav.home", to: "/", icon: IconHome2, providerOnly: false },
  {
    name: "nav.search",
    to: "/userfinder",
    icon: IconUsersGroup,
    providerOnly: false,
  },
  {
    name: "nav.appointments",
    to: "/appointments",
    icon: IconCalendarEvent,
    providerOnly: false,
  },
  {
    name: "nav.currency",
    to: "/currency",
    icon: IconCurrencyEuro,
    providerOnly: true,
  },
  { name: "nav.inbox", to: "/inbox", icon: IconMail, providerOnly: false },
];

type NavItemType = (typeof allNavItems)[0];

const NavItem = ({
  item,
  pathname,
  onClick,
  showLabel = true,
  layoutScope,
}: {
  item: NavItemType;
  pathname: string;
  onClick?: () => void;
  showLabel?: boolean;
  layoutScope: string;
}) => {
  const isActive = pathname === item.to;
  const Icon = item.icon;

  return (
    <Anchor
      component={Link}
      to={item.to}
      size="sm"
      fw={isActive ? 600 : 400}
      px={showLabel ? "md" : "sm"}
      py={7}
      onClick={onClick}
      style={{
        borderRadius: "var(--mantine-radius-xl)",
        whiteSpace: "nowrap",
        textDecoration: "none",
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 6,
        transition: "opacity 0.2s ease, transform 0.15s ease",
        opacity: isActive ? 1 : 0.6,
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.opacity = "1";
          (e.currentTarget as HTMLElement).style.transform = "scale(1.04)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.opacity = "0.6";
          (e.currentTarget as HTMLElement).style.transform = "scale(1)";
        }
      }}
    >
      {isActive && (
        <motion.span
          layoutId={`active-tab-bg-${layoutScope}`}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "var(--mantine-radius-xl)",
            backgroundColor: "var(--mantine-color-primary-light)",
            zIndex: 0,
          }}
        />
      )}

      <Icon
        size={16}
        style={{
          transition: "transform 0.2s ease",
          transform: isActive ? "scale(1.15)" : "scale(1)",
          flexShrink: 0,
          position: "relative",
          zIndex: 1,
        }}
        stroke={isActive ? 2.2 : 1.8}
      />

      {showLabel && (
        <Text
          component="span"
          size="sm"
          style={{ position: "relative", zIndex: 1 }}
        >
          {lang(item.name)}
        </Text>
      )}

      {isActive && (
        <motion.span
          layoutId={`active-indicator-${layoutScope}`}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          style={{
            position: "absolute",
            bottom: 2,
            left: "20%",
            right: "20%",
            height: 2,
            borderRadius: 999,
            backgroundColor: "var(--mantine-color-primary-filled)",
            zIndex: 1,
          }}
        />
      )}
    </Anchor>
  );
};

const Navbar = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isProvider = user?.role === "provider";

  const navItems = allNavItems.filter(
    (item) => !item.providerOnly || isProvider,
  );
  const mainItems = allMainItems.filter(
    (item) => !item.providerOnly || isProvider,
  );

  return (
    <Paper
      px="md"
      py="sm"
      radius="xl"
      shadow="xs"
      withBorder
      component="nav"
      style={{ backgroundColor: "transparent", backdropFilter: "blur(12px)" }}
    >
      <Group justify="space-between" wrap="nowrap">
        {/* Desktop — con texto */}
        <Group
          gap={4}
          wrap="nowrap"
          visibleFrom="sm"
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              item={item}
              pathname={pathname}
              layoutScope="desktop"
            />
          ))}
        </Group>
        {/* Mobile — solo iconos */}
        <Group
          gap={8}
          justify="space-evenly"
          wrap="nowrap"
          hiddenFrom="sm"
          style={{ flex: 1 }}
        >
          {mainItems.map((item) => (
            <NavItem
              key={item.to}
              item={item}
              pathname={pathname}
              showLabel={false}
              layoutScope="mobile"
            />
          ))}
        </Group>

        {/* Hamburguesa */}
        <ActionIcon
          hiddenFrom="sm"
          variant="subtle"
          size="lg"
          radius="xl"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menú"
          style={{
            transition: "transform 0.25s ease",
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
          }}
        >
          {open ? (
            <IconX size={20} stroke={1.8} />
          ) : (
            <IconMenu2 size={20} stroke={1.8} />
          )}
        </ActionIcon>

        {/* Perfil */}
        <ActionIcon
          component={Link}
          to="/panel/me"
          variant="subtle"
          size="lg"
          radius="xl"
          aria-label="Perfil"
          style={{
            flexShrink: 0,
            transition: "transform 0.2s ease",
            marginLeft: "auto",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "scale(1.12)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "scale(1)";
          }}
        >
          <IconUserCircle size={26} stroke={1.6} />
        </ActionIcon>
      </Group>

      {/* Menú desplegable mobile */}
      <Box
        hiddenFrom="sm"
        style={{
          overflow: "hidden",
          maxHeight: open ? 300 : 0,
          opacity: open ? 1 : 0,
          transition: "max-height 0.3s ease, opacity 0.25s ease",
        }}
      >
        <Stack gap={4} pt="sm">
          {navItems.map((item, i) => (
            <Box
              key={item.to}
              style={{
                transform: open ? "translateY(0)" : "translateY(-8px)",
                opacity: open ? 1 : 0,
                transition: `transform 0.25s ease ${i * 40}ms, opacity 0.25s ease ${i * 40}ms`,
              }}
            >
              <NavItem
                item={item}
                pathname={pathname}
                showLabel={true}
                layoutScope="dropdown"
                onClick={() => setOpen(false)}
              />
            </Box>
          ))}
        </Stack>
      </Box>
    </Paper>
  );
};

export default Navbar;
