// Visual anchors for Living Encounters. This sandbox's network policy
// blocks every real archival/museum image host tried (Wikimedia Commons,
// Library of Congress, Smithsonian Open Access all refuse the connection)
// — so rather than fake photographic authenticity, these are original,
// deliberately restrained silhouette illustrations. Honest about what
// they are: a designed scene-setting visual, not a historical photograph.
const MOTIFS = {
  'famine-coast': `
    <svg viewBox="0 0 400 190" class="encounter-visual" role="img" aria-label="A silhouette of a cottage on a bare hillside above a harbour, with a ship departing on the horizon">
      <defs>
        <linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#232a28"/>
          <stop offset="100%" stop-color="#3a423d"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="400" height="190" fill="url(#sky1)"/>
      <circle cx="320" cy="40" r="18" fill="#4a534d" opacity="0.55"/>
      <path d="M0,140 Q80,110 160,132 T400,120 V190 H0 Z" fill="#161c19"/>
      <path d="M40,132 L40,110 L58,92 L76,110 L76,132 Z" fill="#0e1310"/>
      <rect x="46" y="115" width="8" height="10" fill="#232a28"/>
      <g stroke="#232a28" stroke-width="1.5" opacity="0.6">
        <path d="M90,138 q10,-6 20,0"/>
        <path d="M115,141 q10,-6 20,0"/>
        <path d="M140,138 q10,-6 20,0"/>
        <path d="M165,142 q10,-6 20,0"/>
      </g>
      <path d="M0,160 Q100,145 200,158 T400,150 V190 H0 Z" fill="#0e1310"/>
      <g transform="translate(300,150)" opacity="0.75">
        <path d="M0,10 L34,10 L28,16 L6,16 Z" fill="#161c19"/>
        <line x1="17" y1="10" x2="17" y2="-14" stroke="#161c19" stroke-width="1.3"/>
        <path d="M17,-13 L17,2 L2,2 Z" fill="#161c19" opacity="0.85"/>
      </g>
    </svg>
  `,
  'ofrenda-table': `
    <svg viewBox="0 0 400 190" class="encounter-visual" role="img" aria-label="A silhouette of a home altar with candles, marigold flowers, and a framed photo">
      <defs>
        <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#241a14"/>
          <stop offset="100%" stop-color="#3d2a1a"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="400" height="190" fill="url(#sky2)"/>
      <path d="M0,150 L400,150 L400,190 L0,190 Z" fill="#1c130e"/>
      <rect x="60" y="140" width="280" height="10" fill="#1c130e"/>
      <g opacity="0.9">
        <path d="M180,138 L200,80 L220,138 Z" fill="#140d09"/>
        <rect x="196" y="90" width="8" height="48" fill="#241a14"/>
      </g>
      <g fill="#c97a2b" opacity="0.85">
        <circle cx="90" cy="132" r="7"/><circle cx="106" cy="136" r="7"/><circle cx="122" cy="130" r="7"/>
        <circle cx="278" cy="130" r="7"/><circle cx="294" cy="136" r="7"/><circle cx="310" cy="132" r="7"/>
      </g>
      <g transform="translate(140,105)" opacity="0.85">
        <rect x="0" y="0" width="30" height="9" rx="1.5" fill="#140d09"/>
        <rect x="2" y="-16" width="3" height="17" fill="#e8a23f"/>
        <circle cx="3.5" cy="-18" r="3" fill="#e8a23f" opacity="0.6"/>
      </g>
      <g transform="translate(230,105)" opacity="0.85">
        <rect x="0" y="0" width="30" height="9" rx="1.5" fill="#140d09"/>
        <rect x="24" y="-16" width="3" height="17" fill="#e8a23f"/>
        <circle cx="25.5" cy="-18" r="3" fill="#e8a23f" opacity="0.6"/>
      </g>
    </svg>
  `,
  'dublin-1916': `
    <svg viewBox="0 0 400 190" class="encounter-visual" role="img" aria-label="A silhouette of a Dublin street with a domed building facade and a rising haze of smoke">
      <defs>
        <linearGradient id="sky3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#221a16"/>
          <stop offset="100%" stop-color="#3a2c22"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="400" height="190" fill="url(#sky3)"/>
      <ellipse cx="140" cy="60" rx="60" ry="22" fill="#4a3a2e" opacity="0.35"/>
      <ellipse cx="230" cy="45" rx="50" ry="18" fill="#4a3a2e" opacity="0.3"/>
      <path d="M0,155 L400,155 L400,190 L0,190 Z" fill="#160f0b"/>
      <g fill="#120b08">
        <rect x="20" y="90" width="70" height="65"/>
        <rect x="100" y="70" width="55" height="85"/>
        <rect x="260" y="80" width="60" height="75"/>
        <rect x="330" y="95" width="55" height="60"/>
      </g>
      <g fill="#160f0b">
        <rect x="160" y="60" width="90" height="95"/>
        <path d="M160,60 L205,30 L250,60 Z"/>
        <rect x="196" y="20" width="18" height="20" rx="2"/>
      </g>
      <g fill="#3a2c22" opacity="0.5">
        <rect x="176" y="80" width="12" height="18"/>
        <rect x="199" y="80" width="12" height="18"/>
        <rect x="222" y="80" width="12" height="18"/>
      </g>
    </svg>
  `,
  'buenos-aires-cafe': `
    <svg viewBox="0 0 400 190" class="encounter-visual" role="img" aria-label="A silhouette of a café window with a striped awning, a small table, and two cups">
      <defs>
        <linearGradient id="sky4" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#151b22"/>
          <stop offset="100%" stop-color="#232f38"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="400" height="190" fill="url(#sky4)"/>
      <rect x="0" y="60" width="400" height="6" fill="#0f1418"/>
      <g fill="#3f8de3" opacity="0.5">
        <path d="M20,20 L60,20 L55,60 L25,60 Z"/>
        <path d="M60,20 L100,20 L95,60 L65,60 Z" fill="#eaf1f8" opacity="0.55"/>
        <path d="M100,20 L140,20 L135,60 L105,60 Z"/>
      </g>
      <rect x="30" y="65" width="100" height="80" fill="#0f1418" opacity="0.9"/>
      <rect x="34" y="69" width="92" height="70" fill="#1c2530" opacity="0.6"/>
      <path d="M0,190 L0,150 Q200,130 400,150 L400,190 Z" fill="#0f1418"/>
      <g transform="translate(230,120)" opacity="0.85">
        <ellipse cx="0" cy="30" rx="55" ry="6" fill="#0f1418"/>
        <rect x="-3" y="-2" width="6" height="30" fill="#0f1418"/>
        <ellipse cx="-25" cy="8" rx="12" ry="9" fill="#151b22"/>
        <rect x="-30" y="8" width="10" height="10" fill="#151b22"/>
        <ellipse cx="18" cy="10" rx="10" ry="8" fill="#151b22"/>
      </g>
    </svg>
  `,
};

export function encounterVisualHtml(motif) {
  return MOTIFS[motif] || '';
}
