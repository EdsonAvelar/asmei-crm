export default function Loading() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 rounded-md bg-muted" />
        <div className="flex gap-2">
          <div className="h-9 w-9 rounded-md bg-muted" />
          <div className="h-9 w-9 rounded-md bg-muted" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 42 }).map((_, i) => (
          <div key={i} className="h-20 rounded-lg border border-border bg-card" />
        ))}
      </div>
    </div>
  );
}
