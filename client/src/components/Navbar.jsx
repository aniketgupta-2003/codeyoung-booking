import { useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import { navLinks } from "../data/constants";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-20">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Logo />

        <ul className="hidden items-center gap-9 text-sm font-medium text-slate-700 md:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a href={link.href} className="transition hover:text-indigo-600">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#book"
          className="hidden rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white! shadow-md shadow-indigo-200 transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 md:inline-block"
        >
          Book a Free Trial
        </a>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="rounded-lg p-2 text-slate-700 hover:bg-white md:hidden"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {open && (
        <div className="mx-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg md:hidden">
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#book"
            onClick={() => setOpen(false)}
            className="mt-3 block rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white!"
          >
            Book a Free Trial
          </a>
        </div>
      )}
    </header>
  );
}
