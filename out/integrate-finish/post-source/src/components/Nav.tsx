"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { enginesByRelease } from "@/app/integrate/engines";

type NavItem = {
  href: string;
  label: string;
  group: "operate" | "army" | "product" | "quiet";
  quiet?: boolean;
};

const links: NavItem[] = [
 // A Operate
 { href: "/hx", label: "Mission", group: "operate" },
 { href: "/briefing", label: "Briefing", group: "operate" },
 { href: "/hydra", label: "Hydra", group: "operate" },
 { href: "/swarm", label: "Swarm", group: "operate" },
  { href: "/org", label: "Org", group: "operate" },
  { href: "/meeting", label: "Meeting", group: "operate" },
  // B Agent Army: every agent harness on one page (/integrate)
  { href: "/integrate", label: "Agent Army", group: "army" },
  // C Product
  { href: "/how-it-works", label: "How it works", group: "product" },
  { href: "/showcase", label: "Showcase", group: "product" },
  { href: "/visuals", label: "Visuals", group: "product" },
  // C Quiet
  { href: "/hx/log", label: "Daily Log", group: "quiet", quiet: true },
];

const operate = links.filter((l) => l.group === "operate");
const army = links.filter((l) => l.group === "army");
const product = links.filter((l) => l.group === "product");
// Each harness card on /integrate has id={engine.id}; these deep links use them.
const harnesses = enginesByRelease.map((e) => ({ href: `/integrate#${e.id}`, label: e.name }));
const quiet = links.filter((l) => l.group === "quiet");

