"use client";

import { usePathname, useRouter } from "next/navigation";
import Dock from "./Dock";
import { Home, ArrowDownToLine, ArrowUpFromLine, FileCode } from "lucide-react";

const DOCK_ITEMS = [
  {
    label: "Home",
    path: "/",
    icon: <Home className="h-6 w-6 text-white" />,
  },
  {
    label: "Receive",
    path: "/receive",
    icon: <ArrowDownToLine className="h-6 w-6 text-white" />,
  },
  {
    label: "Send",
    path: "/send",
    icon: <ArrowUpFromLine className="h-6 w-6 text-white" />,
  },
  {
    label: "Contract",
    path: "/contract",
    icon: <FileCode className="h-6 w-6 text-white" />,
  },
];

export function DockNav() {
  const router = useRouter();
  const pathname = usePathname();

  const items = DOCK_ITEMS.map((item) => ({
    ...item,
    onClick: () => router.push(item.path),
    className: pathname === item.path ? "ring-2 ring-white/50" : "",
  }));

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4">
      <Dock items={items} />
    </div>
  );
}
