import type { BeachWebcam } from "../domain/beach";

/**
 * Mappatura accurata ed esclusiva delle sole spiagge che dispongono
 * di una vera webcam live attiva e verificata direttamente sul posto.
 */
export const BEACH_WEBCAMS: Record<string, BeachWebcam> = {
  // Spiaggia di Mondello (Palermo)
  "mondello": {
    title: "Spiaggia e Golfo di Mondello",
    embedUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/palermo/mondello.html",
    liveUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/palermo/mondello.html",
    provider: "SkylineWebcams / Mondello Italo Belga",
  },

  // Spiaggia del Lungomare di Cefalù (Palermo)
  "spiaggia-del-lungomare-cefalu": {
    title: "Lungomare e Spiaggia di Cefalù",
    embedUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/palermo/cefalu.html",
    liveUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/palermo/cefalu.html",
    provider: "SkylineWebcams / Comune di Cefalù",
  },

  // Spiaggia di San Vito Lo Capo (Trapani)
  "san-vito-lo-capo": {
    title: "Spiaggia e Baia di San Vito Lo Capo",
    embedUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/trapani/san-vito-lo-capo.html",
    liveUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/trapani/san-vito-lo-capo.html",
    provider: "SkylineWebcams / Pro Loco San Vito",
  },

  // Spiaggia Playa di Castellammare del Golfo (Trapani)
  "spiaggia-playa-castellammare": {
    title: "Spiaggia Plaja di Castellammare del Golfo",
    embedUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/trapani/castellammare-del-golfo.html",
    liveUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/trapani/castellammare-del-golfo.html",
    provider: "SkylineWebcams",
  },

  // Cala Petrolo / Porto di Castellammare (Trapani)
  "cala-petrolo-castellammare": {
    title: "Golfo e Cala Petrolo (Castellammare)",
    embedUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/trapani/castellammare-del-golfo.html",
    liveUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/trapani/castellammare-del-golfo.html",
    provider: "SkylineWebcams",
  },

  // Favignana (Egadi / Trapani)
  "cala-rossa-favignana": {
    title: "Favignana e Costa",
    embedUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/trapani/favignana.html",
    liveUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/trapani/favignana.html",
    provider: "SkylineWebcams",
  },
};
