"use client";

import React from "react";

interface ProgressiveEiffelTowerProps {
  /** Level from 0 to 10 (or 0.0 to 1.0 ratio) */
  level: number;
  /** Size multiplier (default: 1) */
  size?: number;
  /** Whether to show the "learn more" hint when not at max */
  showHint?: boolean;
  /** Whether this is for loading screen (simplified animation) */
  isLoading?: boolean;
  /** Custom width in pixels (default: 280) */
  width?: number;
}

/**
 * Highly detailed Progressive Eiffel Tower component with French colors.
 * 
 * Level progression:
 * - 0/10: Dark silhouette, no illumination
 * - 1-3/10: Base structure appears with faint blue glow
 * - 4-6/10: Middle sections light up with French blue
 * - 7-9/10: Bright with gold accents, some parts still dark
 * - 10/10: Fully illuminated with golden shine and sparkles
 */
export default function ProgressiveEiffelTower({
  level,
  size = 1,
  showHint = true,
  isLoading = false,
  width = 280,
}: ProgressiveEiffelTowerProps) {
  // Normalize level to 0-1 range
  const ratio = Math.min(Math.max(level / 10, 0), 1);
  
  // French color palette
  const FRENCH_BLUE = "var(--fr-blue)";
  const FRENCH_WHITE = "#ffffff";
  const FRENCH_RED = "var(--fr-red)";
  const FRENCH_GOLD = "var(--fr-gold)";
  
  // Calculate colors based on level
  const getPrimaryColor = () => {
    if (isLoading) return FRENCH_BLUE;
    if (ratio >= 1) return FRENCH_GOLD;
    if (ratio >= 0.6) return FRENCH_BLUE;
    if (ratio >= 0.3) return "#00006B";
    return "#1a1a4a";
  };

  const getAccentColor = () => {
    if (ratio >= 0.8) return FRENCH_GOLD;
    if (ratio >= 0.5) return "var(--fr-blue-light)";
    return "#2a2a6a";
  };

  const getStructureOpacity = (sectionLevel: number) => {
    if (isLoading) {
      return 0.3 + Math.min(ratio, 0.7);
    }
    if (ratio >= sectionLevel) return 1;
    if (ratio >= sectionLevel - 0.15) {
      return (ratio - (sectionLevel - 0.15)) / 0.15;
    }
    return 0.08;
  };

  const getGlowIntensity = () => {
    if (ratio >= 0.6) return (ratio - 0.6) / 0.4;
    return 0;
  };

  const glowIntensity = getGlowIntensity();
  const primaryColor = getPrimaryColor();
  const accentColor = getAccentColor();

  const filter = glowIntensity > 0 && !isLoading
    ? `drop-shadow(0 0 ${15 + glowIntensity * 25}px rgba(227, 181, 5, ${0.4 + glowIntensity * 0.4})) 
       drop-shadow(0 0 ${30 + glowIntensity * 40}px rgba(227, 181, 5, ${0.2 + glowIntensity * 0.3}))`
    : ratio >= 0.3
    ? `drop-shadow(0 0 8px rgba(0, 0, 145, 0.3))`
    : "none";

  const height = width * 1.6;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 280 448"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter }}
        aria-label={`Eiffel Tower progress: ${Math.round(ratio * 100)}%`}
      >
        <defs>
          {/* Gradient for illuminated tower */}
          <linearGradient id="towerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.6" />
            <stop offset="50%" stopColor={accentColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0.6" />
          </linearGradient>
          
          {/* Gold gradient for max level */}
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={FRENCH_GOLD} stopOpacity="1" />
            <stop offset="50%" stopColor="var(--fr-gold-light)" stopOpacity="0.9" />
            <stop offset="100%" stopColor={FRENCH_GOLD} stopOpacity="0.7" />
          </linearGradient>
          
          {/* Glow gradient */}
          <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={FRENCH_GOLD} stopOpacity="0.6" />
            <stop offset="100%" stopColor={FRENCH_GOLD} stopOpacity="0" />
          </radialGradient>
          
          {/* Sparkle gradient */}
          <radialGradient id="sparkleGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={FRENCH_WHITE} stopOpacity="1" />
            <stop offset="50%" stopColor={FRENCH_GOLD} stopOpacity="0.5" />
            <stop offset="100%" stopColor={FRENCH_GOLD} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background glow circle at high levels */}
        {ratio >= 0.5 && (
          <circle
            cx={width / 2}
            cy={height * 0.4}
            r={width * 0.3 * glowIntensity}
            fill="url(#glowGradient)"
            opacity={glowIntensity * 0.5}
          />
        )}

        {/* === BASE PLATFORM (Level 0-1) === */}
        <g opacity={getStructureOpacity(0.05)}>
          {/* Ground line */}
          <line
            x1={width * 0.1}
            y1={height * 0.95}
            x2={width * 0.9}
            y2={height * 0.95}
            stroke={primaryColor}
            strokeWidth={3 * size}
            strokeLinecap="round"
          />
          
          {/* Decorative ground dots */}
          {[0.2, 0.35, 0.5, 0.65, 0.8].map((pos, i) => (
            <circle
              key={i}
              cx={width * pos}
              cy={height * 0.95}
              r={2 * size}
              fill={primaryColor}
              opacity={0.5}
            />
          ))}
        </g>

        {/* === LEGS SECTION (Level 1-2) === */}
        <g opacity={getStructureOpacity(0.1)}>
          {/* Left outer leg - curved */}
          <path
            d={`M ${width * 0.35} ${height * 0.72} 
                Q ${width * 0.28} ${height * 0.82} ${width * 0.22} ${height * 0.92}
                L ${width * 0.21} ${height * 0.95}`}
            stroke={primaryColor}
            strokeWidth={5 * size}
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Right outer leg - curved */}
          <path
            d={`M ${width * 0.65} ${height * 0.72} 
                Q ${width * 0.72} ${height * 0.82} ${width * 0.78} ${height * 0.92}
                L ${width * 0.79} ${height * 0.95}`}
            stroke={primaryColor}
            strokeWidth={5 * size}
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Left inner leg */}
          <line
            x1={width * 0.42}
            y1={height * 0.72}
            x2={width * 0.40}
            y2={height * 0.95}
            stroke={primaryColor}
            strokeWidth={4 * size}
            strokeLinecap="round"
          />
          
          {/* Right inner leg */}
          <line
            x1={width * 0.58}
            y1={height * 0.72}
            x2={width * 0.60}
            y2={height * 0.95}
            stroke={primaryColor}
            strokeWidth={4 * size}
            strokeLinecap="round"
          />
          
          {/* Left arch */}
          {ratio >= 0.1 && (
            <path
              d={`M ${width * 0.22} ${height * 0.95} 
                  Q ${width * 0.28} ${height * 0.88} ${width * 0.35} ${height * 0.92}`}
              stroke={accentColor}
              strokeWidth={2.5 * size}
              fill="none"
              opacity={0.7}
            />
          )}
          
          {/* Right arch */}
          {ratio >= 0.1 && (
            <path
              d={`M ${width * 0.65} ${height * 0.92} 
                  Q ${width * 0.72} ${height * 0.88} ${width * 0.78} ${height * 0.95}`}
              stroke={accentColor}
              strokeWidth={2.5 * size}
              fill="none"
              opacity={0.7}
            />
          )}
          
          {/* Center arch */}
          {ratio >= 0.15 && (
            <path
              d={`M ${width * 0.40} ${height * 0.95} 
                  Q ${width * 0.50} ${height * 0.90} ${width * 0.60} ${height * 0.95}`}
              stroke={accentColor}
              strokeWidth={2.5 * size}
              fill="none"
              opacity={0.6}
            />
          )}
        </g>

        {/* === FIRST PLATFORM (Level 2-3) === */}
        <g opacity={getStructureOpacity(0.25)}>
          {/* Main platform beam */}
          <rect
            x={width * 0.25}
            y={height * 0.70}
            width={width * 0.50}
            height={6 * size}
            fill={`url(#${ratio >= 0.5 ? 'towerGradient' : 'none'})`}
            stroke={primaryColor}
            strokeWidth={2 * size}
            rx={2 * size}
          />
          
          {/* Platform supports */}
          <line
            x1={width * 0.30}
            y1={height * 0.70}
            x2={width * 0.28}
            y2={height * 0.75}
            stroke={primaryColor}
            strokeWidth={2 * size}
          />
          <line
            x1={width * 0.70}
            y1={height * 0.70}
            x2={width * 0.72}
            y2={height * 0.75}
            stroke={primaryColor}
            strokeWidth={2 * size}
          />
          
          {/* Decorative railings */}
          {ratio >= 0.3 && (
            <>
              {[0.28, 0.32, 0.36, 0.40, 0.60, 0.64, 0.68, 0.72].map((pos, i) => (
                <line
                  key={i}
                  x1={width * pos}
                  y1={height * 0.68}
                  x2={width * pos}
                  y2={height * 0.70}
                  stroke={accentColor}
                  strokeWidth={1.5 * size}
                  opacity={0.6}
                />
              ))}
            </>
          )}
        </g>

        {/* === LOWER TOWER SECTION (Level 3-5) === */}
        <g opacity={getStructureOpacity(0.35)}>
          {/* Left main beam */}
          <line
            x1={width * 0.42}
            y1={height * 0.72}
            x2={width * 0.38}
            y2={height * 0.52}
            stroke={primaryColor}
            strokeWidth={4.5 * size}
            strokeLinecap="round"
          />
          
          {/* Right main beam */}
          <line
            x1={width * 0.58}
            y1={height * 0.72}
            x2={width * 0.62}
            y2={height * 0.52}
            stroke={primaryColor}
            strokeWidth={4.5 * size}
            strokeLinecap="round"
          />
          
          {/* X-bracing pattern 1 */}
          {ratio >= 0.4 && (
            <>
              <line
                x1={width * 0.41}
                y1={height * 0.65}
                x2={width * 0.48}
                y2={height * 0.68}
                stroke={accentColor}
                strokeWidth={2 * size}
                opacity={0.7}
              />
              <line
                x1={width * 0.48}
                y1={height * 0.65}
                x2={width * 0.41}
                y2={height * 0.68}
                stroke={accentColor}
                strokeWidth={2 * size}
                opacity={0.7}
              />
            </>
          )}
          
          {/* X-bracing pattern 2 */}
          {ratio >= 0.45 && (
            <>
              <line
                x1={width * 0.52}
                y1={height * 0.58}
                x2={width * 0.59}
                y2={height * 0.61}
                stroke={accentColor}
                strokeWidth={2 * size}
                opacity={0.7}
              />
              <line
                x1={width * 0.59}
                y1={height * 0.58}
                x2={width * 0.52}
                y2={height * 0.61}
                stroke={accentColor}
                strokeWidth={2 * size}
                opacity={0.7}
              />
            </>
          )}
          
          {/* Horizontal beams */}
          {ratio >= 0.4 && (
            <>
              <line
                x1={width * 0.40}
                y1={height * 0.66}
                x2={width * 0.60}
                y2={height * 0.66}
                stroke={accentColor}
                strokeWidth={1.5 * size}
                opacity={0.5}
              />
              <line
                x1={width * 0.42}
                y1={height * 0.60}
                x2={width * 0.58}
                y2={height * 0.60}
                stroke={accentColor}
                strokeWidth={1.5 * size}
                opacity={0.5}
              />
            </>
          )}
        </g>

        {/* === SECOND PLATFORM (Level 5-6) === */}
        <g opacity={getStructureOpacity(0.55)}>
          <rect
            x={width * 0.32}
            y={height * 0.50}
            width={width * 0.36}
            height={5 * size}
            fill={`url(#${ratio >= 0.6 ? 'towerGradient' : 'none'})`}
            stroke={primaryColor}
            strokeWidth={2 * size}
            rx={2 * size}
          />
          
          {/* Platform decorations */}
          {ratio >= 0.6 && (
            <>
              <circle cx={width * 0.35} cy={height * 0.525} r={2 * size} fill={accentColor} opacity={0.6} />
              <circle cx={width * 0.65} cy={height * 0.525} r={2 * size} fill={accentColor} opacity={0.6} />
            </>
          )}
        </g>

        {/* === MIDDLE TOWER SECTION (Level 6-7) === */}
        <g opacity={getStructureOpacity(0.65)}>
          {/* Converging beams */}
          <line
            x1={width * 0.38}
            y1={height * 0.50}
            x2={width * 0.44}
            y2={height * 0.35}
            stroke={primaryColor}
            strokeWidth={4 * size}
            strokeLinecap="round"
          />
          <line
            x1={width * 0.62}
            y1={height * 0.50}
            x2={width * 0.56}
            y2={height * 0.35}
            stroke={primaryColor}
            strokeWidth={4 * size}
            strokeLinecap="round"
          />
          
          {/* Cross patterns */}
          {ratio >= 0.7 && (
            <>
              <line
                x1={width * 0.42}
                y1={height * 0.45}
                x2={width * 0.48}
                y2={height * 0.42}
                stroke={accentColor}
                strokeWidth={2 * size}
              />
              <line
                x1={width * 0.48}
                y1={height * 0.45}
                x2={width * 0.42}
                y2={height * 0.42}
                stroke={accentColor}
                strokeWidth={2 * size}
              />
            </>
          )}
        </g>

        {/* === THIRD PLATFORM (Level 7-8) === */}
        <g opacity={getStructureOpacity(0.75)}>
          <rect
            x={width * 0.40}
            y={height * 0.33}
            width={width * 0.20}
            height={4 * size}
            fill={`url(#${ratio >= 0.8 ? 'goldGradient' : 'towerGradient'})`}
            stroke={ratio >= 0.8 ? FRENCH_GOLD : primaryColor}
            strokeWidth={2 * size}
            rx={1.5 * size}
          />
        </g>

        {/* === UPPER TOWER SECTION (Level 8-9) === */}
        <g opacity={getStructureOpacity(0.85)}>
          {/* Tapering structure */}
          <path
            d={`M ${width * 0.44} ${height * 0.33} 
                L ${width * 0.48} ${height * 0.20}
                L ${width * 0.52} ${height * 0.20}
                L ${width * 0.56} ${height * 0.33}`}
            fill={`url(#${ratio >= 0.9 ? 'goldGradient' : 'towerGradient'})`}
            stroke={primaryColor}
            strokeWidth={1.5 * size}
            opacity={0.8}
          />
          
          {/* Decorative lines */}
          {ratio >= 0.9 && (
            <>
              <line
                x1={width * 0.46}
                y1={height * 0.28}
                x2={width * 0.54}
                y2={height * 0.28}
                stroke={FRENCH_GOLD}
                strokeWidth={1.5 * size}
                opacity={0.7}
              />
              <line
                x1={width * 0.47}
                y1={height * 0.24}
                x2={width * 0.53}
                y2={height * 0.24}
                stroke={FRENCH_GOLD}
                strokeWidth={1.5 * size}
                opacity={0.7}
              />
            </>
          )}
        </g>

        {/* === TOP SECTION & ANTENNA (Level 9-10) === */}
        <g opacity={getStructureOpacity(0.95)}>
          {/* Top platform */}
          <rect
            x={width * 0.46}
            y={height * 0.19}
            width={width * 0.08}
            height={3 * size}
            fill={ratio >= 1 ? FRENCH_GOLD : primaryColor}
            rx={1 * size}
          />
          
          {/* Main antenna pole */}
          <line
            x1={width * 0.50}
            y1={height * 0.19}
            x2={width * 0.50}
            y2={height * 0.08}
            stroke={ratio >= 1 ? FRENCH_GOLD : primaryColor}
            strokeWidth={2.5 * size}
            strokeLinecap="round"
          />
          
          {/* Antenna tip */}
          <line
            x1={width * 0.50}
            y1={height * 0.08}
            x2={width * 0.50}
            y2={height * 0.04}
            stroke={ratio >= 1 ? FRENCH_GOLD : primaryColor}
            strokeWidth={1.5 * size}
            strokeLinecap="round"
          />
          
          {/* Antenna glow ball at max level */}
          {ratio >= 1 && (
            <>
              <circle
                cx={width * 0.50}
                cy={height * 0.03}
                r={5 * size}
                fill={`url(#sparkleGradient)`}
              >
                <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" />
              </circle>
            </>
          )}
        </g>

        {/* === SPARKLES AT MAX LEVEL === */}
        {ratio >= 1 && !isLoading && (
          <>
            {/* Left sparkle */}
            <circle cx={width * 0.30} cy={height * 0.60} r={3 * size} fill="url(#sparkleGradient)">
              <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
            </circle>
            
            {/* Right sparkle */}
            <circle cx={width * 0.70} cy={height * 0.55} r={2.5 * size} fill="url(#sparkleGradient)">
              <animate attributeName="opacity" values="0;1;0" dur="1.3s" repeatCount="indefinite" begin="0.4s" />
            </circle>
            
            {/* Center sparkle */}
            <circle cx={width * 0.50} cy={height * 0.40} r={4 * size} fill="url(#sparkleGradient)">
              <animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite" begin="0.8s" />
            </circle>
            
            {/* Top sparkle */}
            <circle cx={width * 0.50} cy={height * 0.25} r={3 * size} fill="url(#sparkleGradient)">
              <animate attributeName="opacity" values="0;1;0" dur="1.4s" repeatCount="indefinite" begin="0.2s" />
            </circle>
          </>
        )}

        {/* === FRENCH FLAG COLORS AT BASE (decorative) === */}
        {ratio >= 1 && !isLoading && (
          <g opacity={0.8}>
            <rect x={width * 0.42} y={height * 0.96} width={width * 0.05} height={2 * size} fill={FRENCH_BLUE} />
            <rect x={width * 0.47} y={height * 0.96} width={width * 0.05} height={2 * size} fill={FRENCH_WHITE} />
            <rect x={width * 0.52} y={height * 0.96} width={width * 0.05} height={2 * size} fill={FRENCH_RED} />
          </g>
        )}
      </svg>

      {/* "Learn more" hint */}
      {showHint && ratio < 1 && !isLoading && (
        <div
          style={{
            position: "absolute",
            bottom: -50 * size,
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          <p
            style={{
              fontSize: 13 * size,
              color: FRENCH_GOLD,
              margin: 0,
              fontWeight: 600,
              textShadow: "0 0 10px rgba(227, 181, 5, 0.5)",
            }}
          >
            ✨ Daha fazla öğren!
          </p>
          <p
            style={{
              fontSize: 11 * size,
              color: "rgba(255, 255, 255, 0.6)",
              margin: "4px 0 0",
            }}
          >
            {Math.round((1 - ratio) * 100)}% eksik
          </p>
        </div>
      )}
    </div>
  );
}
