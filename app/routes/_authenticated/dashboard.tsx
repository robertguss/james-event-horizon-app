import { createFileRoute, Navigate } from "@tanstack/react-router";

/**
 * Kit dashboard leftover replaced — Event Horizon kids land on /hub.
 */
export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardRedirect,
});

function DashboardRedirect() {
  return <Navigate to="/hub" />;
}
