import clsx from 'clsx';

export function Footer({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'border-t border-zinc-700 bg-black px-4 py-6',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-400">
          Built with Next.js and AssemblyAI
        </div>
        <div className="text-sm text-zinc-400">
          © {new Date().getFullYear()} Stream Viewer AI
        </div>
      </div>
    </div>
  );
}
