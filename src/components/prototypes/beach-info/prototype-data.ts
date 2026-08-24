export type BeachInfoItem = {
  emoji: string;
  label: string;
  value: string;
  note?: string;
};

export const prototypeBeach = {
  name: "Cala del Gelsomino",
  municipality: "Noto",
  coast: "Sud-est",
  image: "/images/beaches/cala-del-gelsomino.jpg",
  description:
    "Una baia luminosa tra sabbia chiara, pineta e acqua trasparente. L’accesso è semplice e il fondale digrada lentamente vicino alla riva.",
};

export const prototypeTags = [
  { emoji: "👨‍👩‍👧", label: "Famiglie" },
  { emoji: "💧", label: "Acque basse" },
  { emoji: "🅿️", label: "Parcheggio limitato" },
  { emoji: "☕", label: "Servizi stagionali" },
  { emoji: "🌅", label: "Tramonto sul mare" },
];

export const prototypeFacts: BeachInfoItem[] = [
  { emoji: "🏝️", label: "Suolo", value: "Sabbia chiara e ciottoli fini" },
  { emoji: "💧", label: "Fondale", value: "Basso", note: "Digrada lentamente vicino alla riva" },
  { emoji: "🧭", label: "Esposizione", value: "Sud-est", note: "Luce dal mattino" },
  { emoji: "🧺", label: "Servizi", value: "Bar stagionale, pineta e parcheggio", note: "Disponibilità da verificare" },
  { emoji: "🚶", label: "Accesso", value: "Facile", note: "Circa 6 minuti a piedi" },
  { emoji: "🌿", label: "Ambiente", value: "Macchia mediterranea", note: "Ombra naturale nella pineta" },
];

export const prototypeForecast = {
  score: "92",
  headline: "Ottima scelta",
  description: "Mare calmo e vento leggero: una giornata molto favorevole per fermarsi qui.",
  weather: "Poco nuvoloso",
  wind: "N · 7.5 km/h",
  waves: "0.2 m",
  water: "29.8°",
};

export const prototypeWind = {
  direction: "Nord",
  speed: "7.5 km/h",
  gusts: "20.9 km/h",
  protection: "Riparata dal Maestrale",
};
