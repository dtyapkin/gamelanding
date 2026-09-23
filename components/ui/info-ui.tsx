"use client";

export function PartnershipCard({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-violet-500/30 transition-all">
      {/* <div className="shrink-0 w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 mt-1">
        <CheckCircle2 size={20} />
        <svg
          className="w-7 h-7 text-accent-purple"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div> */}
      <div>
        <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}

export function PartnershipCardTwo({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  const lines = desc.split("\n");

  return (
    <div className="flex gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-violet-500/30 transition-all">
      {/* <div className="shrink-0 w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 mt-1">
        <CheckCircle2 size={20} />
      </div> */}
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2">
          {title}
        </h3>
        <div className="text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-2">
          {lines.map((line, i) =>
            line.trim() === "" ? (
              <div key={i} className="h-2" />
            ) : (
              <p key={i}>{line}</p>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
