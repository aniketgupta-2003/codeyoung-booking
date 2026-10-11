import { useEffect, useRef } from "react";
import { CalendarCheck, CheckCircle2, ExternalLink, Link2, User } from "lucide-react";

export default function SuccessCard({ booking, onBookAnother }) {
  const ref = useRef(null);
  const bookingId = booking.bookingId || booking.id;

  // Scroll the card into view when it appears
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  return (
    <div
      ref={ref}
      role="status"
      className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6"
    >
      <div className="flex items-center gap-4">
        <CheckCircle2 size={44} className="shrink-0 fill-emerald-500 text-white" />
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-emerald-700">Your class is booked!</h3>
          <p className="text-sm text-emerald-800">
            Your assigned mentor is {booking.mentorName}.
          </p>
        </div>
      </div>

      <dl className="mt-5 space-y-3 border-t border-emerald-200 pt-4 text-sm">
        <div className="flex items-start gap-3">
          <CalendarCheck size={18} className="mt-0.5 shrink-0 text-slate-500" />
          <dt className="w-24 shrink-0 font-semibold text-slate-800">Booking ID</dt>
          <dd className="min-w-0 break-all text-slate-700">{bookingId}</dd>
        </div>
        <div className="flex items-start gap-3">
          <User size={18} className="mt-0.5 shrink-0 text-slate-500" />
          <dt className="w-24 shrink-0 font-semibold text-slate-800">Mentor</dt>
          <dd className="min-w-0 text-slate-700">{booking.mentorName}</dd>
        </div>
        {booking.classLink && (
          <div className="flex items-start gap-3">
            <Link2 size={18} className="mt-0.5 shrink-0 text-slate-500" />
            <dt className="w-24 shrink-0 font-semibold text-slate-800">Class Link</dt>
            <dd className="min-w-0">
              <a
                href={booking.classLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-start gap-1.5 break-all font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
              >
                {booking.classLink}
                <ExternalLink size={14} className="mt-1 shrink-0" />
              </a>
            </dd>
          </div>
        )}
      </dl>

      <button
        type="button"
        onClick={onBookAnother}
        className="mt-5 w-full rounded-xl border border-emerald-300 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
      >
        Book another class
      </button>
    </div>
  );
}
