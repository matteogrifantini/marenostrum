type WindPreposition = "exposure" | "shelter";

const SPECIAL_WIND_ARTICLES: Record<string, Record<WindPreposition, string>> = {
  ostro: { exposure: "all'", shelter: "dall'" },
  scirocco: { exposure: "allo ", shelter: "dallo " },
  tramontana: { exposure: "alla ", shelter: "dalla " },
};

export function formatWindWithArticle(
  windName: string,
  preposition: WindPreposition,
) {
  const fallback = preposition === "exposure" ? "al " : "dal ";
  return `${SPECIAL_WIND_ARTICLES[windName]?.[preposition] ?? fallback}${windName}`;
}
