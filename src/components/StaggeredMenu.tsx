import { useCallback, useEffect, useRef, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X } from 'lucide-react';

export interface StaggeredMenuItem {
  label: string;
  ariaLabel: string;
  link: string;
}

export interface StaggeredMenuProps {
  open: boolean;
  items: StaggeredMenuItem[];
  menuButtonColor: string;
  accentColor: string;
  panelBackground: string;
  panelTextColor: string;
  headerContent?: ReactNode;
  onItemClick?: (event: MouseEvent<HTMLAnchorElement>, item: StaggeredMenuItem) => void;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
}

export default function StaggeredMenu({
  open,
  items,
  menuButtonColor,
  accentColor,
  panelBackground,
  panelTextColor,
  headerContent,
  onItemClick,
  onMenuOpen,
  onMenuClose,
}: StaggeredMenuProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const wasOpen = useRef(open);

  const closeMenu = useCallback(() => {
    onMenuClose?.();
    if (triggerRef.current?.getClientRects().length) triggerRef.current.focus();
  }, [onMenuClose]);

  const toggleMenu = () => {
    if (open) {
      closeMenu();
      return;
    }
    onMenuOpen?.();
  };

  useEffect(() => {
    if (wasOpen.current && !open) triggerRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehavior;
    const alreadyOpen = document.body.classList.contains('mobile-menu-open');
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    document.body.classList.add('mobile-menu-open');

    const focusFrame = window.requestAnimationFrame(() => firstLinkRef.current?.focus());
    const desktopBreakpoint = window.matchMedia('(min-width: 1100px)');
    const closeOnDesktop = () => {
      if (desktopBreakpoint.matches) closeMenu();
    };
    desktopBreakpoint.addEventListener('change', closeOnDesktop);
    const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu();
        return;
      }
      if (event.key !== 'Tab') return;

      const overlay = document.querySelector<HTMLElement>('.mobile-menu-overlay[data-open="true"]');
      const focusable = overlay ? Array.from(overlay.querySelectorAll<HTMLElement>(focusableSelector)) : [];
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!overlay?.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      desktopBreakpoint.removeEventListener('change', closeOnDesktop);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscroll;
      if (!alreadyOpen) document.body.classList.remove('mobile-menu-open');
    };
  }, [closeMenu, open]);

  const overlay = open ? (
    <div
      className="mobile-menu-overlay"
      data-open="true"
      role="dialog"
      aria-modal="true"
      aria-label="Exhibition navigation"
      style={{
        backgroundColor: panelBackground,
        color: panelTextColor,
        '--menu-accent': accentColor,
      } as CSSProperties}
      onClick={event => {
        if (!(event.target as HTMLElement).closest('a, button')) closeMenu();
      }}
    >
      <div className="pointer-events-none relative flex min-h-full flex-col justify-center">
        <div className="mobile-menu-controls">
          <div className="pointer-events-auto">{headerContent}</div>
          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close menu"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/15 text-[var(--menu-accent)] transition-colors hover:bg-ink/5 dark:border-white/15 dark:hover:bg-white/10"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Mobile navigation" className="pointer-events-auto pt-16">
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {items.map((item, index) => (
              <li
                key={item.link}
                className="mobile-menu-item"
                style={{ '--menu-item-index': index } as CSSProperties}
              >
                <a
                  ref={index === 0 ? firstLinkRef : undefined}
                  href={item.link}
                  aria-label={item.ariaLabel}
                  className="flex min-h-12 items-center rounded-lg px-3 font-serif text-[clamp(1.5rem,6vw,2.5rem)] leading-tight transition-colors hover:bg-ink/5 hover:text-[var(--menu-accent)] focus-visible:text-[var(--menu-accent)] dark:hover:bg-white/5"
                  onClick={event => {
                    try {
                      onItemClick?.(event, item);
                    } finally {
                      closeMenu();
                    }
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="artville-mobile-menu"
        onClick={toggleMenu}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/15 text-accent transition-colors hover:bg-ink/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent dark:border-white/15 dark:hover:bg-white/10"
        style={{ color: menuButtonColor }}
      >
        {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
      </button>
      {typeof document !== 'undefined' && createPortal(
        <div id="artville-mobile-menu">{overlay}</div>,
        document.body,
      )}
    </>
  );
}
