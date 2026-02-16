import { useRoutes, Navigate } from "react-router-dom";
import { routes } from "./routes";

export const AppRouter = () => {
  const element = useRoutes([
    ...routes,
    { path: "*", element: <Navigate to="/" replace /> },
  ]);

  return element;
};
