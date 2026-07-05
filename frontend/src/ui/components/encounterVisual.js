// Visual anchors for Living Encounters — real illustrations/photos, one
// per motif, living in public/encounters/. Each was generated to a
// specific brief (scene, mood, palette) and picked for how well it matches
// that capsule's moment, not stock imagery — see the motif's alt text for
// what it depicts.
const MOTIFS = {
  'famine-coast': { file: 'famine-coast.jpg', alt: 'A stone cottage on a bare hillside above a harbour at dusk, fishing boats moored below, in a muted engraving style.' },
  'dublin-1916': { file: 'dublin-1916.jpg', alt: 'A grand domed Georgian building on a Dublin street, smoke rising in the distance, people gathered below.' },
  'ofrenda-table': { file: 'ofrenda-table.jpg', alt: "A home altar on a kitchen table: candles, marigold flowers, and a framed photo of a family member." },
  'buenos-aires-cafe': { file: 'buenos-aires-cafe.jpg', alt: 'A rain-streaked café window at night with a striped awning and a small table set for two.' },
  'madrid-tapas-bar': { file: 'madrid-tapas-bar.jpg', alt: 'A crowded, warmly lit Madrid tapas bar with cured hams hanging above the counter and plates of tapas laid out.' },
};

export function encounterVisualHtml(motif) {
  const m = MOTIFS[motif];
  if (!m) return '';
  return `<img class="encounter-visual" src="${import.meta.env.BASE_URL}encounters/${m.file}" alt="${m.alt}" loading="lazy" />`;
}
