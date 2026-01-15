
export interface ColorPreset {
  id: string;
  label: string;
  description: string;
  colors: string[]; // For UI preview
}

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'vibrant',
    label: 'Vibrant Anime',
    description: 'Use a high-contrast, modern anime color palette. Saturated blues, reds, and yellows. Sharp cel-shading with clear highlights and deep shadows. Characters should stand out with glowing or vivid hair and eye colors.',
    colors: ['#ff4757', '#2e86de', '#ffa502', '#2ed573']
  },
  {
    id: 'muted',
    label: 'Muted Tones',
    description: 'Apply a soft, cinematic, desaturated color palette. Use pastel tones, earthy browns, and muted greens. Lighting should be soft and diffused, reminiscent of a slice-of-life or drama series. Avoid harsh blacks and bright neons.',
    colors: ['#a4b0be', '#747d8c', '#ced6e0', '#f1f2f6']
  },
  {
    id: 'historical',
    label: 'Historical / Retro',
    description: 'Use a retro manga aesthetic with aged paper textures. Primarily sepia, cream, and deep ink-washed colors. Think 70s or 80s classic manga volumes. Use warm oranges, faded reds, and deep navy for shading.',
    colors: ['#d35400', '#c0392b', '#7f8c8d', '#2c3e50']
  },
  {
    id: 'cyberpunk',
    label: 'Cyberpunk Neon',
    description: 'A futuristic, dark-synthwave palette. Deep purples, electric pinks, and cyan neons. Characters should be bathed in artificial light sources. Use high-energy, glowing gradients and digital-inspired color transitions.',
    colors: ['#ef57ff', '#00d2ff', '#3a1c71', '#ff00cc']
  },
  {
    id: 'watercolor',
    label: 'Classic Watercolor',
    description: 'Imitate a hand-painted watercolor look. Use bleeds, soft edges, and visible paper grain. Colors should be layered and slightly transparent. Use natural, organic pigments like indigo, madder red, and ochre.',
    colors: ['#1e3799', '#eb2f06', '#f6b93b', '#78e08f']
  }
];
