
import { StagingOption, RoomTypeOption } from './types';

export const INTERIOR_ROOM_TYPES: RoomTypeOption[] = [
  { id: 'living_room', label: 'Living Room' },
  { id: 'bedroom', label: 'Bedroom' },
  { id: 'dining_room', label: 'Dining Room' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'bathroom', label: 'Bathroom' },
  { id: 'office', label: 'Home Office' },
  { id: 'great_room', label: 'Great Room' },
  { id: 'den', label: 'Den' },
  { id: 'study', label: 'Study' },
  { id: 'game_room', label: 'Game Room' },
];

export const EXTERIOR_SCENE_TYPES: RoomTypeOption[] = [
  { id: 'exterior', label: 'Exterior Front' },
  { id: 'backyard', label: 'Backyard' },
  { id: 'patio', label: 'Patio/Deck' },
];

export const ROOM_TYPES: RoomTypeOption[] = [...INTERIOR_ROOM_TYPES, ...EXTERIOR_SCENE_TYPES];

export const INTERIOR_STYLES: StagingOption[] = [
  {
    id: 'add-remove',
    label: 'Add/Remove Objects',
    description: 'Keep image unchanged, apply custom edits only.',
    tips: 'Be specific with locations. Try: "Add a large potted fiddle-leaf fig tree to the empty corner by the window" for the best results.\n\nThis is a great tool for subtle edits such as "add vase of tulips to table, remove items on mantle or put a fire in the fireplace". It is not a tool to do complex edits that require many steps and generations of the image as this may degrade image quality.',
    previewUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=200&h=150',
    prompt: 'Start with the original image. Only modify specific items as requested by the user. Preserve everything else.',
    category: 'interior',
    creditCost: 1
  },
  {
    id: 'empty',
    label: 'Empty the Room',
    description: 'Remove all furniture for a clean unfurnished view.',
    tips: 'Essential for renovation projects. If any shadows remain from old furniture, refine with: "Smooth out shadows on the floor to make the hardwood look pristine."',
    previewUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=200&h=150',
    prompt: 'DELETE all furniture and objects. ABSOLUTE REMOVAL: Completely strip the room of all loose furniture, chairs, sofas, tables, beds, rugs, decor, wall art, curtains, and clutter. CRITICAL ARCHITECTURAL FIDELITY: Maintain all architecturally correct detail. Do NOT change, smooth over, or alter the walls, flooring, windows, window frames, doors, baseboards, or crown molding. Preserve all built-in features like kitchen cabinetry, islands, fireplaces, and appliances exactly as they are.',
    category: 'interior',
    creditCost: 4
  },
  {
    id: 'antique',
    label: 'Antique / Vintage',
    description: 'Timeless elegance with vintage furniture and historical charm.',
    tips: 'Best for historic homes. Refine with: "Add a vintage Persian rug and a velvet armchair."',
    previewUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=200&h=150',
    prompt: 'Apply an Antique/Vintage staging style. Use period-correct furniture, rich wood textures, velvet or patterned upholstery, and vintage decor items like rugs and oil paintings. CRITICAL ARCHITECTURAL FIDELITY: Maintain all architecturally correct detail. Do NOT change, smooth over, or alter the walls, flooring, windows, window frames, doors, baseboards, or crown molding. Preserve all built-in features like kitchen cabinetry, islands, fireplaces, and appliances exactly as they are.',
    category: 'interior',
    creditCost: 4
  },
  {
    id: 'industrial',
    label: 'Industrial',
    description: 'Raw materials, exposed elements, and urban vibes.',
    tips: 'Great for lofts. Enhance the "cool" factor by adding industrial lighting: "Add a floor lamp with an Edison bulb and matte black metal finish."',
    previewUrl: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=200&h=150',
    prompt: 'Apply an Industrial staging style using metal accents, leather seating, and bold urban art. CRITICAL ARCHITECTURAL FIDELITY: Maintain all architecturally correct detail. Do NOT change, smooth over, or alter the walls, flooring, windows, window frames, doors, baseboards, or crown molding. Preserve all built-in features like kitchen cabinetry, islands, fireplaces, and appliances exactly as they are.',
    category: 'interior',
    creditCost: 4
  },
  {
    id: 'luxury',
    label: 'Luxury',
    description: 'Opulent materials, grand decor, and rich finishes.',
    tips: 'To emphasize value, add metallic accents. Refine with: "Add gold-trimmed decorative trays and marble coasters to the coffee table."',
    previewUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=200&h=150',
    prompt: 'Apply a Luxury staging style with velvet upholstery, marble-top tables, and sophisticated decor. CRITICAL ARCHITECTURAL FIDELITY: Maintain all architecturally correct detail. Do NOT change, smooth over, or alter the walls, flooring, windows, window frames, doors, baseboards, or crown molding. Preserve all built-in features like kitchen cabinetry, islands, fireplaces, and appliances exactly as they are.',
    category: 'interior',
    creditCost: 4
  },
  {
    id: 'minimalist',
    label: 'Minimalist',
    description: 'Simple, intentional, and clutter-free aesthetic.',
    tips: 'Less is more. This style focuses on open space. If it still feels crowded, refine with: "Remove all small decorative items and keep only the largest furniture piece."',
    previewUrl: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=200&h=150',
    prompt: 'Apply a Minimalist staging style. Use a restricted color palette, essential furniture only, and clean unadorned surfaces. Focus on spatial openness and high-quality, simple materials. CRITICAL ARCHITECTURAL FIDELITY: Maintain all architecturally correct detail. Do NOT change, smooth over, or alter the walls, flooring, windows, window frames, doors, baseboards, or crown molding. Preserve all built-in features like kitchen cabinetry, islands, fireplaces, and appliances exactly as they are.',
    category: 'interior',
    creditCost: 4
  },
  {
    id: 'modern',
    label: 'Modern',
    description: 'Clean lines, neutral palette, and sleek furniture.',
    tips: 'Modern staging works best in rooms with high ceilings or large windows. Use the refinement tool to add a bold piece of abstract art to create a focal point.',
    previewUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=200&h=150',
    prompt: 'Apply a Modern staging style using low-profile furniture, a monochromatic palette with wood accents, and minimal decor. CRITICAL ARCHITECTURAL FIDELITY: Maintain all architecturally correct detail. Do NOT change, smooth over, or alter the walls, flooring, windows, window frames, doors, baseboards, or crown molding. Preserve all built-in features like kitchen cabinetry, islands, fireplaces, and appliances exactly as they are. Preserve all architectural details, built-in cabinetry, appliances, and lighting fixtures with zero alterations.',
    category: 'interior',
    creditCost: 4
  },
  {
    id: 'rustic',
    label: 'Rustic / Country',
    description: 'Warm wood, cozy textures, and earthy tones.',
    tips: 'Cozy and nostalgic. If the colors feel too saturated, refine with: "Make the leaf colors more natural and earthy."',
    previewUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=200&h=150',
    prompt: 'Apply a Rustic staging style with reclaimed wood furniture, leather textures, and warm textiles. CRITICAL ARCHITECTURAL FIDELITY: Maintain all architecturally correct detail. Do NOT change, smooth over, or alter the walls, flooring, windows, window frames, doors, baseboards, or crown molding. Preserve all built-in features like kitchen cabinetry, islands, fireplaces, and appliances exactly as they are.Ensure all architectural details, kitchen cabinets, appliances, and fixtures are preserved without any changes.',
    category: 'interior',
    creditCost: 4
  },
  {
    id: 'scandinavian',
    label: 'Scandinavian',
    description: 'Functional, bright, and inspired by Nordic design.',
    tips: 'This style thrives on light. If the room looks dark, use the refinement prompt: "Brighten the overall exposure and add a light oak coffee table."',
    previewUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=200&h=150',
    prompt: 'Apply a Scandinavian staging style with light wood tones, functional furniture, and airy textiles. CRITICAL ARCHITECTURAL FIDELITY: Maintain all architecturally correct detail. Do NOT change, smooth over, or alter the walls, flooring, windows, window frames, doors, baseboards, or crown molding. Preserve all built-in features like kitchen cabinetry, islands, fireplaces, and appliances exactly as they are. Ensure all windows, cabinets, appliances, and fixtures remain completely unchanged.',
    category: 'interior',
    creditCost: 4
  },
  {
    id: 'traditional',
    label: 'Traditional',
    description: 'Classic comfort, symmetry, and timeless design elements.',
    tips: 'Great for family homes. If it feels too stiff, refine with: "Add soft throw pillows and a warm area rug to make it inviting."',
    previewUrl: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&q=80&w=200&h=150',
    prompt: 'Apply a Traditional staging style. Use classic furniture silhouettes, symmetrical arrangements, and a warm, rich color palette. Incorporate wood furniture, upholstered seating, and classic decor items like table lamps and vases. Maintain a sense of history and comfort.CRITICAL ARCHITECTURAL FIDELITY: Maintain all architecturally correct detail. Do NOT change, smooth over, or alter the walls, flooring, windows, window frames, doors, baseboards, or crown molding. Preserve all built-in features like kitchen cabinetry, islands, fireplaces, and appliances exactly as they are.Preserve all architectural details.',
    category: 'interior',
    creditCost: 4
  }
];

