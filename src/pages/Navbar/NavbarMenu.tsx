import { useLogoutMutation } from "@/api/auth";
import { UserContext } from "@/contexts/UserContext";
import { Menu, Button, Portal } from "@chakra-ui/react";
import { useContext, useMemo } from "react";
import type { IconType } from "react-icons";
import { AiOutlineMenu } from "react-icons/ai";
import { FaBalanceScale, FaHome, FaScroll } from "react-icons/fa";
import { FaArrowRightArrowLeft, FaGear } from "react-icons/fa6";
import { FiLogIn, FiLogOut } from "react-icons/fi";
import { IoMdMail } from "react-icons/io";
import { IoLogInSharp } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router";

interface MenuItem {
  path: string;
  icon: IconType;
  label: string;
}

type MenuItemOrSeparator = MenuItem | typeof SEPARATOR;

const currentPageColor = "purple.600";
const SEPARATOR = "SEPARATOR" as const;

const menuItems: MenuItemOrSeparator[] = [
  { path: "/", icon: FaHome, label: "Home" },
  { path: "/app", icon: FaArrowRightArrowLeft, label: "Application" },
  { path: "/login", icon: FiLogIn, label: "Log in" },
  { path: "/signup", icon: IoLogInSharp, label: "Sign up" },
  { path: "/settings", icon: FaGear, label: "Account settings" },
  { path: "LOGOUT", icon: FiLogOut, label: "Logout" },
  SEPARATOR,
  { path: "/contact", icon: IoMdMail, label: "Contact" },
  { path: "/whitepaper", icon: FaScroll, label: "Security whitepaper" },
  { path: "/legal", icon: FaBalanceScale, label: "Legal" },
];

export const NavbarMenu = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const { pathname: actualPath } = useLocation();
  const logoutMigration = useLogoutMutation({
    showSuccessToast: true,
    navigateToAfterLogout: "/",
  });

  const getPath = (path: string) => `${path !== "/" ? path : ""}`;

  const currentPathIs = (path: string) =>
    actualPath === getPath(path) ||
    actualPath === `${getPath(path)}/` ||
    (path === "/" && actualPath === "/");

  const filteredMenuItems = useMemo(() => {
    if (user) {
      return menuItems.filter(
        (item) =>
          item === SEPARATOR ||
          (item.path !== "/login" && item.path !== "/signup"),
      );
    } else {
      return menuItems.filter(
        (item) =>
          item === SEPARATOR ||
          (item.path !== "/app" &&
            item.path !== "LOGOUT" &&
            item.path !== "/settings"),
      );
    }
  }, [user]);

  return (
    <Menu.Root
      onSelect={(event) => {
        const value = event.value as string;
        if (value === "LOGOUT") {
          logoutMigration.mutate();
          return;
        }

        navigate(`/${value}`);
      }}
    >
      <Menu.Trigger asChild>
        <Button variant="outline">
          Menu <AiOutlineMenu />
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            {filteredMenuItems.map((item, index) =>
              item === SEPARATOR ? (
                <Menu.Separator key={`separator-${index}`} />
              ) : (
                <Menu.Item
                  key={item.path}
                  value={item.path}
                  color={
                    currentPathIs(item.path) ? currentPageColor : "inherit"
                  }
                >
                  <item.icon
                    color={
                      currentPathIs(item.path) ? currentPageColor : "inherit"
                    }
                  />
                  {item.label}
                </Menu.Item>
              ),
            )}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};
