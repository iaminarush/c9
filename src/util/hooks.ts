import { useSession } from "next-auth/react";

export const useIsAdmin = () => {
  const { data } = useSession();

  return !!data?.user.admin;
};

export const useIsAuthenticated = () => {
  const { data } = useSession();

  return !!data;
};
