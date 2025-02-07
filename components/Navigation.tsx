import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavigationProps {
  mobile?: boolean;
  onClose?: () => void;
}

export default function Navigation({ mobile, onClose }: NavigationProps) {
  const pathname = usePathname();

  const links = [
    { href: '/boards', label: 'All Boards' },
    { href: '/boards/joined', label: 'My Boards' },
    { href: '/boards/create', label: 'Create Board' },
  ];

  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const isActive = pathname === href;

    return (
      <Link
        href={href}
        onClick={onClose}
        className={cn(
          "relative px-3 py-2 transition-all duration-300 ease-in-out hover:text-teal-400",
          mobile ? "block w-full text-left text-lg" : "text-lg",
          isActive
            ? "text-teal-500 font-bold" // Active link style
            : "text-gray-400 hover:text-teal-400" // Inactive link style
        )}
      >
        {label}
        {isActive && (
          <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-teal-500 via-teal-300 to-teal-500 animate-pulse" />
        )}
      </Link>
    );
  };

  return (
    <nav
      className={cn(
        "flex",
        mobile ? "flex-col space-y-4 py-6" : "items-center space-x-6"
      )}
    >
      {links.map((link) => (
        <NavLink key={link.href} {...link} />
      ))}
    </nav>
  );
}
