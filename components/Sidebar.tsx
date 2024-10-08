import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { HomeIcon, FlipHorizontalIcon, ZapIcon } from "lucide-react";
import path from "path";
import { cn } from "@/modules/utils";

export const Nav_Links = [
  {
    label: "Home",
    icon: <HomeIcon />,
    path: "/",
  },
  {
    label: "Transfer",
    icon: <FlipHorizontalIcon />,
    path: "/transfer",
  },
  {
    label: "Stake",
    icon: <ZapIcon />,
    path: "/stake",
  },
];
const Sidebar: React.FC = () => {
  const router = useRouter();

  return (
    <aside className="w-64 max-lg:hidden">
      <div className="divide-y divide-dialog-border">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        </div>

        <nav className="p-4">
          <ul>
            {Nav_Links.map(({ label, icon, path }) => {
              const isActive = router.pathname === path;
              return (
                <li className="mb-4" key={label}>
                  <Link
                    href={path}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg text-muted-foreground transition-colors duration-300 ease-in-out",
                      {
                        "bg-sec-btn/15 font-semibold text-sec-btn":
                          isActive,
                        "hover:bg-sec-btn/15 hover:text-sec-btn": !isActive,
                      }
                    )}
                  >
                    {icon}
                    {label}
                  </Link>
                </li>
              );
            })}
            {/* <li className="mb-4">
              <Link
                href="/"
                className={`flex items-center p-2 rounded-lg ${
                  isActive("/") ? "bg-sec-btn" : "hover:bg-gray-700"
                }`}
              >
                <HomeIcon className="mr-2" />
                Home
              </Link>
            </li>
            <li className="mb-4">
              <Link
                href="/transfer"
                className={`flex items-center p-2 rounded-lg ${
                  isActive("/transfer") ? "bg-blue-600" : "hover:bg-gray-700"
                }`}
              >
                <FlipHorizontalIcon className="mr-2" />
                Transfer
              </Link>
            </li> */}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
