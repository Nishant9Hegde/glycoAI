import { Skeleton } from "@/components/ui/skeleton";
import { Droplets } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <div className="flex items-center gap-2 font-semibold">
          <Droplets className="h-6 w-6 text-primary" />
          <span className="font-headline text-lg">InsuTech</span>
        </div>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <Skeleton className="ml-auto h-9 w-32" />
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="mx-auto grid w-full max-w-7xl flex-1 items-start gap-6 md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr]">
          <div className="flex flex-col gap-6">
            <Skeleton className="h-[450px] w-full rounded-lg" />
          </div>
          <div className="flex flex-col gap-6">
            <Skeleton className="h-12 w-full max-w-md rounded-lg" />
            <Skeleton className="h-80 w-full rounded-lg" />
          </div>
        </div>
      </main>
    </div>
  );
}
