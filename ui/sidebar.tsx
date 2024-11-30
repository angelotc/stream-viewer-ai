'use client';

import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { Home, Settings } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

const navigation = [
  {
    name: 'Home',
    slug: '',
    icon: Home
  },
  {
    name: 'Settings',
    slug: 'settings',
    icon: Settings
  }
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  return (
    <div className="fixed top-0 z-10 flex w-full flex-col border-b border-gray-800 bg-black lg:bottom-0 lg:z-auto lg:w-72 lg:border-b-0 lg:border-r lg:border-gray-800">
      <div className="flex h-14 items-center px-4 py-4 lg:h-auto">
        <Link
          href="/"
          className="group flex w-full items-center gap-x-2.5"
          onClick={close}
        >
          <h3 className="font-semibold tracking-wide text-gray-400 group-hover:text-gray-50">
            Stream Viewer AI
          </h3>
        </Link>
      </div>

      <div className="overflow-y-auto lg:static lg:block">
        <nav className="space-y-6 px-2 pb-24 pt-5">
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavItem key={item.slug} item={item} close={close} />
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

function NavItem({
  item,
  close,
}: {
  item: { name: string; slug: string; icon: any };
  close: () => void;
}) {
  const segment = useSelectedLayoutSegment();
  const isActive = item.slug === segment;
  const Icon = item.icon;

  return (
    <Link
      onClick={close}
      href={`/${item.slug}`}
      className={clsx(
        'flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium hover:text-gray-300',
        {
          'text-gray-400 hover:bg-gray-800': !isActive,
          'text-white bg-gray-800': isActive,
        },
      )}
    >
      <Icon className="h-5 w-5" />
      {item.name}
    </Link>
  );
}