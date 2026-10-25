import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  type KeyboardEvent,
} from "react";

/** One row's height in px: Tailwind's h-12. The list shows five rows, three
 * in landscape, padded so the first and last can reach the middle band. */
const ROW_HEIGHT = 48;
/** How long the list must stay still before a flick counts as a choice. */
const SETTLE_MS = 120;

export type WheelOption<T> = { value: T; label: string };

/**
 * A column that scrolls and snaps like an alarm clock's hour wheel: the row
 * in the middle band is the choice. A flick chooses once the list settles;
 * a tap or the arrow keys choose at once. A listbox to screen readers.
 */
export function WheelPicker<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: WheelOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  const id = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<number | undefined>(undefined);
  const selected = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  // The chosen row stays centred, whoever chose it.
  useLayoutEffect(() => {
    const list = listRef.current;
    const top = selected * ROW_HEIGHT;
    if (list && Math.abs(list.scrollTop - top) > 1) list.scrollTop = top;
  }, [selected]);

  useEffect(() => () => window.clearTimeout(settleTimer.current), []);

  function choose(index: number) {
    const option = options[Math.min(Math.max(index, 0), options.length - 1)];
    if (option.value !== value) onChange(option.value);
  }

  function handleScroll() {
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      const list = listRef.current;
      if (list) choose(Math.round(list.scrollTop / ROW_HEIGHT));
    }, SETTLE_MS);
  }

  const keySteps: Record<string, number> = {
    ArrowUp: selected - 1,
    ArrowDown: selected + 1,
    Home: 0,
    End: options.length - 1,
  };

  function handleKeyDown(event: KeyboardEvent) {
    if (!(event.key in keySteps)) return;
    event.preventDefault();
    choose(keySteps[event.key]);
  }

  return (
    <div className="relative h-60 landscape:h-36">
      <div
        aria-hidden
        className="bg-muted pointer-events-none absolute inset-x-0 top-24 h-12 rounded-xl landscape:top-12"
      />
      <div
        ref={listRef}
        role="listbox"
        aria-label={label}
        aria-activedescendant={`${id}-${selected}`}
        tabIndex={0}
        className="focus-visible:ring-ring relative h-full snap-y snap-mandatory [scrollbar-width:none] overflow-y-auto overscroll-contain rounded-xl [mask-image:linear-gradient(transparent,black_30%,black_70%,transparent)] py-24 outline-none focus-visible:ring-3 landscape:py-12"
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
      >
        {options.map((option, index) => (
          <div
            key={option.value}
            id={`${id}-${index}`}
            role="option"
            aria-selected={index === selected}
            className="text-muted-foreground aria-selected:text-foreground flex h-12 cursor-pointer snap-center items-center justify-center px-2 text-center text-lg leading-tight aria-selected:font-semibold"
            onClick={() => choose(index)}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
}