export const OUTDOOR_STYLES: StagingOption[] = [
  {
    id: 'add-remove',
    label: 'Add/Remove Objects',
    description: 'Keep image unchanged, apply custom edits only.',
    tips: 'Perfect for exterior tweaks. Try: "Add a modern fire pit and seating set to the patio" or "Remove the trash can from the side of the house". Use specific descriptions for best results.\n\nThis is a great tool for subtle edits such as "add patio chairs to the deck, remove the garden hose or add a walkway". It is not a tool to do complex edits that require many steps and generations of the image as this may degrade image quality.',
    previewUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=200&h=150',
    prompt: 'Start with the original image. Only modify specific items as requested by the user. Preserve everything else.',
    category: 'outdoor',
    creditCost: 1
  },
  {
    id: 'lawn-manicured',
    label: 'Lawn Replacement',
    description: 'Perfect, lush green grass replacement.',
    tips: 'This tool is magical for curb appeal. If the edges look fuzzy, use refinement: "Sharpen the edges where the lawn meets the driveway."',
    previewUrl: 'https://images.unsplash.com/photo-1592595896551-12b371d546d5?auto=format&fit=crop&q=80&w=200&h=150',
    prompt: 'Replace the existing lawn or ground cover with a perfect, lush, manicured green lawn. Fix any brown spots or patches. CRITICAL: You MUST preserve all original shadows cast on the lawn from trees, the house, or other objects. The new grass must sit under the existing shadow pattern. Do NOT alter the house structure, driveway, or walkway. Keep the sky and other trees as they are.',
    category: 'outdoor',
    creditCost: 2
  },
  {
    id: 'sky-blue',
    label: 'Sky Replacement',
    description: 'Bright sunny blue sky with soft clouds.',
    tips: 'Use this for properties photographed on overcast days. It instantly makes the home look more cheerful and welcoming.',
    previewUrl: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&q=80&w=200&h=150',
    prompt: 'Replace the sky with a brilliant, clear blue sunny sky with a few soft white clouds. Adjust the lighting on the house/landscape to match a sunny day. Do NOT alter the house architecture or landscaping.',
    category: 'outdoor',
    creditCost: 1
  },
  {
    id: 'sunny-bright',
    label: 'Sunny Day Overhaul',
    description: 'Transform overcast or rainy shots into perfect sunny days.',
    tips: 'Perfect for properties photographed in bad weather. This tool combines sky replacement and lawn enhancement with a warm sunlight filter to maximize curb appeal.',
    previewUrl: 'https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&q=80&w=200&h=150',
    prompt: 'Transform the entire atmosphere from a dull, rainy, or overcast day into a vibrant, high-contrast sunny day. Replace the sky with a clear blue sunny sky. Maintain season of original photo. Adjust the lighting on the architecture to reflect warm sunlight and create realistic shadows. Preserve the house structure perfectly.',
    category: 'outdoor',
    creditCost: 5
  },
  {
    id: 'season-summer',
    label: 'Summer Season',
    description: 'Vibrant green trees, bright sun, blue sky.',
    tips: 'Great for selling vacation homes. If the foliage is too sparse, refine with: "Add more leaves to the trees to make them look full and lush."',
    previewUrl: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&q=80&w=200&h=150',
    prompt: 'SEASONAL TRANSFORMATION REQUIREMENTS: Replace all bare trees with full, lush summer foliage appropriate to the species (dense green leaves, natural variation). Convert all grass to rich, healthy, deep green summer lawn with natural texture and subtle tonal variation. Enhance shrubs and hedges to appear full, vibrant, and well-maintained. Remove all signs of winter dormancy (no brown grass, no bare branches, no gray vegetation). Add subtle seasonal richness: slight warmth in color temperature, but keep it realistic and not stylized. Ensure background trees match foreground in density and seasonal consistency. Maintain photorealistic lighting consistency with soft daylight conditions. Avoid oversaturation or artificial greens.',
    category: 'outdoor',
    creditCost: 5
  },
  {
    id: 'season-spring',
    label: 'Spring Season',
    description: 'Fresh blooms, soft greens, and floral accents.',
    tips: 'Spring symbolizes new beginnings. Add more color by refining: "Add pink cherry blossoms to the trees in the foreground."',
    previewUrl: 'https://images.unsplash.com/photo-1557429287-b2e26467fc2b?auto=format&fit=crop&q=80&w=200&h=150',
    prompt: 'Transform the season to Spring. Add blooming flowers to bushes and trees. Use fresh, soft greens for the vegetation. Replace the sky with a clear blue sunny sky. The atmosphere should be fresh and airy. Preserve the house architecture.',
    category: 'outdoor',
    creditCost: 5
  },
  {
    id: 'season-autumn',
    label: 'Autumn Season',
    description: 'Fall foliage with oranges and reds.',
    tips: 'Cozy and nostalgic. If the colors feel too saturated, refine with: "Make the leaf colors more natural and earthy."',
    previewUrl: 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&q=80&w=200&h=150',
    prompt: 'Transform the season to Autumn. Change tree foliage to vibrant oranges, reds, and yellows. Add some fallen leaves to the ground. Replace the sky with a clear blue sunny sky. Keep the house structure exactly as is.',
    category: 'outdoor',
    creditCost: 5
  },
  {
    id: 'season-winter',
    label: 'Winter Season',
    description: 'Snowy landscape and cozy winter atmosphere.',
    tips: 'Help buyers imagine a cozy holiday home. Refine with: "Add a light dusting of snow to the window sills for a more realistic touch."',
    previewUrl: 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&q=80&w=200&h=150',
    prompt: 'Transform the season to Winter. Add realistic snow to the ground, roof, and trees. The atmosphere should be cold and crisp. Replace the sky with a clear blue sunny sky. Preserve the underlying architecture perfectly.',
    category: 'outdoor',
    creditCost: 5
  },
  {
    id: 'twilight',
    label: 'Twilight / Dusk',
    description: 'Evening ambiance with warm window glow.',
    tips: 'The "Hero" shot for any luxury listing. Refine by adding a "Warm golden glow to all exterior lighting fixtures" to maximize the premium feel.',
    previewUrl: 'https://images.unsplash.com/photo-1510627489930-0c1b0bfb6785?auto=format&fit=crop&q=80&w=200&h=150',
    prompt: 'Transform the scene to a Twilight/Dusk setting. Deep blue evening sky. Turn on all interior lights so windows glow warmly. Turn on exterior lighting fixtures. Do not move furniture or change the house structure.',
    category: 'outdoor',
    creditCost: 5
  }
];

export const ALL_STYLES = [...INTERIOR_STYLES, ...OUTDOOR_STYLES];
