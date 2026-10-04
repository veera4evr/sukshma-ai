/**
 * Seed data: representative panchayats across India with approximate lat/lon.
 * These are used for GPS-based nearest-panchayat lookup (Haversine distance).
 * The 12 "registered" panchayats in the demo (Thanjavur district) are included
 * along with broader coverage for realistic GPS demo behaviour.
 *
 * NOTE: Coordinates are approximate and for demo purposes only.
 */

export interface IndiaPanchayat {
  id: string;
  name: string;
  block: string;
  district: string;
  state: string;
  lat: number;
  lon: number;
  /** Whether this panchayat is part of the full registered demo dataset */
  registered: boolean;
}

/**
 * The 12 Thanjavur demo panchayats with realistic lat/lon in Thanjavur district, TN.
 * Centroid of Thanjavur district ≈ 10.79°N, 79.14°E — we spread them ±0.2°.
 */
const THANJAVUR_PANCHAYATS: IndiaPanchayat[] = [
  { id: "kandiyur",         name: "Kandiyur",         block: "Thiruvaiyaru", district: "Thanjavur", state: "Tamil Nadu", lat: 10.862, lon: 79.102, registered: true },
  { id: "naducauvery",      name: "Naducauvery",      block: "Thiruvaiyaru", district: "Thanjavur", state: "Tamil Nadu", lat: 10.883, lon: 79.151, registered: true },
  { id: "tirupalanam",      name: "Tirupalanam",      block: "Thiruvaiyaru", district: "Thanjavur", state: "Tamil Nadu", lat: 10.904, lon: 79.195, registered: true },
  { id: "melattur",         name: "Melattur",         block: "Thiruvaiyaru", district: "Thanjavur", state: "Tamil Nadu", lat: 10.924, lon: 79.248, registered: true },
  { id: "kabisthalam",      name: "Kabisthalam",      block: "Papanasam",    district: "Thanjavur", state: "Tamil Nadu", lat: 10.791, lon: 79.069, registered: true },
  { id: "ayyampettai",      name: "Ayyampettai",      block: "Papanasam",    district: "Thanjavur", state: "Tamil Nadu", lat: 10.812, lon: 79.114, registered: true },
  { id: "ammapettai",       name: "Ammapettai",       block: "Papanasam",    district: "Thanjavur", state: "Tamil Nadu", lat: 10.835, lon: 79.163, registered: true },
  { id: "vilangudi",        name: "Vilangudi",         block: "Papanasam",    district: "Thanjavur", state: "Tamil Nadu", lat: 10.855, lon: 79.214, registered: true },
  { id: "okkanadu",         name: "Okkanadu",         block: "Orathanadu",   district: "Thanjavur", state: "Tamil Nadu", lat: 10.718, lon: 79.083, registered: true },
  { id: "thennamanadu",     name: "Thennamanadu",     block: "Orathanadu",   district: "Thanjavur", state: "Tamil Nadu", lat: 10.738, lon: 79.131, registered: true },
  { id: "kannanthangudi",   name: "Kannanthangudi",   block: "Orathanadu",   district: "Thanjavur", state: "Tamil Nadu", lat: 10.762, lon: 79.178, registered: true },
  { id: "pudur",            name: "Pudur",            block: "Orathanadu",   district: "Thanjavur", state: "Tamil Nadu", lat: 10.782, lon: 79.226, registered: true },
];

