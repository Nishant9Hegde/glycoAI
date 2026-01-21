'use client';

import { Droplets, Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useLanguage, type Language } from "@/context/language-context";
import Link from "next/link";

export function Header() {
  const { language, setLanguage } = useLanguage();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <Link href="#" className="flex items-center gap-2 font-semibold">
        <Droplets className="h-6 w-6 text-primary" />
        <span className="font-headline text-lg tracking-wide">InsuTech</span>
      </Link>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-initial">
          <Select
            value={language}
            onValueChange={(value) => setLanguage(value as Language)}
          >
            <SelectTrigger className="w-auto border-0 bg-transparent shadow-none [&_svg]:h-4 [&_svg]:w-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
}
