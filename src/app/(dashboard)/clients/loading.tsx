export default function Loading() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 rounded-md bg-muted" />
        <div className="h-9 w-36 rounded-md bg-muted" />
      </div>
      <div className="flex gap-2">
        <div className="h-9 w-48 rounded-md bg-muted" />
        <div className="h-9 w-24 rounded-md bg-muted" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-3 flex flex-col gap-2">
            <div className="h-5 w-20 rounded bg-muted" />
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="rounded-lg border border-border bg-background p-3 h-20" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
