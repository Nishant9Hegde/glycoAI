'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GaugeCircle,
  LayoutGrid,
  Droplet,
  Calculator,
  BrainCircuit,
  Settings,
  User,
  Cable,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import React from 'react';


export function Sidebar() {
  const pathname = usePathname();
  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutGrid },
    { href: '/log', label: 'Log', icon: Droplet },
    { href: '/calculator', label: 'Calculator', icon: Calculator },
    { href: '/ai-insights', label: 'AI Insights', icon: BrainCircuit },
  ];

  const NavLink = ({ href, label, icon: Icon }: { href: string, label: string, icon: React.ElementType }) => {
    const { translatedText } = useTranslation(label);

    return (
      <Link
        href={href}
        className={cn(
          'flex items-center gap-4 rounded-lg px-4 py-3 text-lg font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
          {
            'bg-accent text-accent-foreground': pathname === href,
          }
        )}
      >
        <Icon className="h-6 w-6" />
        <span>{translatedText}</span>
      </Link>
    );
  };
  
  const settingsOpen = pathname.startsWith('/health-profile') || pathname.startsWith('/cgm-integration');
  const { translatedText: settingsLabel } = useTranslation('Settings');
  const { translatedText: profileLabel } = useTranslation('Profile');
  const { translatedText: cgmLabel } = useTranslation('CGM Integration');
  
  return (
    <aside className="hidden w-60 flex-col border-r bg-background md:flex">
      <div className="flex h-24 items-center justify-center">
        <Link href="/">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <GaugeCircle className="h-9 w-9" />
            <span className="sr-only">InsuTech</span>
          </div>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-2 p-4">
        {navItems.map((item) => (
          <NavLink key={item.label} {...item} />
        ))}
      </nav>
      <div className="mt-auto p-4">
        <Collapsible defaultOpen={settingsOpen}>
          <CollapsibleTrigger className='w-full group'>
              <div
                  className={cn(
                  'flex w-full items-center gap-4 rounded-lg px-4 py-3 text-lg font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
                  )}
              >
                  <Settings className="h-6 w-6" />
                  <span>{settingsLabel}</span>
                  <ChevronDown className="ml-auto h-5 w-5 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
          </CollapsibleTrigger>
          <CollapsibleContent className='pt-2 space-y-1'>
              <Link href="/health-profile" className={cn(
                  'flex items-center gap-4 rounded-lg py-2 px-4 pl-12 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                  { 'bg-accent text-accent-foreground': pathname === '/health-profile' }
              )}>
                  <User className="h-5 w-5" />
                  {profileLabel}
              </Link>
              <Link href="/cgm-integration" className={cn(
                  'flex items-center gap-4 rounded-lg py-2 px-4 pl-12 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                  { 'bg-accent text-accent-foreground': pathname === '/cgm-integration' }
              )}>
                  <Cable className="h-5 w-5" />
                  {cgmLabel}
              </Link>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </aside>
  );
}
