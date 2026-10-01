import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Админка", template: "%s — админка MWP" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
