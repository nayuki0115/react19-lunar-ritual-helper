import type { RouteObject } from "react-router-dom";
import  Home  from "@/pages/Home";
// import  Result  from "@/pages/Result";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  // {
  //   path: "/result",
  //   element: <Result />,
  // },
];
