import * as React from 'react'
import Link from 'next/link'
import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import { clsx } from 'clsx'

export function Navigation() {
  return (
    <NavigationMenu.Root className="relative z-10 flex w-full justify-center bg-gradient-to-r from-blue-900 to-purple-900 shadow-lg">
      <NavigationMenu.List className="container mx-auto flex flex-row items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">StreamAI</span>
        </div>
        <div className="flex gap-6">
          <NavigationMenu.Item>
            <NavigationMenu.Link asChild>
              <Link href="/" className="text-sm font-medium text-gray-100 hover:text-white transition-colors">
                Home
              </Link>
            </NavigationMenu.Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Link asChild>
              <Link href="/streams" className="text-sm font-medium text-gray-100 hover:text-white transition-colors">
                Live Streams
              </Link>
            </NavigationMenu.Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Link asChild>
              <Link href="/recordings" className="text-sm font-medium text-gray-100 hover:text-white transition-colors">
                Recordings
              </Link>
            </NavigationMenu.Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Link asChild>
              <Link href="/insights" className="text-sm font-medium text-gray-100 hover:text-white transition-colors">
                AI Insights
              </Link>
            </NavigationMenu.Link>
          </NavigationMenu.Item>
        </div>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  )
}
