'use client';

import { Droplets, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useLanguage, type Language } from "@/context/language-context";
import { useTranslation } from "@/hooks/use-translation";

export function Header() {
  const avatarImage = PlaceHolderImages.find(img => img.id === 'user-avatar');
  const { language, setLanguage } = useLanguage();

  const { translatedText: myAccountLabel } = useTranslation('My Account');
  const { translatedText: settingsLabel } = useTranslation('Settings');
  const { translatedText: supportLabel } = useTranslation('Support');
  const { translatedText: logoutLabel } = useTranslation('Logout');
  
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <Link href="#" className="flex items-center gap-2 font-semibold">
        <Droplets className="h-6 w-6 text-primary" />
        <span className="font-headline text-lg tracking-wide">GlycoAI</span>
      </Link>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-initial">
          <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <Avatar>
                {avatarImage && <AvatarImage src={avatarImage.imageUrl} alt={avatarImage.description} data-ai-hint={avatarImage.imageHint} />}
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{myAccountLabel}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>{settingsLabel}</DropdownMenuItem>
            <DropdownMenuItem>{supportLabel}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>{logoutLabel}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
