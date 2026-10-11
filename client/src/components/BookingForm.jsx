import { useState } from "react";
import { ArrowRight, CalendarDays, ChevronDown, Globe, Info, Loader2, Mail, User } from "lucide-react";
import FormField, { fieldBase } from "./FormField";
import DateTimeField from "./DateTimeField";
import { timeZones } from "../data/constants";

export default function BookingForm({ form, loading, error, onChange, onSubmit, nameInputRef }) {
  const [pickerError, setPickerError] = useState("");

  // The custom date/time picker has no native "required", so check it here
  function handleSubmit(event) {
    if (!form.localStartTime) {
      event.preventDefault();
      setPickerError("Please choose a date and a 30-minute time slot.");
      return;
    }
    setPickerError("");
    onSubmit(event);
  }

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-indigo-100/60 sm:p-8">
      <div className="mb-6 flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
          <CalendarDays size={24} />
        </span>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Book Your Free Trial Class</h2>
          <p className="text-sm text-slate-500">
            Choose your preferred date, time and time zone.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField id="parentName" label="Parent's full name" icon={User}>
          <input
            ref={nameInputRef}
            id="parentName"
            name="parentName"
            type="text"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            value={form.parentName}
            onChange={onChange}
            placeholder="Enter your full name"
            className={fieldBase}
          />
        </FormField>

        <FormField id="parentEmail" label="Email address" icon={Mail}>
          <input
            id="parentEmail"
            name="parentEmail"
            type="email"
            required
            autoComplete="email"
            value={form.parentEmail}
            onChange={onChange}
            placeholder="you@example.com"
            className={fieldBase}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="parentTimeZone" label="Your time zone" icon={Globe}>
            <select
              id="parentTimeZone"
              name="parentTimeZone"
              required
              value={form.parentTimeZone}
              onChange={onChange}
              className={`${fieldBase} appearance-none pr-10`}
            >
              {timeZones.map((zone) => (
                <option key={zone.value} value={zone.value}>
                  {zone.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </FormField>

          <DateTimeField
            value={form.localStartTime}
            timeZone={form.parentTimeZone}
            onChange={onChange}
          />
        </div>

        {pickerError && !form.localStartTime && (
          <p role="alert" className="-mt-1 text-xs font-medium text-red-600">
            {pickerError}
          </p>
        )}

        <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5 text-xs leading-5 text-slate-500">
          <Info size={16} className="mt-0.5 shrink-0 text-slate-400" />
          <p>
            Select a 30-minute time slot. Availability depends on mentor working
            hours and existing bookings.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Booking your class...
            </>
          ) : (
            <>
              Book a Free Trial
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <p className="text-center text-xs text-slate-500">
          Your mentor will be assigned automatically based on availability.
        </p>
      </form>
    </div>
  );
}
