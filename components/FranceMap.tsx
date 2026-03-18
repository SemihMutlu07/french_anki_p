"use client";

interface CityData {
  name: string;
  unit: number;
  x: number;
  y: number;
}

const CITIES: CityData[] = [
  { name: "Paris", unit: 1, x: 225, y: 128 },
  { name: "Lyon", unit: 2, x: 290, y: 268 },
  { name: "Marseille", unit: 3, x: 298, y: 382 },
  { name: "Toulouse", unit: 4, x: 192, y: 372 },
  { name: "Bordeaux", unit: 5, x: 138, y: 318 },
  { name: "Lille", unit: 6, x: 245, y: 48 },
  { name: "Strasbourg", unit: 7, x: 348, y: 140 },
  { name: "Nantes", unit: 8, x: 112, y: 208 },
  { name: "Nice", unit: 9, x: 342, y: 365 },
  { name: "Montpellier", unit: 10, x: 260, y: 378 },
  { name: "Rennes", unit: 11, x: 108, y: 162 },
  { name: "Dijon", unit: 12, x: 295, y: 198 },
  { name: "Grenoble", unit: 13, x: 318, y: 298 },
  { name: "Rouen", unit: 14, x: 195, y: 88 },
  { name: "Tours", unit: 15, x: 168, y: 228 },
  { name: "Clermont", unit: 16, x: 238, y: 298 },
  { name: "Angers", unit: 17, x: 138, y: 228 },
  { name: "Reims", unit: 18, x: 282, y: 82 },
];

// Simplified France outline path (clockwise from north)
const FRANCE_PATH =
  "M 195,18 C 215,12 240,28 265,52 C 282,70 308,90 330,100 " +
  "C 350,110 362,130 358,158 C 354,185 345,215 335,240 " +
  "C 325,265 324,295 330,325 C 336,355 332,382 315,402 " +
  "C 298,422 272,436 245,438 C 218,440 192,430 168,418 " +
  "C 142,404 120,384 104,362 C 88,340 82,312 84,285 " +
  "C 86,258 78,232 65,212 C 50,190 30,172 20,158 " +
  "C 10,144 18,130 36,120 C 56,110 78,100 100,90 " +
  "C 120,80 132,80 148,85 C 162,55 178,30 195,18 Z";

interface UnitMastery {
  unit: number;
  percentage: number;
}

interface FranceMapProps {
  unitData: UnitMastery[];
}

export default function FranceMap({ unitData }: FranceMapProps) {
  const getUnitPercentage = (unit: number): number => {
    const found = unitData.find((u) => u.unit === unit);
    return found ? found.percentage : 0;
  };

  const getCityColor = (pct: number): string => {
    if (pct === 100) return "var(--fr-gold)";
    if (pct >= 50) return "var(--fr-blue-light)";
    if (pct > 0) return "var(--fr-blue)";
    return "#2a2a4a";
  };

  const getCityGlow = (pct: number): string => {
    if (pct === 100) return "drop-shadow(0 0 6px rgba(227, 181, 5, 0.8))";
    if (pct >= 50) return "drop-shadow(0 0 4px rgba(65, 105, 225, 0.6))";
    return "none";
  };

  const getLabelColor = (pct: number): string => {
    if (pct === 100) return "var(--fr-gold)";
    if (pct > 0) return "var(--fr-blue-pale)";
    return "var(--text-faint)";
  };

  return (
    <svg
      viewBox="0 0 400 460"
      className="w-full max-w-[320px] mx-auto"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Fransa haritası — ünite ilerlemesi"
    >
      <defs>
        <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--fr-blue)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--fr-blue)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="goldPulse" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--fr-gold)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="var(--fr-gold)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background glow */}
      <ellipse cx="200" cy="230" rx="180" ry="210" fill="url(#mapGlow)" />

      {/* France outline */}
      <path
        d={FRANCE_PATH}
        fill="rgba(0, 0, 145, 0.08)"
        stroke="rgba(65, 105, 225, 0.35)"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Connection lines between adjacent cities (subtle) */}
      {CITIES.map((city) => {
        const pct = getUnitPercentage(city.unit);
        if (pct === 0) return null;
        // Draw a subtle line from Paris to this city
        if (city.unit === 1) return null;
        return (
          <line
            key={`line-${city.unit}`}
            x1={225}
            y1={128}
            x2={city.x}
            y2={city.y}
            stroke="rgba(65, 105, 225, 0.12)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        );
      })}

      {/* City markers */}
      {CITIES.map((city) => {
        const pct = getUnitPercentage(city.unit);
        const color = getCityColor(pct);
        const isComplete = pct === 100;
        const isParis = city.unit === 1;
        const r = isParis ? 10 : 7;

        return (
          <g key={city.unit} style={{ filter: getCityGlow(pct) }}>
            {/* Gold pulse ring for completed cities */}
            {isComplete && (
              <circle cx={city.x} cy={city.y} r={r + 6} fill="url(#goldPulse)">
                <animate
                  attributeName="r"
                  values={`${r + 4};${r + 8};${r + 4}`}
                  dur="2.5s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.6;0.2;0.6"
                  dur="2.5s"
                  repeatCount="indefinite"
                />
              </circle>
            )}

            {/* City dot */}
            <circle
              cx={city.x}
              cy={city.y}
              r={r}
              fill={color}
              stroke={isComplete ? "var(--fr-gold-light)" : "rgba(255,255,255,0.15)"}
              strokeWidth={isComplete ? 2 : 1}
            />

            {/* Unit number inside dot */}
            <text
              x={city.x}
              y={city.y + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={isParis ? 10 : 8}
              fontWeight="700"
              fill={pct > 0 ? "#ffffff" : "var(--text-muted)"}
            >
              {city.unit}
            </text>

            {/* City name label */}
            <text
              x={city.x}
              y={city.y + r + 14}
              textAnchor="middle"
              fontSize="9"
              fontWeight="500"
              fill={getLabelColor(pct)}
            >
              {city.name}
            </text>

            {/* Percentage below name */}
            {pct > 0 && (
              <text
                x={city.x}
                y={city.y + r + 25}
                textAnchor="middle"
                fontSize="8"
                fill={isComplete ? "var(--fr-gold)" : "var(--text-muted)"}
              >
                {pct}%
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
