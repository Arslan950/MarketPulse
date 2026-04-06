import React from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeContext';
import logo from "../../public/logo.png";

export function AuthLayout({ title, subtitle, children, footer }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_30%)]" />
      <div className="absolute inset-y-0 left-0 hidden w-1/2 bg-[linear-gradient(135deg,rgba(16,185,129,0.08),transparent_60%)] lg:block" />

      <div className="relative z-10 flex min-h-screen">
        <section className="hidden flex-1 flex-col justify-between border-r border-border/60 px-10 py-10 lg:flex xl:px-14">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500">
                <img src={logo} alt="Logo" width={25}/>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-500/80">
                  MarketPul$e
                </p>
                <p className="text-sm text-muted-foreground">Retail intelligence workspace</p>
              </div>
            </Link>

            <button
              onClick={toggleTheme}
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card/80 text-muted-foreground transition hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>

          <div className="max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <div className="mb-6 inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1 text-sm font-medium text-emerald-500">
                Built for faster market decisions
              </div>
              <h2 className="text-5xl font-semibold leading-tight text-foreground">
                Access your command center with a calmer, cleaner workflow.
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
                Manage forecasts, signals, and customer momentum from one place with a
                secure account flow that matches the rest of MarketPulse.
              </p>
            </motion.div>
          </div>

          <div className="grid max-w-xl grid-cols-2 gap-4">
            <div className="rounded-3xl border border-border bg-card/85 p-5 shadow-sm backdrop-blur">
              <p className="text-3xl font-semibold text-foreground">24/7</p>
              <p className="mt-2 text-sm text-muted-foreground">Always-on trend visibility</p>
            </div>
            <div className="rounded-3xl border border-border bg-card/85 p-5 shadow-sm backdrop-blur">
              <p className="text-3xl font-semibold text-foreground">94%</p>
              <p className="mt-2 text-sm text-muted-foreground">Signal review accuracy benchmark</p>
            </div>
          </div>
        </section>

        <section className="flex w-full items-center justify-center px-5 py-8 sm:px-8 lg:w-[46%] lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-md rounded-[2rem] border border-border bg-card/95 p-7 shadow-2xl shadow-emerald-950/10 backdrop-blur sm:p-8"
          >
            <div className="mb-8 flex items-start justify-between gap-4 lg:hidden">
              <Link to="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">MarketPulse</p>
                  <p className="text-xs text-muted-foreground">Retail intelligence workspace</p>
                </div>
              </Link>

              <button
                onClick={toggleTheme}
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground transition hover:text-foreground"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>

            <div className="mb-8">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-emerald-500">
                Secure access
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{subtitle}</p>
            </div>

            {children}

            {footer ? <div className="mt-6">{footer}</div> : null}
          </motion.div>
        </section>
      </div>
    </div>
  );
}
