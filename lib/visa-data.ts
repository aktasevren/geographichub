import fs from "node:fs";
import path from "node:path";

export type VisaStatus =
  | { kind: "same" }
  | { kind: "visa-free"; days?: number }
  | { kind: "visa-on-arrival" }
  | { kind: "e-visa" }
  | { kind: "eta" }
  | { kind: "visa-required" }
  | { kind: "no-admission" }
  | { kind: "unknown" };

export type VisaRow = {
  passport: string;
  destinations: Record<string, VisaStatus>;
};

let cached: { rows: Record<string, VisaRow>; destCodes: string[] } | null = null;

export function loadVisaMatrix() {
  if (cached) return cached;
  const csvPath = path.join(process.cwd(), "public", "data", "visa-matrix.csv");
  const text = fs.readFileSync(csvPath, "utf8");
  const lines = text.trim().split("\n");
  const header = lines[0].split(",");
  const destCodes = header.slice(1);
  const rows: Record<string, VisaRow> = {};
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(",");
    const passport = cells[0];
    const destinations: Record<string, VisaStatus> = {};
    for (let j = 0; j < destCodes.length; j++) {
      destinations[destCodes[j]] = parseCell(cells[j + 1] ?? "");
    }
    rows[passport] = { passport, destinations };
  }
  cached = { rows, destCodes };
  return cached;
}

function parseCell(raw: string): VisaStatus {
  const v = raw.trim();
  if (v === "-1" || v === "") return { kind: "same" };
  if (/^\d+$/.test(v)) return { kind: "visa-free", days: parseInt(v, 10) };
  const lower = v.toLowerCase();
  if (lower.startsWith("visa free")) return { kind: "visa-free" };
  if (lower === "visa on arrival") return { kind: "visa-on-arrival" };
  if (lower === "e-visa") return { kind: "e-visa" };
  if (lower === "eta") return { kind: "eta" };
  if (lower === "visa required") return { kind: "visa-required" };
  if (lower === "no admission") return { kind: "no-admission" };
  return { kind: "unknown" };
}

