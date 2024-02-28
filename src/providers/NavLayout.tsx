import {
  ActionIcon,
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellNavbar,
  Burger,
  Container,
  Group,
  UnstyledButton,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconMoon, IconSun } from "@tabler/icons-react";
import cx from "clsx";
import Link from "next/link";
import { ReactNode } from "react";
import classes from "./NavLayout.module.css";
import clsx from "clsx";
import { signOut } from "next-auth/react";

export default function NavLayout({ children }: { children: ReactNode }) {
  const [opened, { toggle }] = useDisclosure();

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
            <Group ml="xl" gap={0} visibleFrom="sm">
              <UnstyledButton
                className={classes.control}
                component={Link}
                href="/categories"
              >
                Category
              </UnstyledButton>

              <UnstyledButton
                className={classes.control}
                component={Link}
                href="/comparison"
              >
                Comparison
              </UnstyledButton>

              <LogoutButton />
            </Group>

            <ColorSchemToggle />
          </Group>
        </Group>
      </AppShellHeader>

      <AppShellNavbar py="md" px={4}>
        <UnstyledButton
          className={classes.control}
          component={Link}
          href="/categories"
          onClick={toggle}
        >
          Category
        </UnstyledButton>

        <UnstyledButton
          className={classes.control}
          component={Link}
          href="/comparison"
          onClick={toggle}
        >
          Comparison
        </UnstyledButton>

        <LogoutButton />
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
