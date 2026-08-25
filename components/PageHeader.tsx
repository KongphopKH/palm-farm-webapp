import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  backHref?: string;
}

export default function PageHeader({ title, backHref }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-1 border-b border-stone-200 bg-white/95 px-3 py-4 backdrop-blur">
      {backHref ? (
        <Link
          href={backHref}
          aria-label="ย้อนกลับ"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-stone-600 active:bg-stone-100"
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>
      ) : (
        <span className="w-2" />
      )}
      <h1 className="text-xl font-bold text-stone-800">{title}</h1>
    </header>
  );
}
