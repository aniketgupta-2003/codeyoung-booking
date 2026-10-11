import { GraduationCap } from "lucide-react";

export default function KidIllustration() {
  return (
    <div className="relative mx-auto h-64 w-64 sm:h-72 sm:w-72">
      <svg viewBox="0 0 320 300" className="h-full w-full" role="img" aria-label="A smiling child coding on a laptop">
        {/* soft background blob */}
        <path
          d="M52 160C36 82 112 22 196 38c84 16 118 98 86 170-30 68-160 80-212 28-24-24-12-52-18-76Z"
          fill="#E0E4FF"
        />
        <circle cx="262" cy="64" r="6" fill="#C7CCFF" />
        <circle cx="52" cy="92" r="4" fill="#C7CCFF" />

        {/* hoodie body */}
        <path d="M82 300c0-62 34-98 78-98s78 36 78 98Z" fill="#F6B21A" />
        <path d="M130 206c8 14 52 14 60 0-4 22-56 22-60 0Z" fill="#DE9A0A" />
        <path d="M150 232v24M170 232v24" stroke="#DE9A0A" strokeWidth="3" strokeLinecap="round" />

        {/* neck + ears + head */}
        <rect x="147" y="176" width="26" height="30" rx="10" fill="#D79B72" />
        <circle cx="121" cy="152" r="9" fill="#E3A87F" />
        <circle cx="199" cy="152" r="9" fill="#E3A87F" />
        <ellipse cx="160" cy="146" rx="39" ry="43" fill="#EDB48A" />

        {/* hair */}
        <path
          d="M119 146c-6-42 24-58 48-54 28-2 44 22 34 54-8-20-22-28-42-28-18 0-32 10-40 28Z"
          fill="#2A1A16"
        />

        {/* face */}
        <ellipse cx="146" cy="152" rx="3.4" ry="4.4" fill="#2A1A16" />
        <ellipse cx="175" cy="152" rx="3.4" ry="4.4" fill="#2A1A16" />
        <path d="M140 141q6-4 12-1M169 140q6-3 12 1" stroke="#2A1A16" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M146 166q14 16 29 0Z" fill="#fff" stroke="#8A3F2D" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="136" cy="164" r="6" fill="#F29A86" opacity=".45" />
        <circle cx="186" cy="164" r="6" fill="#F29A86" opacity=".45" />

        {/* laptop (lid facing us) */}
        <rect x="74" y="232" width="172" height="76" rx="9" fill="#D5DAE4" />
        <rect x="74" y="232" width="172" height="10" rx="5" fill="#C2C8D6" />
        <circle cx="160" cy="268" r="9" fill="#F3F5FA" />

        {/* hands */}
        <ellipse cx="104" cy="236" rx="15" ry="9" fill="#EDB48A" />
        <ellipse cx="216" cy="236" rx="15" ry="9" fill="#EDB48A" />
      </svg>

      {/* floating badges */}
      <div className="absolute -top-2 right-2 flex h-16 w-16 rotate-6 items-center justify-center rounded-2xl bg-amber-400 text-xl font-extrabold text-slate-900 shadow-lg shadow-amber-200 sm:right-0">
        {"</>"}
      </div>
      <div className="absolute right-[-6px] top-[78px] flex h-12 w-12 -rotate-3 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 sm:right-[-14px]">
        <GraduationCap size={24} />
      </div>
      <svg viewBox="0 0 40 40" className="absolute left-2 top-14 h-9 w-9" aria-hidden="true">
        <path d="M6 30l8-10M4 18l12-2M14 6l4 12" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
}
