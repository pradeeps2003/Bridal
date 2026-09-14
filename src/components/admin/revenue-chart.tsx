"use client";

import { useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, X } from "lucide-react";

const chartData = [
  { date: "Mon", revenue: 12500 },
  { date: "Tue", revenue: 15400 },
  { date: "Wed", revenue: 11200 },
  { date: "Thu", revenue: 24500 },
  { date: "Fri", revenue: 32000 },
  { date: "Sat", revenue: 45000 },
  { date: "Sun", revenue: 28000 },
];

const TooltipContent = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { date: string } }> }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-3 shadow-md">
      <p className="text-xs text-[var(--color-muted-foreground)] mb-1">{payload[0].payload.date}</p>
      <p className="font-semibold text-[var(--color-foreground)]">{formatCurrency(payload[0].value)}</p>
    </div>
  );
};

function Chart({ height }: { height: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} tickFormatter={(v) => `₹${v / 1000}k`} dx={-8} />
        <Tooltip content={<TooltipContent />} />
        <Area type="monotone" dataKey="revenue" stroke="var(--color-accent)" strokeWidth={2} fillOpacity={1} fill="url(#revenueGrad)" activeDot={{ r: 5, strokeWidth: 0, fill: "var(--color-accent)" }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function RevenueChart() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Thumbnail card */}
      <motion.div
        layoutId="rev-chart"
        onClick={() => setIsOpen(true)}
        className="cursor-pointer rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <motion.h3 layoutId="rev-title" className="font-semibold text-base">Revenue Overview</motion.h3>
            <motion.p layoutId="rev-sub" className="text-xs text-[var(--color-muted-foreground)]">Last 7 days — click to expand</motion.p>
          </div>
          <motion.div layoutId="rev-icon" className="rounded-lg bg-[var(--color-muted)] p-2 text-[var(--color-muted-foreground)]">
            <Maximize2 className="h-4 w-4" />
          </motion.div>
        </div>
        <div className="pointer-events-none h-[120px] w-full">
          <Chart height={120} />
        </div>
      </motion.div>

      {/* Full-screen modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[99] bg-black/60 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 pointer-events-none">
              <motion.div
                layoutId="rev-chart"
                className="pointer-events-auto flex w-full max-w-4xl flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-2xl sm:p-8"
              >
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <motion.h3 layoutId="rev-title" className="font-semibold text-xl sm:text-2xl">Revenue Overview</motion.h3>
                    <motion.p layoutId="rev-sub" className="mt-1 text-sm text-[var(--color-muted-foreground)]">7-day earnings performance</motion.p>
                  </div>
                  <motion.button
                    layoutId="rev-icon"
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg bg-[var(--color-muted)] p-2 text-[var(--color-foreground)] hover:bg-[var(--color-border)] transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </div>
                <div className="h-[360px] w-full">
                  <Chart height={360} />
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
