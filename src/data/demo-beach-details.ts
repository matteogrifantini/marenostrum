export type BeachDetailReport = {
  id: string;
  emoji: string;
  title: string;
  detail: string;
  age: string;
};

export type BeachParking = {
  id: string;
  name: string;
  price: string;
  type: string;
  walking: string;
  updated: string;
};

export type BeachFact = {
  emoji: string;
  label: "Suolo" | "Fondale" | "Esposizione" | "Servizi";
  value: string;
};

export type BeachReview = {
  id: string;
  author: string;
  age: string;
  text: string;
};

export type BeachMedia = {
  id: string;
  src: string;
  alt: string;
  age: string;
};

export type BeachReel = BeachMedia & {
  author: string;
  caption: string;
};

export type BeachDetailContent = {
  distanceKm: number;
  reports: BeachDetailReport[];
  parkings: BeachParking[];
  facts: BeachFact[];
  reviews: {
    rating: number;
    recommendedPercent: number;
    total: number;
    items: BeachReview[];
  };
  recentPhotos: BeachMedia[];
  reels: BeachReel[];
  webcam: {
    name: string;
    distanceKm: number;
    image: string;
    alt: string;
    updated: string;
    live: boolean;
  };
};

const sharedMedia = {
  gelsomino: "/images/beaches/cala-del-gelsomino.jpg",
  vendicari: "/images/beaches/tonnara-di-vendicari.jpg",
  marchesa: "/images/beaches/spiaggia-della-marchesa.jpg",
};

