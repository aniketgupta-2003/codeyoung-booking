import { stats } from "../data/constants";

export default function StatsStrip() {
  return (
    <div className="mt-8 grid max-w-md grid-cols-3 divide-x divide-slate-200 rounded-2xl border border-slate-100 bg-white/80 py-4 shadow-sm">
      {stats.map((s) => (
        <div key={s.label} className="px-2 text-center">
          <p className="text-lg font-extrabold text-indigo-600 sm:text-xl">{s.value}</p>
          <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
