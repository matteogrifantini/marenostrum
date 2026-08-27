import type { BeachWebcam } from "../domain/beach";

export const BEACH_WEBCAMS: Record<string, BeachWebcam> = {
  "mondello": {
    title: "Spiaggia e Golfo di Mondello",
    embedUrl: "https://embed.skylinewebcams.com/live.php?id=381",
    liveUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/palermo/mondello.html",
    provider: "SkylineWebcams / Mondello Italo Belga",
  },
  "spiaggia-di-cefalu": {
    title: "Lungomare e Spiaggia di Cefalù",
    embedUrl: "https://embed.skylinewebcams.com/live.php?id=275",
    liveUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/palermo/cefalu.html",
    provider: "SkylineWebcams / Comune di Cefalù",
  },
  "san-vito-lo-capo": {
    title: "Spiaggia di San Vito Lo Capo",
    embedUrl: "https://embed.skylinewebcams.com/live.php?id=385",
    liveUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/trapani/san-vito-lo-capo.html",
    provider: "SkylineWebcams / Pro Loco San Vito",
  },
  "cala-petrolo-castellammare": {
    title: "Golfo di Castellammare del Golfo",
    embedUrl: "https://embed.skylinewebcams.com/live.php?id=361",
    liveUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/trapani/castellammare-del-golfo.html",
    provider: "SkylineWebcams",
  },
  "spiaggia-plaja-castellammare": {
    title: "Spiaggia Plaja di Castellammare",
    embedUrl: "https://embed.skylinewebcams.com/live.php?id=361",
    liveUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/trapani/castellammare-del-golfo.html",
    provider: "SkylineWebcams",
  },
  "cala-rossa-favignana": {
    title: "Favignana e Costa",
    embedUrl: "https://embed.skylinewebcams.com/live.php?id=1255",
    liveUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/trapani/favignana.html",
    provider: "SkylineWebcams / Area Marina Protetta",
  },
};
