import candidates from "./beaches.json";
import content from "./beach-content.json";
import imageAssets from "./image-assets.json";
import { describe, expect, it } from "vitest";
import { validateImageCatalog } from "../../../src/data/catalog-image-contract";
import { validateSicilianCatalog } from "../../../src/data/catalog-contract";
import { validateSicilianMasterCatalog } from "../../../src/data/catalog-master-contract";

const EXPANSION_SLUGS = [
  "baia-del-tono-milazzo",
  "croce-di-mare-milazzo",
  "san-gregorio-capo-d-orlando",
  "gioiosa-marea",
  "capo-calava-gioiosa-marea",
  "laghetti-di-marinello",
  "mongiove-patti",
  "spisone-taormina",
  "isola-bella-taormina",
  "mazzaro-taormina",
  "letojanni",
  "giardini-naxos",
  "sant-alessio-siculo",
  "roccalumera",
  "la-plaia-catania",
  "san-giovanni-li-cuti",
  "ognina-catania",
  "aci-trezza",
  "aci-castello",
  "capomulini",
  "santa-maria-la-scala",
  "santa-tecla-acireale",
  "fondachello-mascali",
  "calamosche",
  "eloro",
  "marianelli",
  "vendicari",
  "san-lorenzo-vendicari",
  "fontane-bianche",
  "arenella-siracusa",
  "fanusa",
  "minareto-siracusa",
  "isola-delle-correnti",
  "marina-di-ragusa",
  "donnalucata",
  "sampieri",
  "cava-d-aliga",
  "punta-secca",
  "caucana",
  "maganuco",
  "raganzino",
  "san-leone",
  "scala-dei-turchi",
  "capo-rossello",
  "giallonardo",
  "siculiana-marina",
  "eraclea-minoa",
  "marina-di-palma",
  "mollarella",
  "cala-paradiso-licata",
  "manfria",
  "macchitella",
  "falconara-butera",
  "desusino",
  "capo-peloro-messina",
  "santa-teresa-di-riva",
  "piscina-di-venere-milazzo",
  "canneto-lipari",
  "sabbie-nere-vulcano",
  "pollara-salina",
  "san-marco-calatabiano",
  "marina-di-cottone",
  "torre-archirafi",
  "stazzo-acireale",
  "pozzillo-acireale",
  "praiola-giarre",
  "foce-simeto",
  "faraglioni-dei-ciclopi",
  "primosole-catania",
  "villaggio-aurora-catania",
  "lido-azzurro-catania",
  "marina-di-avola",
  "pantanello-avola",
  "gallina-avola",
  "calabernardo-noto",
  "morghella-pachino",
  "marzamemi-spinazza",
  "punta-delle-formiche",
  "costa-dell-ambra",
  "terrauzza-siracusa",
  "faro-santa-croce-augusta",
  "scoglitti-lanterna",
  "kammarana-scoglitti",
  "punta-cirica-ispica",
  "casuzze",
  "foce-fiume-irminio",
  "playa-grande-scicli",
  "spinasanta-donnalucata",
  "costa-di-carro-scicli",
  "pisciotto-sampieri",
  "marina-di-modica",
  "pietrenere-pozzallo",
  "santa-maria-del-focallo",
  "porto-palo-menfi",
  "le-solette-menfi",
  "san-marco-sciacca",
  "timpi-russi-sciacca",
  "sovareto-sciacca",
  "seccagrande-ribera",
  "bovo-marina-montallegro",
  "le-pergole-realmonte",
  "lido-azzurro-porto-empedocle",
  "punta-bianca-agrigento",
  "spiaggia-dei-conigli-lampedusa",
  "marina-di-butera",
  "tenutella-butera",
  "passo-marina-butera",
  "punta-due-rocche-butera",
  "cava-d-oro-butera",
  "lungomare-federico-ii-gela",
  "montelungo-gela",
  "roccazzelle-gela",
  "femmina-morta-gela",
  "piana-marina-gela",
  "foce-biviere-gela",
  "spinasanta-gela",
  "san-nicola-gela",
  "lido-la-conchiglia-gela",
  "contrada-rizzuto-gela",
  "bulala-gela"
] as const;

const EXPANSION_IMAGE_SLUGS = EXPANSION_SLUGS;

const PENDING_MEDIA_SLUGS = EXPANSION_SLUGS.filter(
  (slug) => !EXPANSION_IMAGE_SLUGS.includes(slug as (typeof EXPANSION_IMAGE_SLUGS)[number]),
);

describe("Sicilian provincial expansion", () => {
  it("keeps all 120 approved slugs in the candidate and content manifests", () => {
    const candidateResult = validateSicilianCatalog(candidates);
    const contentResult = validateSicilianMasterCatalog(content);
    const imageResult = validateImageCatalog(imageAssets, new Set(candidates.map((row) => row.slug)));
    const candidateSlugs = new Set(candidateResult.records.map((row) => row.slug));
    const contentSlugs = new Set(contentResult.records.map((row) => row.slug));

    expect(candidateResult.issues).toEqual([]);
    expect(contentResult.issues).toEqual([]);
    expect(imageResult.issues).toEqual([]);
    expect(EXPANSION_SLUGS).toHaveLength(120);
    expect(EXPANSION_SLUGS.every((slug) => candidateSlugs.has(slug))).toBe(true);
    expect(EXPANSION_SLUGS.every((slug) => contentSlugs.has(slug))).toBe(true);
  });

  it("assigns distinct local Commons assets only to destinations that passed the photo gate", () => {
    const expansionAssets = imageAssets.filter((asset) => EXPANSION_SLUGS.includes(asset.slug as (typeof EXPANSION_SLUGS)[number]));
    const paths = expansionAssets.map((asset) => asset.image_path);
    const imageSlugs = new Set(expansionAssets.map((asset) => asset.slug));

    expect(expansionAssets).toHaveLength(EXPANSION_IMAGE_SLUGS.length);
    expect(EXPANSION_IMAGE_SLUGS.every((slug) => imageSlugs.has(slug))).toBe(true);
    expect(PENDING_MEDIA_SLUGS).toHaveLength(0);
    expect(new Set(paths).size).toBe(EXPANSION_IMAGE_SLUGS.length);
    expect(expansionAssets.every((asset) => asset.image_path.startsWith("/images/beaches/"))).toBe(true);
    expect(expansionAssets.every((asset) => asset.source_url.includes("commons.wikimedia.org/wiki/File:"))).toBe(true);
  });

  it("marks all expansion destinations as media-verified once photos are approved", () => {
    const recordsBySlug = new Map(candidates.map((row) => [row.slug, row]));

    expect(PENDING_MEDIA_SLUGS).toHaveLength(0);
    expect(EXPANSION_IMAGE_SLUGS).toHaveLength(120);
    expect(EXPANSION_IMAGE_SLUGS.every((slug) => recordsBySlug.get(slug)?.notes?.includes("media-verified"))).toBe(true);
  });

  it("keeps every expansion row unpublished", () => {
    const recordsBySlug = new Map(candidates.map((row) => [row.slug, row]));

    expect(EXPANSION_SLUGS.every((slug) => recordsBySlug.get(slug)?.publication_status === "draft")).toBe(true);
  });
});
