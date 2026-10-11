import FeatureRow from "./FeatureRow";
import KidIllustration from "./KidIllustration";
import StatsStrip from "./StatsStrip";
import Testimonial from "./Testimonial";
import { features } from "../data/constants";

export default function Hero() {
  return (
    <section id="why" className="min-w-0">
      <p className="mb-5 inline-flex rounded-full bg-indigo-100 px-4 py-1.5 text-xs font-semibold tracking-wide text-indigo-600">
        FREE TRIAL CLASS
      </p>

      <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem]">
        Let your child explore a brighter future with{" "}
        <span className="text-indigo-600">CodeYoung</span>
      </h1>

      <p className="mt-5 max-w-lg text-base leading-7 text-slate-500 sm:text-lg">
        Book a free 30-minute trial class with an experienced mentor and help
        your child discover the joy of coding.
      </p>

      <div id="programs" className="mt-8 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <div className="w-full space-y-5 sm:w-3/5">
          {features.map((f) => (
            <FeatureRow key={f.title} {...f} />
          ))}
        </div>
        <div className="shrink-0 sm:-mt-4">
          <KidIllustration />
        </div>
      </div>

      <StatsStrip />
      <Testimonial />
    </section>
  );
}
