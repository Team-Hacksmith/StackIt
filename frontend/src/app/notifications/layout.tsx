import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications | StackIt",
  description: "View your notifications",
};

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
