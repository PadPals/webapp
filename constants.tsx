
import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'PadPal Daily Regular',
    description: 'Standard absorbency for your average flow days. Reliable and discrete.',
    category: 'regular',
    stock: 120,
    variants: [
      { id: 'v1-1', size: '10 Pack', price: 45.00, image: 'Professional studio product photography of a clean, minimalist matte white packaging box for 10-pack PadPal Daily Regular sanitary pads. The box is completely white. Centered on the front is a bold, elegant red heart icon. Directly beneath the heart, the brand name "PadPal" and the slogan "Care Delivered" are printed in a clean, modern typeface. Soft, high-end studio lighting with natural shadows, very authentic and professional.' },
      { id: 'v1-2', size: '20 Pack', price: 80.00, image: 'Professional studio product photography of a clean, minimalist matte white packaging box for 20-pack PadPal Daily Regular sanitary pads. The box is completely white. Centered on the front is a bold, elegant red heart icon. Directly beneath the heart, the brand name "PadPal" and the slogan "Care Delivered" are printed in a clean, modern typeface. Soft, high-end studio lighting with natural shadows, very authentic and professional.' }
    ]
  },
  {
    id: 'p2',
    name: 'PadPal Super Protection',
    description: 'High-capacity absorbency for heavy flow days. Stay dry and confident.',
    category: 'super',
    stock: 90,
    variants: [
      { id: 'v2-1', size: '8 Pack', price: 52.00, image: 'Professional studio product photography of a clean, minimalist matte white packaging box for 8-pack PadPal Super Protection sanitary pads. The box is completely white. Centered on the front is a bold, elegant red heart icon. Directly beneath the heart, the brand name "PadPal" and the slogan "Care Delivered" are printed in a clean, modern typeface. Soft, high-end studio lighting with natural shadows, very authentic and professional.' },
      { id: 'v2-2', size: '16 Pack', price: 95.00, image: 'Professional studio product photography of a clean, minimalist matte white packaging box for 16-pack PadPal Super Protection sanitary pads. The box is completely white. Centered on the front is a bold, elegant red heart icon. Directly beneath the heart, the brand name "PadPal" and the slogan "Care Delivered" are printed in a clean, modern typeface. Soft, high-end studio lighting with natural shadows, very authentic and professional.' }
    ]
  },
  {
    id: 'p3',
    name: 'DreamGuard Overnight',
    description: 'Extra long coverage and specialized wings for total sleep protection.',
    category: 'overnight',
    stock: 85,
    variants: [
      { id: 'v3-1', size: 'Standard', price: 58.00, image: 'Professional studio product photography of a clean, minimalist matte white packaging box for DreamGuard Overnight sanitary pads. The box is completely white. Centered on the front is a bold, elegant red heart icon. Directly beneath the heart, the brand name "PadPal" and the slogan "Care Delivered" are printed in a clean, modern typeface. Soft, high-end studio lighting with natural shadows, very authentic and professional.' },
      { id: 'v3-2', size: 'Long', price: 65.00, image: 'Professional studio product photography of a clean, minimalist matte white packaging box for DreamGuard Overnight Long sanitary pads. The box is completely white. Centered on the front is a bold, elegant red heart icon. Directly beneath the heart, the brand name "PadPal" and the slogan "Care Delivered" are printed in a clean, modern typeface. Soft, high-end studio lighting with natural shadows, very authentic and professional.' }
    ]
  },
  {
    id: 'p4',
    name: 'SilkSoft Daily Liners',
    description: 'Ultra-thin, breathable liners for everyday freshness and light days.',
    category: 'liner',
    stock: 200,
    variants: [
      { id: 'v4-1', size: '30 Pack', price: 35.00, image: 'Professional studio product photography of a clean, minimalist matte white packaging box for SilkSoft Daily Liners. The box is completely white. Centered on the front is a bold, elegant red heart icon. Directly beneath the heart, the brand name "PadPal" and the slogan "Care Delivered" are printed in a clean, modern typeface. Soft, high-end studio lighting with natural shadows, very authentic and professional.' },
      { id: 'v4-2', size: '60 Pack', price: 60.00, image: 'Professional studio product photography of a clean, minimalist matte white packaging box for SilkSoft Daily Liners 60-pack. The box is completely white. Centered on the front is a bold, elegant red heart icon. Directly beneath the heart, the brand name "PadPal" and the slogan "Care Delivered" are printed in a clean, modern typeface. Soft, high-end studio lighting with natural shadows, very authentic and professional.' }
    ]
  }
];

export const SOUTH_AFRICAN_TOWNS = [
  "Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth (Gqeberha)", 
  "Bloemfontein", "Nelspruit (Mbombela)", "Kimberley", "Polokwane", "Pietermaritzburg", 
  "East London", "George", "Mossel Bay", "Knysna", "Hermanus", "Stellenbosch", "Paarl", 
  "Worcester", "Beaufort West", "Upington", "Welkom", "Kroonstad", "Bethal", "Ermelo", 
  "Standerton", "Secunda", "Witbank (Emalahleni)", "Middelburg", "Rustenburg", 
  "Klerksdorp", "Potchefstroom", "Mafikeng", "Vereeniging", "Vanderbijlpark", 
  "Benoni", "Boksburg", "Brakpan", "Germiston", "Randburg", "Sandton", "Soweto"
].sort();

export const SOUTH_AFRICAN_UNIVERSITIES = [
  "Cape Peninsula University of Technology (CPUT)",
  "Central University of Technology (CUT)",
  "Durban University of Technology (DUT)",
  "Mangosuthu University of Technology (MUT)",
  "Nelson Mandela University (NMU)",
  "North-West University (NWU)",
  "Rhodes University (RU)",
  "Sefako Makgatho Health Sciences University (SMU)",
  "Sol Plaatje University (SPU)",
  "Stellenbosch University (SU)",
  "Tshwane University of Technology (TUT)",
  "University of Cape Town (UCT)",
  "University of Fort Hare (UFH)",
  "University of Johannesburg (UJ)",
  "University of KwaZulu-Natal (UKZN)",
  "University of Limpopo (UL)",
  "University of Mpumalanga (UMP)",
  "University of Pretoria (UP)",
  "University of South Africa (UNISA)",
  "University of the Free State (UFS)",
  "University of Venda (UNIVEN)",
  "University of the Western Cape (UWC)",
  "University of the Witwatersrand (Wits)",
  "University of Zululand (UNIZULU)",
  "Vaal University of Technology (VUT)",
  "Walter Sisulu University (WSU)"
].sort();

export const PAD_SIZES = [
  "Liner",
  "Ultra-Thin Regular",
  "Ultra-Thin Super",
  "Regular",
  "Super",
  "Super Plus",
  "Overnight",
  "Maternity"
];

export const COLORS = {
  primary: '#E97E8B', // Warm Rose
  secondary: '#FFD7BA', // Soft Peach
  accent: '#FEEAFA', // Light Lavender
  text: '#4A3731',
  background: '#FFF9F6'
};
