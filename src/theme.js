export const COLORS = {
  bg: '#0D1117',
  surface: '#161B27',
  surfaceHi: '#1F2637',
  border: '#2A3247',
  text: '#F2F5FA',
  textDim: '#8B95A9',
  accent: '#E94560',
  accentDim: '#B32D45',
  good: '#2ECC71',
  warn: '#F5A623',
  danger: '#E74C3C',
};

// Bold palette for color-coded player cards (cycles for >12 players).
export const PLAYER_COLORS = [
  '#E94560', // red-pink
  '#3B82F6', // blue
  '#2ECC71', // green
  '#F5A623', // orange
  '#A855F7', // purple
  '#06B6D4', // cyan
  '#F43F8E', // magenta
  '#84CC16', // lime
  '#FB7185', // coral
  '#38BDF8', // sky
  '#FBBF24', // amber
  '#34D399', // emerald
];

export function playerColor(index) {
  return PLAYER_COLORS[index % PLAYER_COLORS.length];
}
