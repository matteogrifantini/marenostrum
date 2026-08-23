"use client";

import { useCallback, useEffect, useState } from "react";
import { PrototypePicker } from "./prototype-picker";
import { ExpandableVariant } from "./variant-expandable";
import { HeroExpandableVariant } from "./variant-hero-expandable";
import { PanelVariant } from "./variant-panel";
import { SliderVariant } from "./variant-slider";

const variants = [
  { name: "Slider", Component: SliderVariant },
  { name: "Pannello", Component: PanelVariant },
  { name: "Espandi", Component: ExpandableVariant },
  { name: "Foto + info", Component: HeroExpandableVariant },
] as const;

type BeachInfoPrototypeProps = {
  initialVariant?: number;
};

function clampVariant(value: number) {
  return Math.min(Math.max(value, 0), variants.length - 1);
}

function getInitialVariant(initialVariant?: number) {
  if (initialVariant !== undefined) return clampVariant(initialVariant);
  if (typeof window === "undefined") return 0;

  const queryVariant = Number(new URLSearchParams(window.location.search).get("v")) - 1;
  return Number.isInteger(queryVariant) && queryVariant >= 0 && queryVariant < variants.length ? queryVariant : 0;
}

export function BeachInfoPrototype({ initialVariant }: BeachInfoPrototypeProps) {
  const [current, setCurrent] = useState(() => getInitialVariant(initialVariant));
  const [mountKey, setMountKey] = useState(0);

  const selectVariant = useCallback((nextVariant: number) => {
    const next = clampVariant(nextVariant);
    setCurrent(next);
    setMountKey((key) => key + 1);

    const url = new URL(window.location.href);
    url.searchParams.set("v", String(next + 1));
    window.history.replaceState(null, "", url.toString());
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (target?.isContentEditable || event.metaKey || event.ctrlKey || event.altKey) return;

      const number = Number(event.key);
      if (number >= 1 && number <= variants.length) {
        selectVariant(number - 1);
      } else if (event.key === "ArrowRight") {
        selectVariant((current + 1) % variants.length);
      } else if (event.key === "ArrowLeft") {
        selectVariant((current - 1 + variants.length) % variants.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [current, selectVariant]);

  const Variant = variants[current].Component;

  return (
    <>
      <div key={`${current}-${mountKey}`}>
        <Variant />
      </div>
      <PrototypePicker names={variants.map((variant) => variant.name)} current={current} onChange={selectVariant} />
    </>
  );
}
