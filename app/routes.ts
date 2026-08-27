import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("login", "routes/login.tsx"),
  route("app", "routes/app.tsx", [
    index("routes/app._index.tsx"),
    route("users", "routes/app.users.tsx"),
    route("settings", "routes/app.settings.tsx"),
  ]),
] satisfies RouteConfig;