/** Broader India coverage — representative agricultural panchayats */
const INDIA_PANCHAYATS: IndiaPanchayat[] = [
  // Punjab
  { id: "ludhiana-rural",   name: "Ludhiana Rural",  block: "Ludhiana West", district: "Ludhiana",    state: "Punjab",        lat: 30.901, lon: 75.857, registered: false },
  { id: "amritsar-khem",    name: "Khem Karan",      block: "Patti",         district: "Amritsar",    state: "Punjab",        lat: 31.145, lon: 74.682, registered: false },
  { id: "sangrur-lehra",    name: "Lehra Gaga",      block: "Lehra",         district: "Sangrur",     state: "Punjab",        lat: 30.108, lon: 75.482, registered: false },
  // Haryana
  { id: "karnal-assandh",   name: "Assandh",         block: "Assandh",       district: "Karnal",      state: "Haryana",       lat: 29.512, lon: 76.581, registered: false },
  { id: "hisar-rural",      name: "Hisar Rural",     block: "Hisar-I",       district: "Hisar",       state: "Haryana",       lat: 29.151, lon: 75.723, registered: false },
  // Uttar Pradesh
  { id: "agra-khandauli",   name: "Khandauli",       block: "Khandauli",     district: "Agra",        state: "Uttar Pradesh", lat: 27.183, lon: 78.186, registered: false },
  { id: "varanasi-sewapuri", name: "Sewapuri",        block: "Sewapuri",      district: "Varanasi",    state: "Uttar Pradesh", lat: 25.281, lon: 82.894, registered: false },
  { id: "gorakhpur-rural",  name: "Gorakhpur Rural", block: "Sahjanwa",      district: "Gorakhpur",   state: "Uttar Pradesh", lat: 26.764, lon: 83.371, registered: false },
  // Madhya Pradesh
  { id: "indore-mhow",      name: "Mhow",            block: "Mhow",          district: "Indore",      state: "Madhya Pradesh",lat: 22.551, lon: 75.762, registered: false },
  { id: "jabalpur-panagar", name: "Panagar",         block: "Panagar",       district: "Jabalpur",    state: "Madhya Pradesh",lat: 23.291, lon: 79.981, registered: false },
  // Rajasthan
  { id: "jaipur-bassi",     name: "Bassi",           block: "Bassi",         district: "Jaipur",      state: "Rajasthan",     lat: 26.848, lon: 76.052, registered: false },
  { id: "jodhpur-osian",    name: "Osian",           block: "Osian",         district: "Jodhpur",     state: "Rajasthan",     lat: 26.727, lon: 72.912, registered: false },
  // Gujarat
  { id: "surat-olpad",      name: "Olpad",           block: "Olpad",         district: "Surat",       state: "Gujarat",       lat: 21.344, lon: 72.749, registered: false },
  { id: "anand-khambhat",   name: "Khambhat",        block: "Khambhat",      district: "Anand",       state: "Gujarat",       lat: 22.319, lon: 72.619, registered: false },
  // Maharashtra
  { id: "pune-mulshi",      name: "Mulshi",          block: "Mulshi",        district: "Pune",        state: "Maharashtra",   lat: 18.519, lon: 73.524, registered: false },
  { id: "nashik-sinnar",    name: "Sinnar",          block: "Sinnar",        district: "Nashik",      state: "Maharashtra",   lat: 19.844, lon: 74.001, registered: false },
  { id: "nagpur-kalmeshwar",name: "Kalmeshwar",      block: "Kalmeshwar",    district: "Nagpur",      state: "Maharashtra",   lat: 21.177, lon: 78.909, registered: false },
  // Karnataka
  { id: "dharwad-kalghatgi", name: "Kalghatgi",      block: "Kalghatgi",     district: "Dharwad",     state: "Karnataka",     lat: 15.182, lon: 75.032, registered: false },
  { id: "tumkur-tiptur",    name: "Tiptur",          block: "Tiptur",        district: "Tumkur",      state: "Karnataka",     lat: 13.261, lon: 76.478, registered: false },
  { id: "mysuru-hunsur",    name: "Hunsur",          block: "Hunsur",        district: "Mysuru",      state: "Karnataka",     lat: 12.302, lon: 76.291, registered: false },
  // Andhra Pradesh
  { id: "krishna-jaggayapet", name: "Jaggayapet",   block: "Jaggayapet",    district: "Krishna",     state: "Andhra Pradesh",lat: 16.895, lon: 80.097, registered: false },
  { id: "guntur-narasaraopet", name: "Narasaraopet", block: "Narasaraopet",  district: "Guntur",      state: "Andhra Pradesh",lat: 16.234, lon: 80.051, registered: false },
  // Telangana
  { id: "warangal-hanamkonda", name: "Hanamkonda",  block: "Hanamkonda",    district: "Warangal",    state: "Telangana",     lat: 18.015, lon: 79.556, registered: false },
  { id: "medak-siddipet",   name: "Siddipet",        block: "Siddipet",      district: "Medak",       state: "Telangana",     lat: 18.101, lon: 78.851, registered: false },
  // Tamil Nadu
  { id: "coimbatore-kinathukadavu", name: "Kinathukadavu", block: "Kinathukadavu", district: "Coimbatore", state: "Tamil Nadu", lat: 10.812, lon: 77.051, registered: false },
  { id: "madurai-melur",    name: "Melur",           block: "Melur",         district: "Madurai",     state: "Tamil Nadu",    lat: 10.046, lon: 78.342, registered: false },
  { id: "salem-attur",      name: "Attur",           block: "Attur",         district: "Salem",       state: "Tamil Nadu",    lat: 11.596, lon: 78.601, registered: false },
  // Kerala
  { id: "thrissur-chalakudy", name: "Chalakudy",     block: "Chalakudy",     district: "Thrissur",    state: "Kerala",        lat: 10.301, lon: 76.331, registered: false },
  { id: "palakkad-ottapalam", name: "Ottapalam",     block: "Ottapalam",     district: "Palakkad",    state: "Kerala",        lat: 10.773, lon: 76.381, registered: false },
  // West Bengal
  { id: "murshidabad-beldanga", name: "Beldanga",    block: "Beldanga-I",    district: "Murshidabad", state: "West Bengal",   lat: 23.933, lon: 88.251, registered: false },
  { id: "nadia-ranaghat",   name: "Ranaghat",        block: "Ranaghat-I",    district: "Nadia",       state: "West Bengal",   lat: 23.175, lon: 88.557, registered: false },
  // Odisha
  { id: "cuttack-banki",    name: "Banki",           block: "Banki",         district: "Cuttack",     state: "Odisha",        lat: 20.382, lon: 85.531, registered: false },
  { id: "puri-delang",      name: "Delang",          block: "Delang",        district: "Puri",        state: "Odisha",        lat: 19.802, lon: 85.423, registered: false },
  // Bihar
  { id: "patna-phulwari",   name: "Phulwari Sharif", block: "Phulwari",      district: "Patna",       state: "Bihar",         lat: 25.551, lon: 85.112, registered: false },
  { id: "muzaffarpur-kanti",name: "Kanti",           block: "Kanti",         district: "Muzaffarpur", state: "Bihar",         lat: 26.271, lon: 85.423, registered: false },
  // Jharkhand
  { id: "ranchi-kanke",     name: "Kanke",           block: "Kanke",         district: "Ranchi",      state: "Jharkhand",     lat: 23.401, lon: 85.291, registered: false },
  // Assam
  { id: "kamrup-hajo",      name: "Hajo",            block: "Hajo",          district: "Kamrup",      state: "Assam",         lat: 26.245, lon: 91.531, registered: false },
  // Himachal Pradesh
  { id: "kangra-palampur",  name: "Palampur",        block: "Palampur",      district: "Kangra",      state: "Himachal Pradesh", lat: 32.112, lon: 76.538, registered: false },
  // Uttarakhand
  { id: "haridwar-roorki",  name: "Roorkee Rural",   block: "Roorkee",       district: "Haridwar",    state: "Uttarakhand",   lat: 29.867, lon: 77.894, registered: false },
  // Delhi NCR
  { id: "delhi-najafgarh",  name: "Najafgarh",       block: "Najafgarh",     district: "South West Delhi", state: "Delhi",   lat: 28.611, lon: 76.981, registered: false },
  // Chhattisgarh
  { id: "raipur-abhanpur",  name: "Abhanpur",        block: "Abhanpur",      district: "Raipur",      state: "Chhattisgarh",  lat: 21.027, lon: 81.768, registered: false },
  // Goa
  { id: "north-goa-calangute", name: "Calangute",    block: "Bardez",        district: "North Goa",   state: "Goa",           lat: 15.544, lon: 73.754, registered: false },
  // Manipur
  { id: "imphal-west-singda", name: "Singda",        block: "Singda",        district: "Imphal West", state: "Manipur",       lat: 24.807, lon: 93.912, registered: false },
];

/** Flat array of ALL panchayats — import this in the GPS hook */
export const ALL_PANCHAYATS: IndiaPanchayat[] = [
  ...THANJAVUR_PANCHAYATS,
  ...INDIA_PANCHAYATS,
];

/** Only the registered demo panchayats (Thanjavur 12) */
export const REGISTERED_PANCHAYATS = THANJAVUR_PANCHAYATS;
