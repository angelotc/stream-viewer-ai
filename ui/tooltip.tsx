import { ReactNode } from 'react';

interface TooltipProps {
  text: string;
  children: ReactNode;
}

export function Tooltip({ text, children }: TooltipProps) {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="pointer-events-none absolute left-0 top-full mt-2 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="flex flex-col items-start">
          <div className="rounded bg-gray-900 p-2 text-sm text-gray-300 shadow-lg max-w-xs">
            {text}
          </div>
        </div>
      </div>
    </div>
  );
}
