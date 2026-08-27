import type { BeachWebcam } from "../domain/beach";

/**
 * Mappatura accurata ed esclusiva delle sole spiagge che dispongono
 * di una vera webcam live attiva e verificata direttamente sul posto.
 */
export const BEACH_WEBCAMS: Record<string, BeachWebcam> = {
  // Spiaggia di Mondello (Palermo)
  "mondello": {
    title: "Spiaggia e Golfo di Mondello",
    embedUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/palermo/spiaggia-mondello.html",
    liveUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/palermo/spiaggia-mondello.html",
    posterUrl: "https://cdn.skylinewebcams.com/_571.webp",
    provider: "SkylineWebcams / Albaria Mondello",
  },

  // Spiaggia del Lungomare di Cefalù (Palermo)
  "spiaggia-del-lungomare-cefalu": {
    title: "Lungomare e Spiaggia di Cefalù",
    embedUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/palermo/cefalu.html",
    liveUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/palermo/cefalu.html",
    posterUrl: "https://cdn.skylinewebcams.com/_275.webp",
    provider: "SkylineWebcams / Comune di Cefalù",
  },

  // Spiaggia di San Vito Lo Capo (Trapani)
  "san-vito-lo-capo": {
    title: "Spiaggia e Baia di San Vito Lo Capo",
    embedUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/trapani/san-vito-lo-capo.html",
    liveUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/trapani/san-vito-lo-capo.html",
    posterUrl: "https://cdn.skylinewebcams.com/_175.webp",
    provider: "SkylineWebcams / Pro Loco San Vito",
  },

  // Spiaggia Playa di Castellammare del Golfo (Trapani)
  "spiaggia-playa-castellammare": {
    title: "Spiaggia Plaja di Castellammare del Golfo",
    embedUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/trapani/castellammare-del-golfo.html",
    liveUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/trapani/castellammare-del-golfo.html",
    posterUrl: "https://cdn.skylinewebcams.com/_1449.webp",
    provider: "SkylineWebcams",
  },

  // Cala Petrolo / Porto di Castellammare (Trapani)
  "cala-petrolo-castellammare": {
    title: "Golfo e Cala Petrolo (Castellammare)",
    embedUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/trapani/castellammare-del-golfo.html",
    liveUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/trapani/castellammare-del-golfo.html",
    posterUrl: "https://cdn.skylinewebcams.com/_1449.webp",
    provider: "SkylineWebcams",
  },

  // Favignana (Egadi / Trapani)
  "cala-rossa-favignana": {
    title: "Favignana e Baia",
    embedUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/trapani/favignana.html",
    liveUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/trapani/favignana.html",
    posterUrl: "https://cdn.skylinewebcams.com/_1255.webp",
    provider: "SkylineWebcams",
  },
};