function NavLink({
  href,
  label,
  quiet,
  active,
  onNavigate,
  mobile,
}: {
  href: string;
  label: string;
  quiet?: boolean;
  active: boolean;
  onNavigate?: () => void;
  mobile?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`${
        mobile ? "block w-full px-3 py-2.5 text-sm" : "rounded-md px-3 py-1.5"
      } transition ${quiet && !mobile ? "text-xs " : ""}${
        active
          ? "bg-hx-panel text-white"
          : quiet
            ? "text-hx-muted/70 hover:bg-hx-panel/40 hover:text-hx-muted"
            : "text-hx-muted hover:bg-hx-panel/60 hover:text-white"
      }${mobile ? " rounded-lg" : ""}`}
    >
      {label}
    </Link>
  );
}

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const productRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
    setProductOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!productOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProductOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (productRef.current && !productRef.current.contains(e.target as Node)) {
        setProductOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [productOpen]);

  const isActive = (href: string) =>
    href === "/hx"
      ? pathname === "/hx"
      : pathname === href || (href !== "/" && pathname.startsWith(href));

  const productActive = product.some((l) => isActive(l.href));

  return (
    <header className="sticky top-0 z-40 border-b border-hx-border/80 bg-hx-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 overflow-x-clip px-4 sm:px-6">
        <Link href="/" className="group flex min-w-0 shrink items-center gap-2">
          <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-hx-accent to-hx-cyan shadow-glow">
            <span className="h-2 w-2 rounded-full bg-white" />
          </span>
          <span className="truncate font-brand text-lg font-semibold tracking-tight">
            VidiFlow <span className="text-hx-cyan">HX</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm xl:flex" aria-label="Primary">
          {operate.map((l) => (
            <NavLink
              key={l.href}
              href={l.href}
              label={l.label}
              active={isActive(l.href)}
            />
          ))}

          <span className="mx-1 h-4 w-px bg-hx-border/80" aria-hidden />

          {army.map((l) => (
            <NavLink key={l.href} href={l.href} label={l.label} active={isActive(l.href)} />
          ))}

          <div className="relative" ref={productRef}>
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 transition ${
                productActive || productOpen
                  ? "bg-hx-panel text-white"
                  : "text-hx-muted hover:bg-hx-panel/60 hover:text-white"
              }`}
              aria-expanded={productOpen}
              aria-haspopup="menu"
              onClick={() => setProductOpen((v) => !v)}
            >
              Product{" "}
              <span className="text-[10px] opacity-70" aria-hidden>
                ▾
              </span>
            </button>
            {productOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-1 w-[17rem] max-h-[calc(100vh-4.5rem)] overflow-y-auto rounded-lg border border-hx-border bg-hx-bg/95 py-1 shadow-lg backdrop-blur-xl"
              >
                {product.map((l) => (
                  <Link
                    key={l.href}
                    role="menuitem"
                    href={l.href}
                    onClick={() => setProductOpen(false)}
                    className={`block px-3 py-2 text-sm transition ${
                      isActive(l.href)
                        ? "bg-hx-panel text-white"
                        : "text-hx-muted hover:bg-hx-panel/60 hover:text-white"
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
                <div className="my-1 border-t border-hx-border/60" role="separator" />
                <Link
                  role="menuitem"
                  href="/integrate"
                  onClick={() => setProductOpen(false)}
                  className="block px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-hx-cyan hover:text-white"
                >
                  Agent Army · all {harnesses.length} harnesses
                </Link>
                {harnesses.map((h) => (
                  <Link
                    key={h.href}
                    role="menuitem"
                    href={h.href}
                    onClick={() => setProductOpen(false)}
                    className="block px-3 py-1.5 text-sm text-hx-muted transition hover:bg-hx-panel/60 hover:text-white"
                  >
                    {h.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          <span className="mx-1 h-4 w-px bg-hx-border/80" aria-hidden />

          {quiet.map((l) => (
            <NavLink
              key={l.href}
              href={l.href}
              label={l.label}
              quiet={l.quiet}
              active={isActive(l.href)}
            />
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <a
            href="https://vidiflow.net"
            target="_blank"
            rel="noreferrer"
            className="hidden text-xs text-hx-muted hover:text-hx-cyan sm:inline"
          >
            vidiflow.net
          </a>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-hx-border text-white hover:border-hx-cyan hover:text-hx-cyan xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          className="max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-t border-hx-border/80 bg-hx-bg/95 px-3 py-2 xl:hidden"
          aria-label="Mobile"
        >
          <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-hx-muted">
            Operate
          </p>
          <ul className="flex flex-col gap-0.5">
            {operate.map((l) => (
              <li key={l.href}>
                <NavLink
                  href={l.href}
                  label={l.label}
                  active={isActive(l.href)}
                  onNavigate={() => setOpen(false)}
                  mobile
                />
              </li>
            ))}
          </ul>

          <div className="my-2 border-t border-hx-border/60" />
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-hx-muted">
            Agent Army
          </p>
          <ul className="flex flex-col gap-0.5">
            {army.map((l) => (
              <li key={l.href}>
                <NavLink
                  href={l.href}
                  label={`${l.label} · all ${harnesses.length} harnesses`}
                  active={isActive(l.href)}
                  onNavigate={() => setOpen(false)}
                  mobile
                />
              </li>
            ))}
            {harnesses.map((h) => (
              <li key={h.href}>
                <Link
                  href={h.href}
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-lg py-2 pl-6 pr-3 text-[13px] text-hx-muted transition hover:bg-hx-panel/60 hover:text-white"
                >
                  {h.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="my-2 border-t border-hx-border/60" />
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-hx-muted">
            Product
          </p>
          <ul className="flex flex-col gap-0.5">
            {product.map((l) => (
              <li key={l.href}>
                <NavLink
                  href={l.href}
                  label={l.label}
                  active={isActive(l.href)}
                  onNavigate={() => setOpen(false)}
                  mobile
                />
              </li>
            ))}
          </ul>

          <div className="my-2 border-t border-hx-border/60" />
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-hx-muted">
            Quiet
          </p>
          <ul className="flex flex-col gap-0.5 pb-1">
            {quiet.map((l) => (
              <li key={l.href}>
                <NavLink
                  href={l.href}
                  label={l.label}
                  quiet={l.quiet}
                  active={isActive(l.href)}
                  onNavigate={() => setOpen(false)}
                  mobile
                />
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
