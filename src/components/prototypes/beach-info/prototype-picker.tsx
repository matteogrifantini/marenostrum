import { useLayoutEffect, useRef, useState } from "react";

export const prototypePickerStyles = `
.proto-picker {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2147483647;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px;
  border-radius: 999px;
  background: rgba(10, 10, 10, 0.82);
  -webkit-backdrop-filter: blur(12px) saturate(1.4);
  backdrop-filter: blur(12px) saturate(1.4);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08) inset,
    0 8px 24px rgba(0, 0, 0, 0.24),
    0 2px 6px rgba(0, 0, 0, 0.12);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 13px;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  user-select: none;
  -webkit-user-select: none;
}

.proto-picker-highlight {
  position: absolute;
  top: 4px;
  left: 0;
  height: 28px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  will-change: transform;
}

.proto-picker[data-ready] .proto-picker-highlight {
  transition:
    transform 250ms cubic-bezier(0.23, 1, 0.32, 1),
    width 250ms cubic-bezier(0.23, 1, 0.32, 1);
}

@media (prefers-reduced-motion: reduce) {
  .proto-picker[data-ready] .proto-picker-highlight { transition: none; }
}

.proto-picker-item {
  position: relative;
  display: flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: rgba(255, 255, 255, 0.55);
  font: inherit;
  cursor: pointer;
  transition: color 150ms ease-out;
}

.proto-picker-item:hover {
  color: rgba(255, 255, 255, 0.85);
}

.proto-picker-item:active {
  transform: scale(0.97);
}

.proto-picker-item:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.4);
  outline-offset: 2px;
}

.proto-picker-item[data-active] {
  color: #fff;
}
`;

type PrototypePickerProps = {
  names: string[];
  current: number;
  onChange: (index: number) => void;
};

export function PrototypePicker({ names, current, onChange }: PrototypePickerProps) {
  const pickerRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const item = itemRefs.current[current];
    const highlight = pickerRef.current?.querySelector<HTMLElement>(".proto-picker-highlight");
    if (!item || !highlight) return;

    highlight.style.width = `${item.offsetWidth}px`;
    highlight.style.transform = `translateX(${item.offsetLeft}px)`;
  }, [current, names.length]);

  useLayoutEffect(() => {
    const first = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setReady(true));
    });

    return () => window.cancelAnimationFrame(first);
  }, []);

  return (
    <>
      <style>{prototypePickerStyles}</style>
      <nav ref={pickerRef} className="proto-picker" aria-label="Prototype variants" data-ready={ready ? "" : undefined}>
        <span className="proto-picker-highlight" aria-hidden="true" />
        {names.map((name, index) => (
          <button
            key={name}
            ref={(element) => {
              itemRefs.current[index] = element;
            }}
            type="button"
            className="proto-picker-item"
            data-active={current === index ? "" : undefined}
            aria-current={current === index ? "true" : undefined}
            onClick={() => onChange(index)}
          >
            {name}
          </button>
        ))}
      </nav>
    </>
  );
}