// Minimal ISO3 → English country name + slug mapping.
// Comprehensive enough for SEO page generation.
const COUNTRY_META: Record<string, { name: string; slug: string; demonym?: string }> = {
  AFG: { name: "Afghanistan", slug: "afghanistan", demonym: "Afghan" },
  ALB: { name: "Albania", slug: "albania", demonym: "Albanian" },
  DZA: { name: "Algeria", slug: "algeria", demonym: "Algerian" },
  AND: { name: "Andorra", slug: "andorra", demonym: "Andorran" },
  AGO: { name: "Angola", slug: "angola", demonym: "Angolan" },
  ATG: { name: "Antigua and Barbuda", slug: "antigua-and-barbuda", demonym: "Antiguan" },
  ARG: { name: "Argentina", slug: "argentina", demonym: "Argentine" },
  ARM: { name: "Armenia", slug: "armenia", demonym: "Armenian" },
  AUS: { name: "Australia", slug: "australia", demonym: "Australian" },
  AUT: { name: "Austria", slug: "austria", demonym: "Austrian" },
  AZE: { name: "Azerbaijan", slug: "azerbaijan", demonym: "Azerbaijani" },
  BHS: { name: "Bahamas", slug: "bahamas", demonym: "Bahamian" },
  BHR: { name: "Bahrain", slug: "bahrain", demonym: "Bahraini" },
  BGD: { name: "Bangladesh", slug: "bangladesh", demonym: "Bangladeshi" },
  BRB: { name: "Barbados", slug: "barbados", demonym: "Barbadian" },
  BLR: { name: "Belarus", slug: "belarus", demonym: "Belarusian" },
  BEL: { name: "Belgium", slug: "belgium", demonym: "Belgian" },
  BLZ: { name: "Belize", slug: "belize", demonym: "Belizean" },
  BEN: { name: "Benin", slug: "benin", demonym: "Beninese" },
  BTN: { name: "Bhutan", slug: "bhutan", demonym: "Bhutanese" },
  BOL: { name: "Bolivia", slug: "bolivia", demonym: "Bolivian" },
  BIH: { name: "Bosnia and Herzegovina", slug: "bosnia-and-herzegovina", demonym: "Bosnian" },
  BWA: { name: "Botswana", slug: "botswana", demonym: "Motswana" },
  BRA: { name: "Brazil", slug: "brazil", demonym: "Brazilian" },
  BRN: { name: "Brunei", slug: "brunei", demonym: "Bruneian" },
  BGR: { name: "Bulgaria", slug: "bulgaria", demonym: "Bulgarian" },
  BFA: { name: "Burkina Faso", slug: "burkina-faso", demonym: "Burkinabé" },
  BDI: { name: "Burundi", slug: "burundi", demonym: "Burundian" },
  KHM: { name: "Cambodia", slug: "cambodia", demonym: "Cambodian" },
  CMR: { name: "Cameroon", slug: "cameroon", demonym: "Cameroonian" },
  CAN: { name: "Canada", slug: "canada", demonym: "Canadian" },
  CPV: { name: "Cape Verde", slug: "cape-verde", demonym: "Cape Verdean" },
  CAF: { name: "Central African Republic", slug: "central-african-republic", demonym: "Central African" },
  TCD: { name: "Chad", slug: "chad", demonym: "Chadian" },
  CHL: { name: "Chile", slug: "chile", demonym: "Chilean" },
  CHN: { name: "China", slug: "china", demonym: "Chinese" },
  COL: { name: "Colombia", slug: "colombia", demonym: "Colombian" },
  COM: { name: "Comoros", slug: "comoros", demonym: "Comoran" },
  COG: { name: "Republic of the Congo", slug: "congo", demonym: "Congolese" },
  COD: { name: "DR Congo", slug: "dr-congo", demonym: "Congolese" },
  CRI: { name: "Costa Rica", slug: "costa-rica", demonym: "Costa Rican" },
  CIV: { name: "Ivory Coast", slug: "ivory-coast", demonym: "Ivorian" },
  HRV: { name: "Croatia", slug: "croatia", demonym: "Croatian" },
  CUB: { name: "Cuba", slug: "cuba", demonym: "Cuban" },
  CYP: { name: "Cyprus", slug: "cyprus", demonym: "Cypriot" },
  CZE: { name: "Czech Republic", slug: "czech-republic", demonym: "Czech" },
  DNK: { name: "Denmark", slug: "denmark", demonym: "Danish" },
  DJI: { name: "Djibouti", slug: "djibouti", demonym: "Djiboutian" },
  DMA: { name: "Dominica", slug: "dominica", demonym: "Dominican" },
  DOM: { name: "Dominican Republic", slug: "dominican-republic", demonym: "Dominican" },
  ECU: { name: "Ecuador", slug: "ecuador", demonym: "Ecuadorian" },
  EGY: { name: "Egypt", slug: "egypt", demonym: "Egyptian" },
  SLV: { name: "El Salvador", slug: "el-salvador", demonym: "Salvadoran" },
  GNQ: { name: "Equatorial Guinea", slug: "equatorial-guinea" },
  ERI: { name: "Eritrea", slug: "eritrea", demonym: "Eritrean" },
  EST: { name: "Estonia", slug: "estonia", demonym: "Estonian" },
  SWZ: { name: "Eswatini", slug: "eswatini" },
  ETH: { name: "Ethiopia", slug: "ethiopia", demonym: "Ethiopian" },
  FJI: { name: "Fiji", slug: "fiji", demonym: "Fijian" },
  FIN: { name: "Finland", slug: "finland", demonym: "Finnish" },
  FRA: { name: "France", slug: "france", demonym: "French" },
  GAB: { name: "Gabon", slug: "gabon", demonym: "Gabonese" },
  GMB: { name: "Gambia", slug: "gambia", demonym: "Gambian" },
  GEO: { name: "Georgia", slug: "georgia", demonym: "Georgian" },
  DEU: { name: "Germany", slug: "germany", demonym: "German" },
  GHA: { name: "Ghana", slug: "ghana", demonym: "Ghanaian" },
  GRC: { name: "Greece", slug: "greece", demonym: "Greek" },
  GRD: { name: "Grenada", slug: "grenada", demonym: "Grenadian" },
  GTM: { name: "Guatemala", slug: "guatemala", demonym: "Guatemalan" },
  GIN: { name: "Guinea", slug: "guinea", demonym: "Guinean" },
  GNB: { name: "Guinea-Bissau", slug: "guinea-bissau" },
  GUY: { name: "Guyana", slug: "guyana", demonym: "Guyanese" },
  HTI: { name: "Haiti", slug: "haiti", demonym: "Haitian" },
  HND: { name: "Honduras", slug: "honduras", demonym: "Honduran" },
  HKG: { name: "Hong Kong", slug: "hong-kong" },
  HUN: { name: "Hungary", slug: "hungary", demonym: "Hungarian" },
  ISL: { name: "Iceland", slug: "iceland", demonym: "Icelandic" },
  IND: { name: "India", slug: "india", demonym: "Indian" },
  IDN: { name: "Indonesia", slug: "indonesia", demonym: "Indonesian" },
  IRN: { name: "Iran", slug: "iran", demonym: "Iranian" },
  IRQ: { name: "Iraq", slug: "iraq", demonym: "Iraqi" },
  IRL: { name: "Ireland", slug: "ireland", demonym: "Irish" },
  ISR: { name: "Israel", slug: "israel", demonym: "Israeli" },
  ITA: { name: "Italy", slug: "italy", demonym: "Italian" },
  JAM: { name: "Jamaica", slug: "jamaica", demonym: "Jamaican" },
  JPN: { name: "Japan", slug: "japan", demonym: "Japanese" },
  JOR: { name: "Jordan", slug: "jordan", demonym: "Jordanian" },
  KAZ: { name: "Kazakhstan", slug: "kazakhstan", demonym: "Kazakh" },
  KEN: { name: "Kenya", slug: "kenya", demonym: "Kenyan" },
  KIR: { name: "Kiribati", slug: "kiribati" },
  XKX: { name: "Kosovo", slug: "kosovo", demonym: "Kosovar" },
  KWT: { name: "Kuwait", slug: "kuwait", demonym: "Kuwaiti" },
  KGZ: { name: "Kyrgyzstan", slug: "kyrgyzstan" },
  LAO: { name: "Laos", slug: "laos", demonym: "Laotian" },
  LVA: { name: "Latvia", slug: "latvia", demonym: "Latvian" },
  LBN: { name: "Lebanon", slug: "lebanon", demonym: "Lebanese" },
  LSO: { name: "Lesotho", slug: "lesotho" },
  LBR: { name: "Liberia", slug: "liberia", demonym: "Liberian" },
  LBY: { name: "Libya", slug: "libya", demonym: "Libyan" },
  LIE: { name: "Liechtenstein", slug: "liechtenstein" },
  LTU: { name: "Lithuania", slug: "lithuania", demonym: "Lithuanian" },
  LUX: { name: "Luxembourg", slug: "luxembourg" },
  MAC: { name: "Macau", slug: "macau" },
  MDG: { name: "Madagascar", slug: "madagascar", demonym: "Malagasy" },
  MWI: { name: "Malawi", slug: "malawi", demonym: "Malawian" },
  MYS: { name: "Malaysia", slug: "malaysia", demonym: "Malaysian" },
  MDV: { name: "Maldives", slug: "maldives" },
  MLI: { name: "Mali", slug: "mali", demonym: "Malian" },
  MLT: { name: "Malta", slug: "malta", demonym: "Maltese" },
  MHL: { name: "Marshall Islands", slug: "marshall-islands" },
  MRT: { name: "Mauritania", slug: "mauritania" },
  MUS: { name: "Mauritius", slug: "mauritius" },
  MEX: { name: "Mexico", slug: "mexico", demonym: "Mexican" },
  FSM: { name: "Micronesia", slug: "micronesia" },
  MDA: { name: "Moldova", slug: "moldova", demonym: "Moldovan" },
  MCO: { name: "Monaco", slug: "monaco" },
  MNG: { name: "Mongolia", slug: "mongolia", demonym: "Mongolian" },
  MNE: { name: "Montenegro", slug: "montenegro" },
  MAR: { name: "Morocco", slug: "morocco", demonym: "Moroccan" },
  MOZ: { name: "Mozambique", slug: "mozambique" },
  MMR: { name: "Myanmar", slug: "myanmar" },
  NAM: { name: "Namibia", slug: "namibia", demonym: "Namibian" },
  NRU: { name: "Nauru", slug: "nauru" },
  NPL: { name: "Nepal", slug: "nepal", demonym: "Nepali" },
  NLD: { name: "Netherlands", slug: "netherlands", demonym: "Dutch" },
  NZL: { name: "New Zealand", slug: "new-zealand" },
  NIC: { name: "Nicaragua", slug: "nicaragua", demonym: "Nicaraguan" },
  NER: { name: "Niger", slug: "niger" },
  NGA: { name: "Nigeria", slug: "nigeria", demonym: "Nigerian" },
  PRK: { name: "North Korea", slug: "north-korea" },
  MKD: { name: "North Macedonia", slug: "north-macedonia" },
  NOR: { name: "Norway", slug: "norway", demonym: "Norwegian" },
  OMN: { name: "Oman", slug: "oman", demonym: "Omani" },
  PAK: { name: "Pakistan", slug: "pakistan", demonym: "Pakistani" },
  PLW: { name: "Palau", slug: "palau" },
  PSE: { name: "Palestine", slug: "palestine", demonym: "Palestinian" },
  PAN: { name: "Panama", slug: "panama", demonym: "Panamanian" },
  PNG: { name: "Papua New Guinea", slug: "papua-new-guinea" },
  PRY: { name: "Paraguay", slug: "paraguay", demonym: "Paraguayan" },
  PER: { name: "Peru", slug: "peru", demonym: "Peruvian" },
  PHL: { name: "Philippines", slug: "philippines", demonym: "Filipino" },
  POL: { name: "Poland", slug: "poland", demonym: "Polish" },
  PRT: { name: "Portugal", slug: "portugal", demonym: "Portuguese" },
  QAT: { name: "Qatar", slug: "qatar", demonym: "Qatari" },
  ROU: { name: "Romania", slug: "romania", demonym: "Romanian" },
  RUS: { name: "Russia", slug: "russia", demonym: "Russian" },
  RWA: { name: "Rwanda", slug: "rwanda", demonym: "Rwandan" },
  KNA: { name: "Saint Kitts and Nevis", slug: "saint-kitts-and-nevis" },
  LCA: { name: "Saint Lucia", slug: "saint-lucia" },
  VCT: { name: "Saint Vincent and the Grenadines", slug: "saint-vincent" },
  WSM: { name: "Samoa", slug: "samoa" },
  SMR: { name: "San Marino", slug: "san-marino" },
  STP: { name: "São Tomé and Príncipe", slug: "sao-tome" },
  SAU: { name: "Saudi Arabia", slug: "saudi-arabia", demonym: "Saudi" },
  SEN: { name: "Senegal", slug: "senegal", demonym: "Senegalese" },
  SRB: { name: "Serbia", slug: "serbia", demonym: "Serbian" },
  SYC: { name: "Seychelles", slug: "seychelles" },
  SLE: { name: "Sierra Leone", slug: "sierra-leone" },
  SGP: { name: "Singapore", slug: "singapore", demonym: "Singaporean" },
  SVK: { name: "Slovakia", slug: "slovakia", demonym: "Slovak" },
  SVN: { name: "Slovenia", slug: "slovenia", demonym: "Slovenian" },
  SLB: { name: "Solomon Islands", slug: "solomon-islands" },
  SOM: { name: "Somalia", slug: "somalia", demonym: "Somali" },
  ZAF: { name: "South Africa", slug: "south-africa" },
  KOR: { name: "South Korea", slug: "south-korea" },
  SSD: { name: "South Sudan", slug: "south-sudan" },
  ESP: { name: "Spain", slug: "spain", demonym: "Spanish" },
  LKA: { name: "Sri Lanka", slug: "sri-lanka", demonym: "Sri Lankan" },
  SDN: { name: "Sudan", slug: "sudan", demonym: "Sudanese" },
  SUR: { name: "Suriname", slug: "suriname" },
  SWE: { name: "Sweden", slug: "sweden", demonym: "Swedish" },
  CHE: { name: "Switzerland", slug: "switzerland", demonym: "Swiss" },
  SYR: { name: "Syria", slug: "syria", demonym: "Syrian" },
  TWN: { name: "Taiwan", slug: "taiwan", demonym: "Taiwanese" },
  TJK: { name: "Tajikistan", slug: "tajikistan" },
  TZA: { name: "Tanzania", slug: "tanzania", demonym: "Tanzanian" },
  THA: { name: "Thailand", slug: "thailand", demonym: "Thai" },
  TLS: { name: "Timor-Leste", slug: "timor-leste" },
  TGO: { name: "Togo", slug: "togo" },
  TON: { name: "Tonga", slug: "tonga" },
  TTO: { name: "Trinidad and Tobago", slug: "trinidad-and-tobago" },
  TUN: { name: "Tunisia", slug: "tunisia", demonym: "Tunisian" },
  TUR: { name: "Turkey", slug: "turkey", demonym: "Turkish" },
  TKM: { name: "Turkmenistan", slug: "turkmenistan" },
  TUV: { name: "Tuvalu", slug: "tuvalu" },
  UGA: { name: "Uganda", slug: "uganda", demonym: "Ugandan" },
  UKR: { name: "Ukraine", slug: "ukraine", demonym: "Ukrainian" },
  ARE: { name: "United Arab Emirates", slug: "uae", demonym: "Emirati" },
  GBR: { name: "United Kingdom", slug: "united-kingdom", demonym: "British" },
  USA: { name: "United States", slug: "united-states", demonym: "American" },
  URY: { name: "Uruguay", slug: "uruguay", demonym: "Uruguayan" },
  UZB: { name: "Uzbekistan", slug: "uzbekistan", demonym: "Uzbek" },
  VUT: { name: "Vanuatu", slug: "vanuatu" },
  VAT: { name: "Vatican City", slug: "vatican-city" },
  VEN: { name: "Venezuela", slug: "venezuela", demonym: "Venezuelan" },
  VNM: { name: "Vietnam", slug: "vietnam", demonym: "Vietnamese" },
  YEM: { name: "Yemen", slug: "yemen", demonym: "Yemeni" },
  ZMB: { name: "Zambia", slug: "zambia", demonym: "Zambian" },
  ZWE: { name: "Zimbabwe", slug: "zimbabwe", demonym: "Zimbabwean" },
};

export function getCountryMeta(iso3: string) {
  return COUNTRY_META[iso3] || { name: iso3, slug: iso3.toLowerCase() };
}

export function allPassports() {
  return Object.keys(COUNTRY_META);
}

export function slugToIso(slug: string): string | null {
  for (const [iso, meta] of Object.entries(COUNTRY_META)) {
    if (meta.slug === slug) return iso;
  }
  return null;
}

export function groupByStatus(row: VisaRow | undefined) {
  const groups: Record<string, { iso: string; name: string; days?: number }[]> = {
    "visa-free": [],
    "visa-on-arrival": [],
    "e-visa": [],
    "eta": [],
    "visa-required": [],
    "no-admission": [],
  };
  if (!row) return groups;
  for (const [iso, status] of Object.entries(row.destinations)) {
    if (status.kind === "same" || status.kind === "unknown") continue;
    const meta = COUNTRY_META[iso];
    if (!meta) continue;
    const entry = {
      iso,
      name: meta.name,
      days: status.kind === "visa-free" ? status.days : undefined,
    };
    groups[status.kind].push(entry);
  }
  for (const k of Object.keys(groups)) {
    groups[k].sort((a, b) => a.name.localeCompare(b.name));
  }
  return groups;
}
