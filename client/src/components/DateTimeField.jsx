import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import FormField, { fieldBase } from "./FormField";
import { timeZones } from "../data/constants";

/* ---------------------------- helpers ---------------------------- */
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const pad = (n) => String(n).padStart(2, "0");
const toDateStr = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`; // m is 0-based
const toMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

// Current date/time as it is in the parent's selected time zone
function nowInZone(timeZone) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type) => Number(parts.find((p) => p.type === type).value);
  return {
    y: get("year"),
    m: get("month") - 1,
    d: get("day"),
    h: get("hour"),
    min: get("minute"),
  };
}

// 48 half-hour slots: "00:00", "00:30" ... "23:30"
const SLOTS = Array.from(
  { length: 48 },
  (_, i) => `${pad(Math.floor(i / 2))}:${i % 2 ? "30" : "00"}`,
);

function slotLabel(slot) {
  const [h, m] = slot.split(":").map(Number);
  return `${h % 12 || 12}:${pad(m)} ${h >= 12 ? "PM" : "AM"}`;
}

function longDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

const PERIODS = [
  { id: "morning", label: "Morning", from: 6, to: 12 },
  { id: "afternoon", label: "Afternoon", from: 12, to: 18 },
  { id: "evening", label: "Evening", from: 18, to: 24 },
  { id: "night", label: "Night", from: 0, to: 6 },
];

/* ---------------------------- component ---------------------------- */
/**
 * Renders two grid children: the date field (half width) and a full-width
 * time-slot picker. Drop it inside a `grid sm:grid-cols-2` container.
 * Reports a single "YYYY-MM-DDTHH:mm" string through onChange, the same
 * format the old datetime-local input produced, so the backend is unaffected.
 */
export default function DateTimeField({ value, timeZone, onChange }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState("morning");
  const [availability, setAvailability] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");

  const now = nowInZone(timeZone);
  const todayStr = toDateStr(now.y, now.m, now.d);
  const nowMinutes = now.h * 60 + now.min;

  const [view, setView] = useState({ y: now.y, m: now.m });
  const wrapRef = useRef(null);
  const prevValue = useRef(value);
  const selfCleared = useRef(false);

  const isPast = (d, t) =>
    d < todayStr || (d === todayStr && toMinutes(t) <= nowMinutes);

  // Keep local state in sync when the parent resets the form after a booking
  useEffect(() => {
    if (value) {
      const [d, t] = value.split("T");
      setDate(d);
      setTime(t.slice(0, 5));
    } else if (prevValue.current && !selfCleared.current) {
      setDate("");
      setTime("");
    }
    prevValue.current = value;
    selfCleared.current = false;
  }, [value]);

  // If the time zone changes and the selection is now in the past, clear it
  useEffect(() => {
    if (date && date < todayStr) {
      setDate("");
      setTime("");
      emit("", "");
    } else if (date && time && isPast(date, time)) {
      setTime("");
      emit(date, "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeZone]);

  // Close the calendar on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!date) {
      setAvailability([]);
      setAvailabilityError("");
      return;
    }

    const controller = new AbortController();

    async function fetchAvailability() {
      setLoadingAvailability(true);
      setAvailabilityError("");

      try {
        const params = new URLSearchParams({
          date,
          timeZone,
        });

        const response = await fetch(
          `http://localhost:5000/api/availability?${params}`,
          { signal: controller.signal },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load availability.");
        }

        setAvailability(data.slots || []);
      } catch (error) {
        if (error.name !== "AbortError") {
          setAvailability([]);
          setAvailabilityError(
            "Unable to load available times. Please try again.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingAvailability(false);
        }
      }
    }

    fetchAvailability();

    return () => controller.abort();
  }, [date, timeZone]);

  function emit(d, t) {
    const next = d && t ? `${d}T${t}` : "";
    if (next === value) return;
    if (!next && value) selfCleared.current = true;
    onChange({ target: { name: "localStartTime", value: next } });
  }

  function toggleCalendar() {
    if (!open) {
      if (date) {
        const [y, m] = date.split("-").map(Number);
        setView({ y, m: m - 1 });
      } else {
        setView({ y: now.y, m: now.m });
      }
    }
    setOpen((o) => !o);
  }

  function pickDate(d) {
    const keepTime = time && !isPast(d, time);
    setDate(d);
    if (!keepTime) setTime("");
    emit(d, keepTime ? time : "");
    setOpen(false);
  }

  function pickTime(t) {
    setTime(t);
    emit(date, t);
  }

  function shiftMonth(delta) {
    setView((v) => {
      const total = v.y * 12 + v.m + delta;
      return { y: Math.floor(total / 12), m: total % 12 };
    });
  }

  /* calendar grid data */
  const firstWeekday = new Date(Date.UTC(view.y, view.m, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
  const cells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const canGoPrev = view.y * 12 + view.m > now.y * 12 + now.m;

  const activePeriod = PERIODS.find((p) => p.id === period);
  const periodSlots = SLOTS.filter((s) => {
    const h = Number(s.split(":")[0]);
    return h >= activePeriod.from && h < activePeriod.to;
  });

  const zoneLabel =
    timeZones.find((z) => z.value === timeZone)?.label ?? timeZone;

  return (
    <>
      {/* ---------------- Date field ---------------- */}
      <div ref={wrapRef} className="relative">
        <FormField
          id="localStartTime"
          label="Preferred date"
          icon={CalendarDays}
        >
          <button
            type="button"
            id="localStartTime"
            onClick={toggleCalendar}
            aria-haspopup="dialog"
            aria-expanded={open}
            className={`${fieldBase} pr-10 text-left ${date ? "" : "text-slate-400"}`}
          >
            {date ? longDate(date) : "Select a date"}
          </button>
          <ChevronDown
            size={16}
            className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition ${
              open ? "rotate-180" : ""
            }`}
          />
        </FormField>

        {open && (
          <div
            role="dialog"
            aria-label="Choose a date"
            className="absolute right-0 z-30 mt-2 w-72 max-w-[calc(100vw-3rem)] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-indigo-100/70"
          >
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                disabled={!canGoPrev}
                aria-label="Previous month"
                className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeft size={18} />
              </button>
              <p className="text-sm font-bold text-slate-900">
                {MONTHS[view.m]} {view.y}
              </p>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                aria-label="Next month"
                className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {WEEKDAYS.map((w) => (
                <span
                  key={w}
                  className="py-1 text-[11px] font-semibold uppercase text-slate-400"
                >
                  {w}
                </span>
              ))}
              {cells.map((day, i) => {
                if (!day) return <span key={`b${i}`} />;
                const dStr = toDateStr(view.y, view.m, day);
                const disabled = dStr < todayStr;
                const selected = dStr === date;
                const isToday = dStr === todayStr;
                return (
                  <button
                    key={dStr}
                    type="button"
                    disabled={disabled}
                    onClick={() => pickDate(dStr)}
                    aria-pressed={selected}
                    className={`h-9 rounded-lg text-sm font-medium transition ${
                      selected
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                        : disabled
                          ? "cursor-not-allowed text-slate-300"
                          : isToday
                            ? "bg-indigo-50 font-bold text-indigo-600 hover:bg-indigo-100"
                            : "text-slate-700 hover:bg-indigo-50"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setView({ y: now.y, m: now.m });
                  pickDate(todayStr);
                }}
                className="text-indigo-600 hover:text-indigo-800"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ---------------- Time slots ---------------- */}
      <div className="sm:col-span-2">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Clock size={16} className="text-slate-400" />
            Preferred time
          </p>
          <div
            role="tablist"
            aria-label="Part of day"
            className="flex rounded-lg bg-slate-100 p-0.5 text-[11px] font-semibold sm:text-xs"
          >
            {PERIODS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={period === p.id}
                onClick={() => setPeriod(p.id)}
                className={`rounded-md px-2 py-1 transition sm:px-3 ${
                  period === p.id
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {loadingAvailability && (
          <p className="mb-3 text-xs text-slate-500">
            Checking available times...
          </p>
        )}

        {availabilityError && (
          <p role="alert" className="mb-3 text-xs text-red-600">
            {availabilityError}
          </p>
        )}

        {!loadingAvailability &&
          !availabilityError &&
          date &&
          availability.length > 0 &&
          !availability.some((slot) => slot.available) && (
            <p className="mb-3 text-xs text-amber-700">
              No mentors are available on this date. Please choose another date.
            </p>
          )}

        {date ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {periodSlots.map((slot) => {
              const slotInfo = availability.find((item) => item.time === slot);

              const disabled =
                isPast(date, slot) ||
                (!loadingAvailability && !slotInfo?.available);

              const selected = slot === time;

              return (
                <button
                  key={slot}
                  type="button"
                  disabled={disabled}
                  aria-pressed={selected}
                  onClick={() => pickTime(slot)}
                  className={`rounded-xl border px-2 py-2.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                    selected
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-200"
                      : disabled
                        ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through"
                        : "border-slate-200 bg-white text-slate-700 hover:border-indigo-400 hover:bg-indigo-50"
                  }`}
                >
                  {slotLabel(slot)}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-5 text-center text-xs text-slate-400">
            Select a date first to see available 30-minute slots.
          </p>
        )}

        {date && time && (
          <p className="mt-3 rounded-xl bg-indigo-50 px-4 py-2.5 text-xs font-medium text-indigo-700">
            Selected: {longDate(date)} at {slotLabel(time)} ({zoneLabel})
          </p>
        )}
      </div>
    </>
  );
}
