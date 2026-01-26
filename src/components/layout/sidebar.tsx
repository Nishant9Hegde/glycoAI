'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  LayoutGrid,
  Droplet,
  Calculator,
  BrainCircuit,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';


export function Sidebar() {
  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutGrid },
    { href: '/log', label: 'Log', icon: Droplet },
    { href: '/calculator', label: 'Calculator', icon: Calculator },
    { href: '/ai-insights', label: 'AI Insights', icon: BrainCircuit },
  ];

  const NavLink = ({ href, label, icon: Icon }: { href: string, label: string, icon: React.ElementType }) => {
    const pathname = usePathname();
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
  
  return (
    <aside className="hidden w-60 flex-col border-r bg-background md:flex">
      <div className="flex h-24 items-center justify-center">
        <Link href="/">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Activity className="h-9 w-9" />
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
        <NavLink href="#" label="Settings" icon={Settings} />
      </div>
    </aside>
  );
}
