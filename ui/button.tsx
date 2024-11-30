import clsx from 'clsx';

export function Button({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        'rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-600 active:bg-zinc-500',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
