export default function Loading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="h-9 w-9 rounded-md bg-muted mt-0.5" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-7 w-48 rounded-md bg-muted" />
          <div className="h-4 w-32 rounded bg-muted" />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4 h-40" />
        <div className="rounded-xl border border-border bg-card p-4 h-40" />
      </div>
      <div className="rounded-xl border border-border bg-card p-4 h-56" />
    </div>
  );
}
