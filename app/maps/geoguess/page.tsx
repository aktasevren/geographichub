"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SiteLogo from "@/components/SiteLogo";
import { LocaleToggle, useLocale } from "@/components/LocaleProvider";
import ShareButton from "@/components/ShareButton";

const COUNTRIES_URL =
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson";
const WP = "https://en.wikipedia.org";

type Landmark = {
  id: string;
  wiki: string;
  name: { tr: string; en: string };
  country: { tr: string; en: string };
  lat: number;
  lng: number;
};

// Curated landmarks — each has a reliable Wikipedia page with a lead image
const LANDMARKS: Landmark[] = [
  { id: "eiffel", wiki: "Eiffel_Tower", name: { tr: "Eyfel Kulesi", en: "Eiffel Tower" }, country: { tr: "Fransa", en: "France" }, lat: 48.8584, lng: 2.2945 },
  { id: "colosseum", wiki: "Colosseum", name: { tr: "Kolezyum", en: "Colosseum" }, country: { tr: "İtalya", en: "Italy" }, lat: 41.8902, lng: 12.4922 },
  { id: "bigben", wiki: "Big_Ben", name: { tr: "Big Ben", en: "Big Ben" }, country: { tr: "Birleşik Krallık", en: "United Kingdom" }, lat: 51.5007, lng: -0.1246 },
  { id: "brandenburg", wiki: "Brandenburg_Gate", name: { tr: "Brandenburg Kapısı", en: "Brandenburg Gate" }, country: { tr: "Almanya", en: "Germany" }, lat: 52.5163, lng: 13.3777 },
  { id: "sagrada", wiki: "Sagrada_Família", name: { tr: "Sagrada Família", en: "Sagrada Família" }, country: { tr: "İspanya", en: "Spain" }, lat: 41.4036, lng: 2.1744 },
  { id: "acropolis", wiki: "Acropolis_of_Athens", name: { tr: "Akropolis", en: "Acropolis of Athens" }, country: { tr: "Yunanistan", en: "Greece" }, lat: 37.9715, lng: 23.7257 },
  { id: "stonehenge", wiki: "Stonehenge", name: { tr: "Stonehenge", en: "Stonehenge" }, country: { tr: "Birleşik Krallık", en: "United Kingdom" }, lat: 51.1789, lng: -1.8262 },
  { id: "neuschwanstein", wiki: "Neuschwanstein_Castle", name: { tr: "Neuschwanstein Şatosu", en: "Neuschwanstein Castle" }, country: { tr: "Almanya", en: "Germany" }, lat: 47.5576, lng: 10.7498 },
  { id: "anitkabir", wiki: "Anıtkabir", name: { tr: "Anıtkabir", en: "Anıtkabir" }, country: { tr: "Türkiye", en: "Turkey" }, lat: 39.9255, lng: 32.8378 },
  { id: "hagiasophia", wiki: "Hagia_Sophia", name: { tr: "Ayasofya", en: "Hagia Sophia" }, country: { tr: "Türkiye", en: "Turkey" }, lat: 41.0086, lng: 28.9802 },
  { id: "kizkulesi", wiki: "Maiden's_Tower", name: { tr: "Kız Kulesi", en: "Maiden's Tower" }, country: { tr: "Türkiye", en: "Turkey" }, lat: 41.0211, lng: 29.0041 },
  { id: "sultanahmet", wiki: "Sultan_Ahmed_Mosque", name: { tr: "Sultanahmet Camii", en: "Blue Mosque" }, country: { tr: "Türkiye", en: "Turkey" }, lat: 41.0054, lng: 28.9768 },
  { id: "pisa", wiki: "Leaning_Tower_of_Pisa", name: { tr: "Pisa Kulesi", en: "Leaning Tower of Pisa" }, country: { tr: "İtalya", en: "Italy" }, lat: 43.7230, lng: 10.3966 },
  { id: "trevi", wiki: "Trevi_Fountain", name: { tr: "Trevi Çeşmesi", en: "Trevi Fountain" }, country: { tr: "İtalya", en: "Italy" }, lat: 41.9009, lng: 12.4833 },
  { id: "buckingham", wiki: "Buckingham_Palace", name: { tr: "Buckingham Sarayı", en: "Buckingham Palace" }, country: { tr: "Birleşik Krallık", en: "United Kingdom" }, lat: 51.5014, lng: -0.1419 },
  { id: "louvre", wiki: "Louvre_Pyramid", name: { tr: "Louvre Piramidi", en: "Louvre Pyramid" }, country: { tr: "Fransa", en: "France" }, lat: 48.8611, lng: 2.3364 },
  { id: "sacrecoeur", wiki: "Sacré-Cœur,_Paris", name: { tr: "Sacré-Cœur", en: "Sacré-Cœur" }, country: { tr: "Fransa", en: "France" }, lat: 48.8867, lng: 2.3431 },
  { id: "kremlin", wiki: "Moscow_Kremlin", name: { tr: "Kremlin", en: "Moscow Kremlin" }, country: { tr: "Rusya", en: "Russia" }, lat: 55.7520, lng: 37.6175 },
  { id: "stbasil", wiki: "Saint_Basil's_Cathedral", name: { tr: "Aziz Vasil Katedrali", en: "Saint Basil's Cathedral" }, country: { tr: "Rusya", en: "Russia" }, lat: 55.7525, lng: 37.6231 },
  { id: "hermitage", wiki: "Hermitage_Museum", name: { tr: "Hermitage Müzesi", en: "Hermitage Museum" }, country: { tr: "Rusya", en: "Russia" }, lat: 59.9398, lng: 30.3146 },
  { id: "santorini", wiki: "Santorini", name: { tr: "Santorini", en: "Santorini" }, country: { tr: "Yunanistan", en: "Greece" }, lat: 36.3932, lng: 25.4615 },
  { id: "pragacastle", wiki: "Prague_Castle", name: { tr: "Prag Kalesi", en: "Prague Castle" }, country: { tr: "Çekya", en: "Czechia" }, lat: 50.0901, lng: 14.4001 },
  { id: "charlesbridge", wiki: "Charles_Bridge", name: { tr: "Charles Köprüsü", en: "Charles Bridge" }, country: { tr: "Çekya", en: "Czechia" }, lat: 50.0865, lng: 14.4114 },
  { id: "atomium", wiki: "Atomium", name: { tr: "Atomium", en: "Atomium" }, country: { tr: "Belçika", en: "Belgium" }, lat: 50.8949, lng: 4.3416 },
  { id: "statueliberty", wiki: "Statue_of_Liberty", name: { tr: "Özgürlük Heykeli", en: "Statue of Liberty" }, country: { tr: "ABD", en: "USA" }, lat: 40.6892, lng: -74.0445 },
  { id: "goldengate", wiki: "Golden_Gate_Bridge", name: { tr: "Golden Gate Köprüsü", en: "Golden Gate Bridge" }, country: { tr: "ABD", en: "USA" }, lat: 37.8199, lng: -122.4783 },
  { id: "hollywood", wiki: "Hollywood_Sign", name: { tr: "Hollywood Tabelası", en: "Hollywood Sign" }, country: { tr: "ABD", en: "USA" }, lat: 34.1341, lng: -118.3215 },
  { id: "rushmore", wiki: "Mount_Rushmore", name: { tr: "Rushmore Dağı", en: "Mount Rushmore" }, country: { tr: "ABD", en: "USA" }, lat: 43.8791, lng: -103.4591 },
  { id: "grandcanyon", wiki: "Grand_Canyon", name: { tr: "Büyük Kanyon", en: "Grand Canyon" }, country: { tr: "ABD", en: "USA" }, lat: 36.1069, lng: -112.1129 },
  { id: "niagara", wiki: "Niagara_Falls", name: { tr: "Niyagara Şelalesi", en: "Niagara Falls" }, country: { tr: "Kanada/ABD", en: "Canada/USA" }, lat: 43.0962, lng: -79.0377 },
  { id: "cntower", wiki: "CN_Tower", name: { tr: "CN Kulesi", en: "CN Tower" }, country: { tr: "Kanada", en: "Canada" }, lat: 43.6426, lng: -79.3871 },
  { id: "christredeemer", wiki: "Christ_the_Redeemer_(statue)", name: { tr: "Kurtarıcı İsa Heykeli", en: "Christ the Redeemer" }, country: { tr: "Brezilya", en: "Brazil" }, lat: -22.9519, lng: -43.2105 },
  { id: "machu", wiki: "Machu_Picchu", name: { tr: "Machu Picchu", en: "Machu Picchu" }, country: { tr: "Peru", en: "Peru" }, lat: -13.1631, lng: -72.5450 },
  { id: "chichen", wiki: "Chichen_Itza", name: { tr: "Chichén Itzá", en: "Chichen Itza" }, country: { tr: "Meksika", en: "Mexico" }, lat: 20.6843, lng: -88.5678 },
  { id: "moai", wiki: "Moai", name: { tr: "Moai Heykelleri", en: "Moai (Easter Island)" }, country: { tr: "Şili", en: "Chile" }, lat: -27.1127, lng: -109.3497 },
  { id: "iguazu", wiki: "Iguazu_Falls", name: { tr: "Iguazu Şelaleleri", en: "Iguazu Falls" }, country: { tr: "Arjantin/Brezilya", en: "Argentina/Brazil" }, lat: -25.6953, lng: -54.4367 },
  { id: "teatrocolon", wiki: "Teatro_Colón", name: { tr: "Teatro Colón", en: "Teatro Colón" }, country: { tr: "Arjantin", en: "Argentina" }, lat: -34.6010, lng: -58.3830 },
  { id: "tajmahal", wiki: "Taj_Mahal", name: { tr: "Tac Mahal", en: "Taj Mahal" }, country: { tr: "Hindistan", en: "India" }, lat: 27.1751, lng: 78.0421 },
  { id: "greatwall", wiki: "Great_Wall_of_China", name: { tr: "Çin Seddi", en: "Great Wall of China" }, country: { tr: "Çin", en: "China" }, lat: 40.4319, lng: 116.5704 },
  { id: "forbidden", wiki: "Forbidden_City", name: { tr: "Yasak Şehir", en: "Forbidden City" }, country: { tr: "Çin", en: "China" }, lat: 39.9163, lng: 116.3972 },
  { id: "fuji", wiki: "Mount_Fuji", name: { tr: "Fuji Dağı", en: "Mount Fuji" }, country: { tr: "Japonya", en: "Japan" }, lat: 35.3606, lng: 138.7274 },
  { id: "shibuya", wiki: "Shibuya_Crossing", name: { tr: "Shibuya Kavşağı", en: "Shibuya Crossing" }, country: { tr: "Japonya", en: "Japan" }, lat: 35.6595, lng: 139.7005 },
  { id: "senso", wiki: "Sensō-ji", name: { tr: "Sensō-ji Tapınağı", en: "Sensō-ji" }, country: { tr: "Japonya", en: "Japan" }, lat: 35.7148, lng: 139.7967 },
  { id: "angkor", wiki: "Angkor_Wat", name: { tr: "Angkor Wat", en: "Angkor Wat" }, country: { tr: "Kamboçya", en: "Cambodia" }, lat: 13.4125, lng: 103.8670 },
  { id: "burjkhalifa", wiki: "Burj_Khalifa", name: { tr: "Burç Halife", en: "Burj Khalifa" }, country: { tr: "BAE", en: "UAE" }, lat: 25.1972, lng: 55.2744 },
  { id: "petra", wiki: "Petra", name: { tr: "Petra", en: "Petra" }, country: { tr: "Ürdün", en: "Jordan" }, lat: 30.3285, lng: 35.4444 },
  { id: "marinabay", wiki: "Marina_Bay_Sands", name: { tr: "Marina Bay Sands", en: "Marina Bay Sands" }, country: { tr: "Singapur", en: "Singapore" }, lat: 1.2834, lng: 103.8607 },
  { id: "pyramids", wiki: "Great_Pyramid_of_Giza", name: { tr: "Giza Piramitleri", en: "Pyramids of Giza" }, country: { tr: "Mısır", en: "Egypt" }, lat: 29.9792, lng: 31.1342 },
  { id: "sphinx", wiki: "Great_Sphinx_of_Giza", name: { tr: "Giza Sfenksi", en: "Great Sphinx of Giza" }, country: { tr: "Mısır", en: "Egypt" }, lat: 29.9753, lng: 31.1376 },
  { id: "kilimanjaro", wiki: "Mount_Kilimanjaro", name: { tr: "Kilimanjaro Dağı", en: "Mount Kilimanjaro" }, country: { tr: "Tanzanya", en: "Tanzania" }, lat: -3.0674, lng: 37.3556 },
  { id: "tablemt", wiki: "Table_Mountain", name: { tr: "Tepe Dağı", en: "Table Mountain" }, country: { tr: "Güney Afrika", en: "South Africa" }, lat: -33.9628, lng: 18.4098 },
  { id: "victoria", wiki: "Victoria_Falls", name: { tr: "Victoria Şelalesi", en: "Victoria Falls" }, country: { tr: "Zambiya/Zimbabve", en: "Zambia/Zimbabwe" }, lat: -17.9243, lng: 25.8572 },
  { id: "sydneyopera", wiki: "Sydney_Opera_House", name: { tr: "Sidney Opera Binası", en: "Sydney Opera House" }, country: { tr: "Avustralya", en: "Australia" }, lat: -33.8568, lng: 151.2153 },
  { id: "uluru", wiki: "Uluru", name: { tr: "Uluru", en: "Uluru" }, country: { tr: "Avustralya", en: "Australia" }, lat: -25.3444, lng: 131.0369 },
  { id: "skytower", wiki: "Sky_Tower_(Auckland)", name: { tr: "Sky Tower", en: "Sky Tower" }, country: { tr: "Yeni Zelanda", en: "New Zealand" }, lat: -36.8485, lng: 174.7625 },
];

