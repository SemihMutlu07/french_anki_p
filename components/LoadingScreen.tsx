"use client";

import React, { useEffect, useState } from "react";

interface LoadingScreenProps {
  /** Callback when loading is complete */
  onComplete?: () => void;
  /** Minimum display duration in ms */
  minDuration?: number;
  /** Whether to show the loading screen */
  isVisible: boolean;
}

/**
 * Animated loading screen with Eiffel Tower.
 * Shows a cute animatic loading sequence with French colors.
 */
export default function LoadingScreen({
  onComplete,
  minDuration = 1500,
  isVisible,
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"building" | "glowing" | "complete">("building");

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      setPhase("building");
      return;
    }

    const startTime = Date.now();

    // Building phase animation (0-100% over 1.2s)
    const buildAnimation = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const buildProgress = Math.min((elapsed / 1200) * 100, 100);
      setProgress(buildProgress);

      if (buildProgress >= 100) {
        clearInterval(buildAnimation);
        setPhase("glowing");

        // Glowing phase (0.3s)
        setTimeout(() => {
          setPhase("complete");

          // Complete phase, then dismiss after remaining duration
          const remainingTime = Math.max(0, minDuration - (Date.now() - startTime));
          setTimeout(() => {
            onComplete?.();
          }, remainingTime);
        }, 300);
      }
    }, 16);

    return () => clearInterval(buildAnimation);
  }, [isVisible, minDuration, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(180deg, #0B1220 0%, #000091 50%, #000000 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      {/* Animated background sparkles */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              background: i % 3 === 0 ? "#e3b505" : i % 3 === 1 ? "#ffffff" : "#000091",
              borderRadius: "50%",
              animation: `pulse ${1 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
              boxShadow: i % 3 === 0 ? "0 0 10px rgba(227, 181, 5, 0.8)" : "none",
            }}
          />
        ))}
      </div>

      {/* French flag accent at top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, #000091 0%, #000091 33%, #ffffff 33%, #ffffff 66%, #e1000f 66%, #e1000f 100%)",
        }}
      />

      {/* Main content */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Loading text */}
        <p
          style={{
            fontSize: "14px",
            color: "#e3b505",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            marginBottom: "24px",
            fontWeight: 600,
            textShadow: "0 0 20px rgba(227, 181, 5, 0.5)",
          }}
        >
          {phase === "building" ? "Yükleniyor" : phase === "glowing" ? "Hazırlanıyor" : "Tamamlandı"}
        </p>

        {/* Progressive Eiffel Tower that builds up */}
        <div
          style={{
            position: "relative",
            width: "200px",
            height: "320px",
          }}
        >
          {/* Tower SVG */}
          <svg
            width="200"
            height="320"
            viewBox="0 0 200 320"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ 
              filter: phase === "complete" 
                ? "drop-shadow(0 0 30px rgba(227, 181, 5, 0.8)) drop-shadow(0 0 60px rgba(227, 181, 5, 0.4))" 
                : "drop-shadow(0 0 15px rgba(0, 0, 145, 0.5))",
            }}
          >
            {/* Define gradient for tower */}
            <defs>
              <linearGradient id="towerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e3b505" stopOpacity={phase === "complete" ? 1 : 0.8} />
                <stop offset="50%" stopColor="#000091" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#00006B" stopOpacity={1} />
              </linearGradient>
              <linearGradient id="glowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="50%" stopColor="#e3b505" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#000091" stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id="frenchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#000091" />
                <stop offset="50%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e1000f" />
              </linearGradient>
            </defs>

            {/* Antenna */}
            <g style={{ 
              opacity: Math.min(Math.max((progress - 80) / 20, 0), 1),
              transition: "opacity 0.3s ease"
            }}>
              <line
                x1="100"
                y1="5"
                x2="100"
                y2="25"
                stroke="url(#towerGradient)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {phase === "complete" && (
                <circle cx="100" cy="5" r="6" fill="#e3b505">
                  <animate attributeName="r" values="6;8;6" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0.4;0.8" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
            </g>

            {/* Top platform */}
            <g style={{ 
              opacity: Math.min(Math.max((progress - 70) / 20, 0), 1),
              transition: "opacity 0.3s ease"
            }}>
              <line
                x1="85"
                y1="25"
                x2="115"
                y2="25"
                stroke="url(#towerGradient)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M 90 25 L 100 45 L 110 25"
                stroke="url(#towerGradient)"
                strokeWidth="2"
                fill={phase === "complete" ? "url(#glowGradient)" : "none"}
                fillOpacity={phase === "complete" ? 0.3 : 0}
              />
            </g>

            {/* Upper tower */}
            <g style={{ 
              opacity: Math.min(Math.max((progress - 60) / 20, 0), 1),
              transition: "opacity 0.3s ease"
            }}>
              <line x1="100" y1="45" x2="90" y2="80" stroke="url(#towerGradient)" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="100" y1="45" x2="110" y2="80" stroke="url(#towerGradient)" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="95" y1="55" x2="105" y2="55" stroke="url(#towerGradient)" strokeWidth="1.5" opacity="0.6" />
              <line x1="93" y1="65" x2="107" y2="65" stroke="url(#towerGradient)" strokeWidth="1.5" opacity="0.6" />
            </g>

            {/* Middle platform */}
            <g style={{ 
              opacity: Math.min(Math.max((progress - 50) / 20, 0), 1),
              transition: "opacity 0.3s ease"
            }}>
              <line
                x1="75"
                y1="80"
                x2="125"
                y2="80"
                stroke="url(#towerGradient)"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>

            {/* Lower tower */}
            <g style={{ 
              opacity: Math.min(Math.max((progress - 30) / 20, 0), 1),
              transition: "opacity 0.3s ease"
            }}>
              <line x1="90" y1="80" x2="70" y2="140" stroke="url(#towerGradient)" strokeWidth="3" strokeLinecap="round" />
              <line x1="110" y1="80" x2="130" y2="140" stroke="url(#towerGradient)" strokeWidth="3" strokeLinecap="round" />
              <line x1="85" y1="95" x2="95" y2="115" stroke="url(#towerGradient)" strokeWidth="1.5" opacity="0.5" />
              <line x1="95" y1="95" x2="85" y2="115" stroke="url(#towerGradient)" strokeWidth="1.5" opacity="0.5" />
              <line x1="105" y1="95" x2="115" y2="115" stroke="url(#towerGradient)" strokeWidth="1.5" opacity="0.5" />
              <line x1="115" y1="95" x2="105" y2="115" stroke="url(#towerGradient)" strokeWidth="1.5" opacity="0.5" />
            </g>

            {/* Lower platform */}
            <g style={{ 
              opacity: Math.min(Math.max((progress - 20) / 20, 0), 1),
              transition: "opacity 0.3s ease"
            }}>
              <line
                x1="55"
                y1="140"
                x2="145"
                y2="140"
                stroke="url(#towerGradient)"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </g>

            {/* Legs */}
            <g style={{ 
              opacity: Math.min(Math.max((progress - 0) / 20, 0), 1),
              transition: "opacity 0.3s ease"
            }}>
              <path
                d="M 70 140 Q 60 180 50 240 L 45 300"
                stroke="url(#towerGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 130 140 Q 140 180 150 240 L 155 300"
                stroke="url(#towerGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <line x1="90" y1="140" x2="85" y2="300" stroke="url(#towerGradient)" strokeWidth="3" strokeLinecap="round" />
              <line x1="110" y1="140" x2="115" y2="300" stroke="url(#towerGradient)" strokeWidth="3" strokeLinecap="round" />
              
              {/* Ground arches */}
              <path
                d="M 50 300 Q 75 270 100 300"
                stroke="url(#towerGradient)"
                strokeWidth="2.5"
                fill="none"
              />
              <path
                d="M 100 300 Q 125 270 150 300"
                stroke="url(#towerGradient)"
                strokeWidth="2.5"
                fill="none"
              />
            </g>

            {/* Base */}
            <g style={{ 
              opacity: Math.min(Math.max((progress - 0) / 10, 0), 1),
              transition: "opacity 0.3s ease"
            }}>
              <line
                x1="30"
                y1="300"
                x2="170"
                y2="300"
                stroke="url(#towerGradient)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>

            {/* Sparkles at completion */}
            {phase === "complete" && (
              <>
                <circle cx="60" cy="200" r="3" fill="#ffffff">
                  <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="140" cy="180" r="2.5" fill="#ffffff">
                  <animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite" begin="0.3s" />
                </circle>
                <circle cx="100" cy="120" r="3.5" fill="#ffffff">
                  <animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite" begin="0.6s" />
                </circle>
              </>
            )}
          </svg>
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: "200px",
            marginTop: "32px",
          }}
        >
          <div
            style={{
              height: "6px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "3px",
              overflow: "hidden",
              border: "1px solid rgba(227, 181, 5, 0.3)",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: phase === "complete" 
                  ? "linear-gradient(90deg, #e3b505, #ffffff, #e1000f)" 
                  : "linear-gradient(90deg, #000091, #4169E1, #ffffff)",
                borderRadius: "3px",
                transition: "width 0.1s ease-out",
                boxShadow: phase === "complete" ? "0 0 20px rgba(227, 181, 5, 0.8)" : "0 0 10px rgba(0, 0, 145, 0.5)",
              }}
            />
          </div>
        </div>

        {/* Loading dots */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: i === 0 ? "#000091" : i === 1 ? "#ffffff" : "#e1000f",
                border: "1px solid rgba(227, 181, 5, 0.5)",
                animation: phase === "building" ? "bounce 1s ease-in-out infinite" : "none",
                animationDelay: `${i * 0.15}s`,
                boxShadow: i === 1 ? "0 0 10px rgba(255, 255, 255, 0.8)" : "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* French flag accent at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, #e1000f 0%, #e1000f 33%, #ffffff 33%, #ffffff 66%, #000091 66%, #000091 100%)",
        }}
      />
    </div>
  );
}