const details: Record<string, BeachDetailContent> = {
  "cala-del-gelsomino": {
    distanceKm: 18,
    reports: [
      { id: "cg-1", emoji: "🅿️", title: "Parcheggio quasi pieno", detail: "Confermato da 3 persone", age: "12 min fa" },
      { id: "cg-2", emoji: "👥", title: "Affollamento moderato", detail: "9 segnalazioni nell’ultima ora", age: "18 min fa" },
      { id: "cg-3", emoji: "🌿", title: "Posidonia sulla battigia", detail: "Presenza localizzata lato sud", age: "26 min fa" },
      { id: "cg-4", emoji: "🌊", title: "Acqua limpida", detail: "Visibilità buona vicino agli scogli", age: "41 min fa" },
      { id: "cg-5", emoji: "🚿", title: "Doccia non disponibile", detail: "Servizio stagionale ancora chiuso", age: "1 ora fa" },
    ],
    parkings: [
      { id: "cg-p1", name: "Parcheggio Pineta", price: "€6/giorno", type: "Sterrato e ombreggiato", walking: "480 m · 6 min a piedi", updated: "Prezzo aggiornato dagli utenti ieri" },
      { id: "cg-p2", name: "Ingresso nord", price: "Gratis", type: "Posti limitati", walking: "1,2 km · 15 min a piedi", updated: "Prezzo confermato 3 giorni fa" },
    ],
    facts: [
      { emoji: "🏝️", label: "Suolo", value: "Sabbia chiara e ciottoli fini" },
      { emoji: "💧", label: "Fondale", value: "Basso, digrada lentamente" },
      { emoji: "🧭", label: "Esposizione", value: "Sud-est · luce dal mattino" },
      { emoji: "☕", label: "Servizi", value: "Bar stagionale, pineta, parcheggio" },
    ],
    reviews: {
      rating: 4.6,
      recommendedPercent: 84,
      total: 38,
      items: [
        { id: "cg-r1", author: "Giulia", age: "2 giorni fa", text: "Acqua trasparente, ma il parcheggio si riempie prima delle 10." },
        { id: "cg-r2", author: "Marco", age: "5 giorni fa", text: "Accesso semplice e ombra comoda nella pineta durante le ore più calde." },
      ],
    },
    recentPhotos: [
      { id: "cg-f1", src: sharedMedia.gelsomino, alt: "Battigia di Cala del Gelsomino", age: "Oggi · 09:14" },
      { id: "cg-f2", src: sharedMedia.marchesa, alt: "Mare visto dalla costa sud-orientale", age: "Ieri · 18:42" },
      { id: "cg-f3", src: sharedMedia.vendicari, alt: "Panorama della costa", age: "2 giorni fa" },
    ],
    reels: [
      { id: "cg-v1", src: sharedMedia.gelsomino, alt: "Battigia di Cala del Gelsomino", age: "questa mattina", author: "@mare_nostrum", caption: "Acqua limpida e vento ancora leggero sulla battigia." },
      { id: "cg-v2", src: sharedMedia.marchesa, alt: "Vista dal sentiero verso il mare", age: "ieri · 18:40", author: "@giulia.sicilia", caption: "La vista dal sentiero di accesso poco prima del tramonto." },
      { id: "cg-v3", src: sharedMedia.vendicari, alt: "Panoramica della costa sud-orientale", age: "3 giorni fa", author: "@mare_nostrum", caption: "Panoramica della costa e condizioni del mare." },
    ],
    webcam: { name: "Arenella", distanceKm: 6.2, image: sharedMedia.gelsomino, alt: "Anteprima della webcam di Arenella", updated: "Immagine aggiornata pochi secondi fa", live: true },
  },
  "tonnara-di-vendicari": {
    distanceKm: 14,
    reports: [
      { id: "tv-1", emoji: "🅿️", title: "Parcheggio disponibile", detail: "Circa 40 posti liberi", age: "9 min fa" },
      { id: "tv-2", emoji: "👥", title: "Affollamento moderato", detail: "Flusso regolare all’ingresso", age: "21 min fa" },
      { id: "tv-3", emoji: "🌬️", title: "Vento percepibile", detail: "Più evidente nella zona della tonnara", age: "34 min fa" },
      { id: "tv-4", emoji: "🌊", title: "Mare pulito", detail: "Acqua trasparente sul lato nord", age: "49 min fa" },
    ],
    parkings: [
      { id: "tv-p1", name: "Ingresso Vendicari", price: "€5/giorno", type: "Sterrato non custodito", walking: "850 m · 11 min a piedi", updated: "Prezzo confermato oggi" },
      { id: "tv-p2", name: "Area Calamosche", price: "€5/giorno", type: "Posti stagionali", walking: "2,4 km · 31 min a piedi", updated: "Prezzo aggiornato 2 giorni fa" },
    ],
    facts: [
      { emoji: "🏝️", label: "Suolo", value: "Sabbia dorata e roccia" },
      { emoji: "💧", label: "Fondale", value: "Medio, irregolare vicino alla tonnara" },
      { emoji: "🧭", label: "Esposizione", value: "Sud · costa aperta" },
      { emoji: "☕", label: "Servizi", value: "Riserva, sentieri e area picnic" },
    ],
    reviews: {
      rating: 4.8,
      recommendedPercent: 91,
      total: 64,
      items: [
        { id: "tv-r1", author: "Elena", age: "ieri", text: "Paesaggio meraviglioso; conviene portare acqua per il tratto a piedi." },
        { id: "tv-r2", author: "Davide", age: "4 giorni fa", text: "Mare trasparente e atmosfera tranquilla anche nel pomeriggio." },
      ],
    },
    recentPhotos: [
      { id: "tv-f1", src: sharedMedia.vendicari, alt: "Tonnara di Vendicari dalla costa", age: "Oggi · 08:52" },
      { id: "tv-f2", src: sharedMedia.gelsomino, alt: "Dettaglio dell’acqua trasparente", age: "Ieri · 17:30" },
      { id: "tv-f3", src: sharedMedia.marchesa, alt: "Vegetazione costiera", age: "3 giorni fa" },
    ],
    reels: [
      { id: "tv-v1", src: sharedMedia.vendicari, alt: "Tonnara vista dalla spiaggia", age: "questa mattina", author: "@mare_nostrum", caption: "La tonnara e il mare calmo nelle prime ore del giorno." },
      { id: "tv-v2", src: sharedMedia.gelsomino, alt: "Acqua trasparente vicino alla riva", age: "ieri", author: "@elena.inviaggio", caption: "Trasparenza dell’acqua lungo il lato nord." },
      { id: "tv-v3", src: sharedMedia.marchesa, alt: "Sentiero costiero nella vegetazione", age: "4 giorni fa", author: "@mare_nostrum", caption: "Il tratto finale del sentiero verso la spiaggia." },
    ],
    webcam: { name: "Lido di Noto", distanceKm: 11.4, image: sharedMedia.vendicari, alt: "Anteprima della webcam di Lido di Noto", updated: "Immagine aggiornata 2 minuti fa", live: true },
  },
  "spiaggia-della-marchesa": {
    distanceKm: 12,
    reports: [
      { id: "sm-1", emoji: "🅿️", title: "Parcheggio quasi pieno", detail: "Ultimi posti vicino all’ingresso", age: "12 min fa" },
      { id: "sm-2", emoji: "👥", title: "Affollamento moderato", detail: "Più spazio sul lato nord", age: "18 min fa" },
      { id: "sm-3", emoji: "🌿", title: "Posidonia sulla battigia", detail: "Presenza localizzata lato sud", age: "26 min fa" },
      { id: "sm-4", emoji: "🌊", title: "Acqua limpida", detail: "Buona visibilità vicino agli scogli", age: "43 min fa" },
    ],
    parkings: [
      { id: "sm-p1", name: "Parcheggio Marchesa", price: "€5/giorno", type: "Sterrato e custodito", walking: "620 m · 8 min a piedi", updated: "Prezzo aggiornato dagli utenti ieri" },
      { id: "sm-p2", name: "Ingresso nord", price: "Gratis", type: "Posti limitati", walking: "1,1 km · 14 min a piedi", updated: "Prezzo confermato 3 giorni fa" },
    ],
    facts: [
      { emoji: "🏝️", label: "Suolo", value: "Sabbia chiara e fine" },
      { emoji: "💧", label: "Fondale", value: "Basso, digrada lentamente" },
      { emoji: "🧭", label: "Esposizione", value: "Est · alba sul mare" },
      { emoji: "☕", label: "Servizi", value: "Pineta, area picnic e parcheggio" },
    ],
    reviews: {
      rating: 4.6,
      recommendedPercent: 87,
      total: 52,
      items: [
        { id: "sm-r1", author: "Giulia", age: "2 giorni fa", text: "Acqua trasparente, ma il parcheggio si riempie prima delle 10." },
        { id: "sm-r2", author: "Marco", age: "5 giorni fa", text: "Sentiero semplice e spiaggia molto pulita anche nel pomeriggio." },
      ],
    },
    recentPhotos: [
      { id: "sm-f1", src: sharedMedia.marchesa, alt: "Battigia della Spiaggia della Marchesa", age: "Oggi · 09:14" },
      { id: "sm-f2", src: sharedMedia.gelsomino, alt: "Mare visto dalla spiaggia", age: "Ieri · 18:42" },
      { id: "sm-f3", src: sharedMedia.vendicari, alt: "Panorama della costa", age: "2 giorni fa" },
    ],
    reels: [
      { id: "sm-v1", src: sharedMedia.marchesa, alt: "Battigia della Spiaggia della Marchesa", age: "questa mattina", author: "@mare_nostrum", caption: "La battigia questa mattina, acqua limpida e vento ancora leggero." },
      { id: "sm-v2", src: sharedMedia.gelsomino, alt: "Vista dal sentiero di accesso", age: "ieri · 18:40", author: "@giulia.sicilia", caption: "Vista dal sentiero di accesso poco prima del tramonto." },
      { id: "sm-v3", src: sharedMedia.vendicari, alt: "Panoramica della costa", age: "3 giorni fa", author: "@mare_nostrum", caption: "Panoramica della costa e condizioni del mare." },
    ],
    webcam: { name: "Arenella", distanceKm: 6.2, image: sharedMedia.gelsomino, alt: "Anteprima della webcam di Arenella", updated: "Immagine aggiornata pochi secondi fa", live: true },
  },
};

export function getDemoBeachDetail(slug: string) {
  return details[slug];
}