function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

// GeoGuessr-ish score: 5000 * exp(-d/2000)
function scoreFor(distKm: number): number {
  return Math.max(0, Math.round(5000 * Math.exp(-distKm / 2000)));
}

function project(lat: number, lng: number, w: number, h: number) {
  return [((lng + 180) / 360) * w, ((90 - lat) / 180) * h];
}
function unproject(x: number, y: number, w: number, h: number): [number, number] {
  const lng = (x / w) * 360 - 180;
  const lat = 90 - (y / h) * 180;
  return [lat, lng];
}
function ringToPath(ring: number[][], w: number, h: number) {
  return (
    ring
      .map(([lng, lat], i) => {
        const [x, y] = project(lat, lng, w, h);
        return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ") + " Z"
  );
}
function geomToPath(geom: any, w: number, h: number): string {
  if (!geom) return "";
  if (geom.type === "Polygon")
    return geom.coordinates.map((r: number[][]) => ringToPath(r, w, h)).join(" ");
  if (geom.type === "MultiPolygon")
    return geom.coordinates
      .flatMap((p: number[][][]) => p.map((r) => ringToPath(r, w, h)))
      .join(" ");
  return "";
}

const ROUND_COUNT = 5;

type Round = {
  landmark: Landmark;
  imageUrl: string | null;
  guess: [number, number] | null;
  submitted: boolean;
  distanceKm: number;
  score: number;
};

export default function GeoGuessPage() {
  const { t, locale } = useLocale();
  const [features, setFeatures] = useState<any[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [imgLoading, setImgLoading] = useState(false);
  const [w, setW] = useState(1000);
  const [zoom, setZoom] = useState({ scale: 1, cx: 0.5, cy: 0.5 });
  const [dragging, setDragging] = useState(false);
  const [didDrag, setDidDrag] = useState(false);
  const [best, setBest] = useState<number | null>(null);
  const dragStart = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(COUNTRIES_URL).then((r) => r.json()).then((d) => setFeatures(d.features || []));
  }, []);

  useEffect(() => {
    const onR = () => containerRef.current && setW(containerRef.current.clientWidth);
    onR();
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);

  useEffect(() => {
    try {
      const v = localStorage.getItem("geoguess-best");
      if (v) setBest(parseInt(v, 10));
    } catch {}
  }, []);

  const h = w * 0.5;

  const startNewGame = () => {
    const shuffled = [...LANDMARKS].sort(() => Math.random() - 0.5).slice(0, ROUND_COUNT);
    const newRounds: Round[] = shuffled.map((l) => ({
      landmark: l,
      imageUrl: null,
      guess: null,
      submitted: false,
      distanceKm: 0,
      score: 0,
    }));
    setRounds(newRounds);
    setRoundIdx(0);
    setZoom({ scale: 1, cx: 0.5, cy: 0.5 });
  };

  const current = rounds[roundIdx];

  // Fetch image for current round
  useEffect(() => {
    if (!current || current.imageUrl) return;
    let cancelled = false;
    setImgLoading(true);
    (async () => {
      try {
        const r = await fetch(
          `${WP}/api/rest_v1/page/summary/${encodeURIComponent(current.landmark.wiki)}`
        );
        const d = await r.json();
        const url: string | null =
          d?.originalimage?.source || d?.thumbnail?.source || null;
        if (!cancelled) {
          setRounds((prev) =>
            prev.map((x, i) => (i === roundIdx ? { ...x, imageUrl: url } : x))
          );
        }
      } catch {}
      if (!cancelled) setImgLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [roundIdx, current?.landmark.wiki]);

  // Drag handlers
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const ds = dragStart.current;
      const el = containerRef.current;
      if (!ds || !el) return;
      const rect = el.getBoundingClientRect();
      const dx = (e.clientX - ds.x) / rect.width / zoom.scale;
      const dy = (e.clientY - ds.y) / rect.height / zoom.scale;
      const mag = Math.abs(e.clientX - ds.x) + Math.abs(e.clientY - ds.y);
      if (mag > 4) setDidDrag(true);
      setZoom((z) => ({
        ...z,
        cx: Math.max(0, Math.min(1, ds.cx - dx)),
        cy: Math.max(0, Math.min(1, ds.cy - dy)),
      }));
    };
    const onUp = () => {
      setDragging(false);
      dragStart.current = null;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, zoom.scale]);

  // Wheel zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      setZoom((z) => {
        const factor = e.deltaY > 0 ? 1 / 1.18 : 1.18;
        const next = Math.max(1, Math.min(8, z.scale * factor));
        if (next === z.scale) return z;
        return {
          scale: next,
          cx: Math.max(0, Math.min(1, z.cx + (px - z.cx) * (1 - z.scale / next))),
          cy: Math.max(0, Math.min(1, z.cy + (py - z.cy) * (1 - z.scale / next))),
        };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel as any);
  }, [rounds.length]);

  // Click-to-guess on SVG
  const onMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (didDrag) {
      setDidDrag(false);
      return;
    }
    if (!current || current.submitted) return;
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const { x, y } = pt.matrixTransform(ctm.inverse());
    // Account for outer scale transform
    const gx = (x - zoom.cx * w) / zoom.scale + zoom.cx * w;
    const gy = (y - zoom.cy * h) / zoom.scale + zoom.cy * h;
    const [lat, lng] = unproject(gx, gy, w, h);
    setRounds((prev) =>
      prev.map((r, i) => (i === roundIdx ? { ...r, guess: [lat, lng] } : r))
    );
  };

  const submit = () => {
    if (!current || !current.guess || current.submitted) return;
    const dist = haversineKm(current.guess, [current.landmark.lat, current.landmark.lng]);
    const s = scoreFor(dist);
    setRounds((prev) =>
      prev.map((r, i) =>
        i === roundIdx ? { ...r, submitted: true, distanceKm: dist, score: s } : r
      )
    );
  };

  const nextRound = () => {
    if (roundIdx < ROUND_COUNT - 1) {
      setRoundIdx(roundIdx + 1);
      setZoom({ scale: 1, cx: 0.5, cy: 0.5 });
    }
  };

  const totalScore = useMemo(
    () => rounds.filter((r) => r.submitted).reduce((a, r) => a + r.score, 0),
    [rounds]
  );

  const allDone = rounds.length > 0 && rounds.every((r) => r.submitted);
  const newRecord = allDone && (best === null || totalScore > best);

  useEffect(() => {
    if (!allDone) return;
    try {
      if (best === null || totalScore > best) {
        localStorage.setItem("geoguess-best", String(totalScore));
        setBest(totalScore);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone]);

  // Pin positions
  const guessXY = current?.guess ? project(current.guess[0], current.guess[1], w, h) : null;
  const actualXY =
    current?.submitted
      ? project(current.landmark.lat, current.landmark.lng, w, h)
      : null;

  return (
    <div className="min-h-screen grain">
      <header className="hair-b">
        <div className="flex justify-between items-center px-5 md:px-10 py-3.5 md:py-4">
          <SiteLogo theme="light" />
          <LocaleToggle theme="light" />
        </div>
        <div className="px-5 md:px-10 py-2.5 hair-b">
          <ol className="flex items-center gap-x-1.5 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
            <li>
              <a href="/" className="hover:text-[var(--text)]">
                {t("common.home")}
              </a>
            </li>
            <li>/</li>
            <li className="text-[var(--text-2)]">
              {locale === "tr" ? "Neredeyim" : "GeoGuess"}
            </li>
          </ol>
        </div>
      </header>

      <section className="px-5 md:px-10 pt-8 md:pt-12 pb-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--muted)] mb-3">
            {locale === "tr" ? "§ Fotoğraftan yer tahmin et" : "§ Guess the location from photo"}
          </div>
          <h1 className="font-serif font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[0.98] tracking-tight">
            {locale === "tr" ? "Nere" : "Where"}
            <span className="italic" style={{ color: "var(--accent)" }}>
              {locale === "tr" ? "deyim?" : "?"}
            </span>
          </h1>
          <p className="mt-3 text-[14px] md:text-[16px] text-[var(--text-2)] max-w-2xl">
            {locale === "tr"
              ? "5 tur, toplam 25 000 puan. Her turda bir fotoğraf — haritaya tıkla, nerede olduğunu tahmin et. Ne kadar yakınsan, o kadar çok puan."
              : "5 rounds, 25 000 points. Each round a photo — click the map to guess where it is. The closer, the more points."}
          </p>
          {best !== null && (
            <div className="mt-4 inline-block font-mono text-[11px] uppercase tracking-[0.22em] px-3 py-1.5 rounded-full border border-[var(--line-2)] bg-[var(--line)]">
              {locale === "tr" ? "Rekor" : "Best"}:{" "}
              <span className="text-[var(--accent)] tabular-nums">{best.toLocaleString()}</span>
            </div>
          )}
        </div>
      </section>

      {rounds.length === 0 && (
        <section className="px-5 md:px-10 pb-12">
          <div className="max-w-[1200px] mx-auto">
            <div className="rounded-2xl border border-dashed border-[var(--line-2)] p-8 md:p-16 text-center">
              <div className="text-6xl mb-4">🌍</div>
              <p className="font-serif text-xl md:text-2xl text-[var(--text-2)] italic max-w-xl mx-auto">
                {locale === "tr"
                  ? "50 ikonik yerden 5'i rastgele — bakalım dünyayı ne kadar biliyorsun?"
                  : "5 random landmarks out of 50 — how well do you know the world?"}
              </p>
              <button
                onClick={startNewGame}
                className="mt-8 px-8 py-3 rounded-full font-mono text-[12px] uppercase tracking-[0.25em] bg-[var(--accent)] text-black hover:opacity-90"
              >
                {locale === "tr" ? "Oyunu başlat" : "Start game"}
              </button>
            </div>
          </div>
        </section>
      )}

      {rounds.length > 0 && (
        <section className="px-5 md:px-10 pb-12">
          <div className="max-w-[1500px] mx-auto">
            {/* Score bar */}
            <div className="mb-4 flex items-center gap-3 flex-wrap">
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
                {locale === "tr" ? "Tur" : "Round"}{" "}
                <span className="text-[var(--text)] tabular-nums">
                  {roundIdx + 1}/{ROUND_COUNT}
                </span>
              </div>
              <div className="flex-1 flex gap-1">
                {rounds.map((r, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition ${
                      i === roundIdx
                        ? "bg-[var(--accent)]"
                        : r.submitted
                        ? "bg-emerald-500/60"
                        : "bg-[var(--line)]"
                    }`}
                  />
                ))}
              </div>
              <div className="font-mono text-[11px] uppercase tracking-[0.22em]">
                {locale === "tr" ? "Toplam" : "Total"}:{" "}
                <span className="text-[var(--accent)] tabular-nums font-semibold">
                  {totalScore.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Photo */}
            <div className="mb-4 rounded-2xl overflow-hidden border border-[var(--line-2)] bg-black relative" style={{ aspectRatio: "16 / 9", maxHeight: "52vh" }}>
              {current?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={current.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/40 font-mono text-[11px] uppercase tracking-[0.22em]">
                  {imgLoading ? (locale === "tr" ? "Fotoğraf yükleniyor…" : "Loading photo…") : "…"}
                </div>
              )}
              {current?.submitted && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 md:p-5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-300">
                    {locale === "tr" ? "Cevap" : "Answer"}
                  </div>
                  <div className="font-serif text-2xl md:text-3xl text-white mt-1">
                    {current.landmark.name[locale === "tr" ? "tr" : "en"]}
                    <span className="text-white/60 text-lg md:text-xl font-light ml-2">
                      · {current.landmark.country[locale === "tr" ? "tr" : "en"]}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Result banner */}
            {current?.submitted && (
              <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-[var(--line-2)] bg-[var(--line)] p-4">
                  <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-[var(--muted)]">
                    {locale === "tr" ? "Mesafe" : "Distance"}
                  </div>
                  <div className="font-serif text-2xl md:text-3xl mt-1 tabular-nums">
                    {current.distanceKm < 1
                      ? `${(current.distanceKm * 1000).toFixed(0)} m`
                      : `${current.distanceKm.toFixed(0)} km`}
                  </div>
                </div>
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4">
                  <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-emerald-300">
                    {locale === "tr" ? "Bu tur" : "This round"}
                  </div>
                  <div className="font-serif text-2xl md:text-3xl mt-1 tabular-nums text-[var(--accent)]">
                    {current.score.toLocaleString()}{" "}
                    <span className="text-sm text-[var(--muted)]">/ 5 000</span>
                  </div>
                </div>
                <div className="rounded-xl border border-[var(--line-2)] bg-[var(--line)] p-4 flex items-center justify-between gap-2">
                  {roundIdx < ROUND_COUNT - 1 ? (
                    <button
                      onClick={nextRound}
                      className="w-full h-full px-4 py-2 rounded-lg bg-[var(--accent)] text-black font-mono text-[12px] uppercase tracking-[0.25em] hover:opacity-90"
                    >
                      {locale === "tr" ? "Sonraki tur →" : "Next round →"}
                    </button>
                  ) : (
                    <button
                      onClick={startNewGame}
                      className="w-full h-full px-4 py-2 rounded-lg bg-[var(--accent)] text-black font-mono text-[12px] uppercase tracking-[0.25em] hover:opacity-90"
                    >
                      {locale === "tr" ? "Tekrar oyna" : "Play again"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Final summary */}
            {allDone && (
              <div className="mb-4 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-6 md:p-8">
                <div className="flex items-center gap-2 mb-2">
                  <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-300">
                    {locale === "tr" ? "Oyun bitti" : "Game over"}
                  </div>
                  {newRecord && (
                    <span className="font-mono text-[9px] uppercase tracking-[0.22em] px-2 py-0.5 rounded-full bg-[var(--accent)] text-black font-semibold">
                      {locale === "tr" ? "Yeni rekor!" : "New record!"}
                    </span>
                  )}
                </div>
                <div className="font-serif font-light text-4xl md:text-6xl tabular-nums text-[var(--accent)]">
                  {totalScore.toLocaleString()}
                  <span className="text-xl md:text-2xl text-[var(--muted)] ml-2">/ 25 000</span>
                </div>
                <div className="mt-4">
                  <ShareButton
                    title={locale === "tr" ? "Neredeyim skorum" : "My GeoGuess score"}
                    text={
                      locale === "tr"
                        ? `Neredeyim oyununda ${totalScore.toLocaleString()} puan yaptım! 🌍`
                        : `Scored ${totalScore.toLocaleString()} on GeoGuess! 🌍`
                    }
                    url={typeof window !== "undefined" ? window.location.href : ""}
                  />
                </div>
              </div>
            )}

            {/* Map */}
            <div
              ref={containerRef}
              className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-[#071912] via-[#0a0a0c] to-[#0e1a12] overflow-hidden relative select-none shadow-2xl"
              style={{
                height: "clamp(360px, 55vh, 640px)",
                cursor: dragging ? "grabbing" : current?.submitted ? "default" : "crosshair",
              }}
              onMouseDown={(e) => {
                if ((e.target as HTMLElement).closest("button")) return;
                dragStart.current = {
                  x: e.clientX,
                  y: e.clientY,
                  cx: zoom.cx,
                  cy: zoom.cy,
                };
                setDragging(true);
                setDidDrag(false);
              }}
            >
              <svg
                viewBox={`0 0 ${w} ${h}`}
                width="100%"
                height="100%"
                preserveAspectRatio="xMidYMid slice"
                onClick={onMapClick}
              >
                <defs>
                  <radialGradient id="oceanGrad" cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stopColor="#0a1b14" />
                    <stop offset="100%" stopColor="#060a08" />
                  </radialGradient>
                </defs>
                <rect width={w} height={h} fill="url(#oceanGrad)" />
                <g
                  style={{
                    transformOrigin: `${zoom.cx * w}px ${zoom.cy * h}px`,
                    transform: `scale(${zoom.scale})`,
                    transition: dragging ? "none" : "transform 300ms ease",
                  }}
                >
                  {features.map((f, i) => (
                    <path
                      key={i}
                      d={geomToPath(f.geometry, w, h)}
                      fill="rgba(255,255,255,0.05)"
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth={0.4 / zoom.scale}
                    />
                  ))}
                  {guessXY && (
                    <g>
                      <circle
                        cx={guessXY[0]}
                        cy={guessXY[1]}
                        r={10 / zoom.scale}
                        fill="#fbbf24"
                        fillOpacity="0.3"
                      />
                      <circle
                        cx={guessXY[0]}
                        cy={guessXY[1]}
                        r={5 / zoom.scale}
                        fill="#fbbf24"
                        stroke="#78350f"
                        strokeWidth={1 / zoom.scale}
                      />
                    </g>
                  )}
                  {actualXY && (
                    <>
                      <line
                        x1={guessXY ? guessXY[0] : actualXY[0]}
                        y1={guessXY ? guessXY[1] : actualXY[1]}
                        x2={actualXY[0]}
                        y2={actualXY[1]}
                        stroke="#34d399"
                        strokeWidth={1.5 / zoom.scale}
                        strokeDasharray={`${4 / zoom.scale} ${4 / zoom.scale}`}
                      />
                      <g>
                        <circle
                          cx={actualXY[0]}
                          cy={actualXY[1]}
                          r={12 / zoom.scale}
                          fill="#34d399"
                          fillOpacity="0.35"
                        />
                        <circle
                          cx={actualXY[0]}
                          cy={actualXY[1]}
                          r={6 / zoom.scale}
                          fill="#10b981"
                          stroke="#064e3b"
                          strokeWidth={1 / zoom.scale}
                        />
                      </g>
                    </>
                  )}
                </g>
              </svg>

              <div className="absolute right-3 top-3 flex flex-col gap-1.5 z-10">
                <button
                  onClick={() => setZoom((z) => ({ ...z, scale: Math.min(8, z.scale * 1.5) }))}
                  className="w-9 h-9 rounded-full border border-emerald-500/30 bg-black/70 backdrop-blur text-white hover:border-emerald-400 text-base"
                >
                  +
                </button>
                <button
                  onClick={() => setZoom((z) => ({ ...z, scale: Math.max(1, z.scale / 1.5) }))}
                  className="w-9 h-9 rounded-full border border-emerald-500/30 bg-black/70 backdrop-blur text-white hover:border-emerald-400 text-base"
                >
                  −
                </button>
                <button
                  onClick={() => setZoom({ scale: 1, cx: 0.5, cy: 0.5 })}
                  className="w-9 h-9 rounded-full border border-emerald-500/30 bg-black/70 backdrop-blur text-white hover:border-emerald-400 text-[11px]"
                >
                  ⟲
                </button>
              </div>
              <div className="absolute left-3 bottom-3 font-mono text-[9px] uppercase tracking-[0.22em] text-white/45 pointer-events-none">
                {locale === "tr"
                  ? current?.submitted
                    ? "sürükle · tekerlek = zoom"
                    : "haritaya tıkla · sürükle = pan · tekerlek = zoom"
                  : current?.submitted
                  ? "drag · wheel to zoom"
                  : "click map · drag = pan · wheel = zoom"}
              </div>
            </div>

            {/* Submit */}
            {!current?.submitted && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={submit}
                  disabled={!current?.guess}
                  className="px-8 py-3 rounded-full font-mono text-[12px] uppercase tracking-[0.25em] bg-[var(--accent)] text-black hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {current?.guess
                    ? locale === "tr"
                      ? "Tahmin et"
                      : "Guess"
                    : locale === "tr"
                    ? "Önce haritaya tıkla"
                    : "Click the map first"}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      <footer className="px-5 md:px-10 py-6 hair-t flex flex-wrap justify-between gap-4 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
        <span>{t("footer.copyright", { year: new Date().getFullYear() })}</span>
        <span className="hidden md:inline">
          {locale === "tr" ? "Foto · Wikipedia" : "Photos · Wikipedia"}
        </span>
      </footer>
    </div>
  );
}
