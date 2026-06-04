import Link from 'next/link';
import Image from 'next/image';

const NAV_LINKS = [
  ['About Us', '/about'],
  ['FAQ', '/faq'],
  ['Contact', '/contact'],
  ['Find A Store', '/find-store'],
] as const;

export default function PageHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
        {/* Logo */}
        <Link href="/store" className="flex items-center gap-2 flex-shrink-0">
          <div className="relative w-8 h-8 flex-shrink-0 bg-gradient-to-br from-brand-600 to-brand-700 rounded-lg p-1.5 shadow-sm">
            <Image src="/icon.png" alt="Intandokazi Herbal" fill className="object-contain" />
          </div>
          <span className="hidden sm:block text-brand-900 font-semibold text-sm leading-tight">Intandokazi Herbal</span>
        </Link>

        {/* Nav links — desktop */}
        <div className="hidden md:flex items-center gap-0 flex-1 justify-center">
          {NAV_LINKS.map(([label, href]) => (
            <Link key={href} href={href} className="px-3 py-2 text-sm text-gray-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-all whitespace-nowrap">
              {label}
            </Link>
          ))}
        </div>

        <div className="flex-1 md:hidden" />

        {/* Back to store */}
        <Link href="/store" className="flex-shrink-0 text-sm bg-brand-600 hover:bg-brand-700 text-white px-3.5 py-2 rounded-lg font-medium transition-all whitespace-nowrap">
          ← Shop
        </Link>
      </div>
    </header>
  );
}
