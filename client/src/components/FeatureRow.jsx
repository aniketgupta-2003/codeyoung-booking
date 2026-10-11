export default function FeatureRow({ icon: Icon, title, text, tint }) {
  return (
    <div className="flex items-center gap-4">
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tint}`}
      >
        <Icon size={22} />
      </span>
      <div>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">{text}</p>
      </div>
    </div>
  );
}
