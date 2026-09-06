import type { BeachWebcam } from "../domain/beach";

/**
 * Mappatura statica delle spiagge con una pagina provider dedicata alla webcam.
 * Lo stato live e la disponibilita delle anteprime non sono verificati qui.
 */
export const BEACH_WEBCAMS: Record<string, BeachWebcam> = {
  // Spiaggia di Mondello (Palermo)
  "mondello": {
    title: "Spiaggia e Golfo di Mondello",
    embedUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/palermo/spiaggia-mondello.html",
    liveUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/palermo/spiaggia-mondello.html",
    posterUrl: "https://cdn.skylinewebcams.com/live234.jpg",
    provider: "SkylineWebcams / Albaria Mondello",
  },

  // Spiaggia di San Vito Lo Capo (Trapani)
  "san-vito-lo-capo": {
    title: "Spiaggia e Baia di San Vito Lo Capo",
    embedUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/trapani/san-vito-lo-capo.html",
    liveUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/trapani/san-vito-lo-capo.html",
    posterUrl: "https://cdn.skylinewebcams.com/live571.jpg",
    provider: "SkylineWebcams / Pro Loco San Vito",
  },

  // Isola delle Femmine (Palermo)
  "isola-delle-femmine": {
    title: "Spiaggia e Isolotto di Isola delle Femmine",
    embedUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/palermo/isola-delle-femmine.html",
    liveUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/palermo/isola-delle-femmine.html",
    posterUrl: "https://cdn.skylinewebcams.com/live234.jpg",
    provider: "SkylineWebcams",
  },

  // Addaura (Palermo)
  "addaura": {
    title: "Costa e Baia dell'Addaura",
    embedUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/palermo/addaura.html",
    liveUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/palermo/addaura.html",
    posterUrl: "https://cdn.skylinewebcams.com/live480.jpg",
    provider: "SkylineWebcams",
  },

  // Marinella di Selinunte (Trapani)
  "marinella-di-selinunte": {
    title: "Spiaggia di Marinella di Selinunte",
    embedUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/trapani/selinunte-marinella.html",
    liveUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/trapani/selinunte-marinella.html",
    posterUrl: "https://cdn.skylinewebcams.com/live2512.jpg",
    provider: "SkylineWebcams",
  },

  // Baia Santa Margherita / Macari (Trapani)
  "baia-santa-margherita-macari": {
    title: "Golfo di Macari e Baia Santa Margherita",
    embedUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/trapani/castelluzzo.html",
    liveUrl: "https://www.skylinewebcams.com/it/webcam/italia/sicilia/trapani/castelluzzo.html",
    posterUrl: "https://cdn.skylinewebcams.com/live856.jpg",
    provider: "SkylineWebcams",
  },
};
