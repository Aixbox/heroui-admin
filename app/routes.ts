import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("login", "routes/login.tsx"),
  route("app", "routes/app.tsx", [
    index("routes/app._index.tsx"),
    route("users", "routes/app.users.tsx"),
    route("settings", "routes/app.settings.tsx"),
    route("analytics", "routes/app.analytics.tsx"),
    route("reports", "routes/app.reports.tsx"),
    route("pattern-a", "routes/app.pattern-a.tsx"),
    route("pattern-b", "routes/app.pattern-b.tsx"),
    route("profile", "routes/app.profile.tsx"),
    route("examples/form", "routes/app.examples.form.tsx"),
    route("examples/table", "routes/app.examples.table.tsx"),
    route("examples/captcha", "routes/app.examples.captcha.tsx"),
    route("examples/modal", "routes/app.examples.modal.tsx"),
    route("examples/drawer", "routes/app.examples.drawer.tsx"),
    route("exceptions/404", "routes/app.exceptions.404.tsx"),
    route("exceptions/403", "routes/app.exceptions.403.tsx"),
    route("exceptions/500", "routes/app.exceptions.500.tsx"),
  ]),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
