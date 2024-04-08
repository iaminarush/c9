"use client";

import {
  ActionIcon,
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellNavbar,
  AppShellSection,
  Burger,
  Container,
  Group,
  ScrollArea,
  Space,
  UnstyledButton,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { default as clsx, default as cx } from "clsx";
import { signOut } from "next-auth/react";
import Link, { LinkProps } from "next/link";
import { ReactNode } from "react";
import classes from "./NavLayout.module.css";
import GlobalSearch from "@/components/globalSearch";
import { SearchByBarcode } from "@/components/searchByBarcode";
import { usePathname } from "next/navigation";

export default function NavLayout({ children }: { children: ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const pathname = usePathname();

  const initialPath = pathname?.split("/")?.[1];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { desktop: true, mobile: !opened },
      }}
      padding="md"
    >
      <AppShellHeader>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Group justify="flex-end" style={{ flex: 1 }}>
            {/* Desktop */}
            <Group ml="xl" gap={0} visibleFrom="sm">
              <LinkButton
                href="/categories"
                selected={initialPath === "categories"}
              >
                Category
              </LinkButton>

              <LinkButton
                href="/comparison"
                selected={initialPath === "comparison"}
              >
                Comparison
              </LinkButton>

              <LinkButton href="/stores" selected={initialPath === "stores"}>
                Stores
              </LinkButton>

              <LogoutButton />
              <Space w="xs" />
              <ColorSchemToggle />
            </Group>
            <SearchByBarcode />
            <GlobalSearch />
          </Group>
        </Group>
      </AppShellHeader>

      {/* Mobile */}
      <AppShellNavbar py="md" px={4}>
        <AppShellSection grow component={ScrollArea}>
          <LinkButton
            href="/categories"
            onClick={toggle}
            selected={initialPath === "categories"}
          >
            Category
          </LinkButton>

          <LinkButton
            href="/comparison"
            onClick={toggle}
            selected={initialPath === "comparison"}
          >
            Comparison
          </LinkButton>

          <LinkButton
            href="/stores"
            onClick={toggle}
            selected={initialPath === "stores"}
          >
            Stores
          </LinkButton>
        </AppShellSection>

        <Group justify="space-between" px="sm">
          <LogoutButton />
          <ColorSchemToggle />
        </Group>
      </AppShellNavbar>

      <AppShellMain>
        <Container p={0}>{children}</Container>
      </AppShellMain>
    </AppShell>
  );
}

const LogoutButton = () => {
  return (
    <UnstyledButton
      className={clsx(classes.control, classes.logout)}
      onClick={() => signOut()}
    >
      Logout
    </UnstyledButton>
  );
};

const ColorSchemToggle = () => {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  return (
    <ActionIcon
      onClick={() =>
        setColorScheme(computedColorScheme === "light" ? "dark" : "light")
      }
      variant="default"
      size="lg"
      aria-label="Toggle color scheme"
    >
      <IconSun className={cx(classes.icon, classes.light)} stroke={1.5} />
      <IconMoon className={cx(classes.icon, classes.dark)} stroke={1.5} />
    </ActionIcon>
  );
};

const LinkButton = ({
  href,
  children,
  onClick,
  selected,
}: {
  href: LinkProps["href"];
  children: ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  selected: boolean;
}) => {
  return (
    <UnstyledButton
      className={classes.control}
      data-active={selected || undefined}
      component={Link}
      href={href}
      onClick={onClick}
    >
      {children}
    </UnstyledButton>
  );
};
