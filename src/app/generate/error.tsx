"use client";

export default function GenerateError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="text-5xl">💥</span>
      <h2 className="text-xl font-bold text-white">The goblin dropped the cauldron</h2>
      <p className="max-w-md text-sm text-zinc-400">{error.message}</p>
      <button type="button" onClick={reset} className="goblin-btn-primary">
        Try again
      </button>
    </div>
  );
}
