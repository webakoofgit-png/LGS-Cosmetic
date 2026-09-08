import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Bell,
  FileText,
  FolderTree,
  Gauge,
  Image,
  Instagram,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  ShoppingBag,
  ShieldCheck,
  Star,
  Tag,
  Users,
  X,
} from "lucide-react";
import { Link, useRouter } from "@tanstack/react-router";
import { clearAdminSession, getAdminProfile, getAdminToken } from "@/lib/admin-session";
import lgsLogo from "@/assets/lgs_logo.png";

const nav = [
  { group: "MAIN", label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { group: "CATALOG", label: "Products", href: "/admin/products", icon: Package },
  { group: "CATALOG", label: "Categories", href: "/admin/categories", icon: FolderTree },
  { group: "CATALOG", label: "Coupons", href: "/admin/coupons", icon: Tag },
  { group: "SALES", label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { group: "CONTENT", label: "Blogs", href: "/admin/blogs", icon: FileText },
  { group: "CONTENT", label: "Banners", href: "/admin/banners", icon: Image },
  { group: "CONTENT", label: "Instagram Posts", href: "/admin/instagram-posts", icon: Instagram },
  { group: "CONTENT", label: "Reviews", href: "/admin/reviews", icon: Star },
  { group: "WEBSITE", label: "Page Content", href: "/admin/content", icon: ShieldCheck },
  { group: "WEBSITE", label: "SEO", href: "/admin/seo", icon: Tag },
  { group: "SYSTEM", label: "Settings", href: "/admin/settings", icon: Settings },
  { group: "SYSTEM", label: "Admin Users", href: "/admin/admin-users", icon: Users },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState(() => getAdminProfile());

  useEffect(() => {
    setProfile(getAdminProfile());
    if (typeof window !== "undefined" && !getAdminToken()) router.navigate({ to: "/admin/login" });
  }, [router]);

  if (!profile) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f4ef] text-stone-500">
        Loading admin workspace…
      </div>
    );
  }

  const groups = Array.from(new Set(nav.map((item) => item.group)));

  return (
    <div className="min-h-screen bg-[#f7f4ef] text-stone-900">
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-[#eadfd3] bg-white transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
          collapsed ? "lg:w-[92px]" : "",
        ].join(" ")}
      >
        <div className="flex h-20 items-center gap-3 border-b border-[#f0e7dd] px-5">
          <img src={lgsLogo} alt="LGS Cosmetics" className="h-11 w-auto" />
          {!collapsed && (
            <div>
              <p className="text-xs font-bold tracking-[0.22em] text-[#7f1d1d]">LGS COSMETICS</p>
              <p className="text-[11px] text-stone-500">Admin panel</p>
            </div>
          )}
          <button className="ml-auto lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div className="mb-5" key={group}>
              {!collapsed && (
                <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.24em] text-stone-400">
                  {group}
                </p>
              )}
              {nav
                .filter((item) => item.group === group)
                .map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    to={href}
                    onClick={() => setOpen(false)}
                    className="mb-1 flex min-h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-medium text-stone-600 transition hover:bg-[#f9efef] hover:text-[#7f1d1d]"
                    activeProps={{ className: "bg-[#f5e6e6] font-semibold text-[#7f1d1d]" }}
                    title={collapsed ? label : undefined}
                  >
                    <Icon size={17} />
                    {!collapsed && <span>{label}</span>}
                  </Link>
                ))}
            </div>
          ))}
        </nav>

        <div className="border-t border-[#f0e7dd] p-3">
          <div className={`mb-3 flex items-center gap-3 rounded-2xl bg-stone-50 p-3 ${collapsed ? "justify-center" : ""}`}>
            <div className="grid size-9 place-items-center rounded-full bg-[#7f1d1d] text-xs font-bold text-white">
              {profile.name.slice(0, 1).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{profile.name}</p>
                <p className="truncate text-[11px] text-stone-500">{profile.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              clearAdminSession();
              router.navigate({ to: "/admin/login" });
            }}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-stone-600 transition hover:bg-[#f9efef] hover:text-[#7f1d1d]"
          >
            <LogOut size={17} />
            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>

      <div className={`min-h-screen ${collapsed ? "lg:pl-[92px]" : "lg:pl-[260px]"}`}>
        <header className="sticky top-0 z-30 flex h-20 items-center gap-3 border-b border-[#eadfd3] bg-white/95 px-4 backdrop-blur sm:px-6">
          <button className="grid size-10 place-items-center rounded-xl border lg:hidden" onClick={() => setOpen(true)}>
            <Menu size={19} />
          </button>
          <button
            className="hidden size-10 place-items-center rounded-xl border lg:grid"
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-stone-400">Admin workspace</p>
            <h1 className="text-base font-semibold text-[#7f1d1d]">Lucky Varieties Beauty Mall</h1>
          </div>
          <div className="hidden w-72 items-center gap-2 rounded-xl border bg-stone-50 px-3 py-2 md:flex">
            <Search size={16} className="text-stone-400" />
            <input placeholder="Search products, orders..." className="w-full bg-transparent text-sm outline-none" />
          </div>
          <button className="grid size-10 place-items-center rounded-xl border">
            <Bell size={17} />
          </button>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {open && <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setOpen(false)} />}
    </div>
  );
}

export function AdminPageHeader({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">{title}</h1>
        {sub && <p className="mt-1 text-sm text-stone-500">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageCard({ children }: { children: ReactNode }) {
  return <section className="rounded-2xl border border-[#eadfd3] bg-white p-4 shadow-sm sm:p-5">{children}</section>;
}
