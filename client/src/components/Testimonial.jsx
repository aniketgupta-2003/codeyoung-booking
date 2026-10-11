import { Quote } from "lucide-react";

export default function Testimonial() {
  return (
    <figure className="mt-5 flex max-w-xl items-start gap-4 rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm">
      <Quote size={28} className="mt-1 shrink-0 fill-indigo-200 text-indigo-300" />
      <div>
        <blockquote className="text-sm leading-6 text-slate-700">
          My child loved the trial class! The mentor was patient, engaging
          and made coding so much fun.
        </blockquote>
        <figcaption className="mt-2 text-xs text-slate-500">
          – Parent, CodeYoung
        </figcaption>
      </div>
    </figure>
  );
}
