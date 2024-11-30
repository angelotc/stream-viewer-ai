import clsx from 'clsx';

export function Header({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'flex items-center justify-between space-x-4 border-b border-zinc-700 p-4',
        className,
      )}
    >
      <div className="flex items-center space-x-4">
        <div className="flex flex-col">
          <h1 className="text-xl font-medium text-zinc-100">Stream Viewer AI</h1>
          <p className="text-sm text-zinc-400">Real-time streaming with AI capabilities</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {/* Add any header actions/buttons here */}
      </div>
    </div>
  );
}
