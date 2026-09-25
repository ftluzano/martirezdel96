import React, { useState, useRef } from 'react';

interface BarangayLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  subtitle?: string;
  animated?: boolean;
  interactive?: boolean;
}

export const BarangayLogo: React.FC<BarangayLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  subtitle = "Pateros, Metro Manila",
  animated = true,
  interactive = true,
}) => {
  const sizeMap = {
    sm: { width: 38, height: 38, text: 'text-sm', sub: 'text-[10px]' },
    md: { width: 52, height: 52, text: 'text-base', sub: 'text-xs' },
    lg: { width: 72, height: 72, text: 'text-lg', sub: 'text-xs' },
    xl: { width: 104, height: 104, text: 'text-2xl', sub: 'text-sm' },
    '2xl': { width: 140, height: 140, text: 'text-3xl', sub: 'text-base' },
  };

  const dim = sizeMap[size];

  // Mouse hover 3D tilt physics state
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, isHovered: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Normalize coordinates from -1 to 1
    const normX = (e.clientX - centerX) / (rect.width / 2);
    const normY = (e.clientY - centerY) / (rect.height / 2);

    // Realistic physical tilt degrees (up to +/- 14 degrees)
    setTilt({
      x: -normY * 12,
      y: normX * 14,
      isHovered: true,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, isHovered: false });
  };

  // Generate unique ID prefix to avoid SVG filter collisions when multiple logos are rendered
  const id = React.useId().replace(/:/g, '');

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group/logo inline-flex items-center gap-3 select-none perspective-[800px] ${className}`}
      style={{ perspective: '800px' }}
    >
      <style>{`
        @keyframes bm-float-${id} {
          0%, 100% {
            transform: translateY(0px) rotateX(0deg) rotateY(0deg);
          }
          25% {
            transform: translateY(-4px) rotateX(2.5deg) rotateY(-3deg);
          }
          50% {
            transform: translateY(-1.5px) rotateX(-2deg) rotateY(2.5deg);
          }
          75% {
            transform: translateY(-5.5px) rotateX(3deg) rotateY(-2deg);
          }
        }

        @keyframes bm-shadow-${id} {
          0%, 100% {
            transform: scale(1);
            opacity: 0.35;
          }
          50% {
            transform: scale(0.82);
            opacity: 0.18;
          }
        }

        @keyframes bm-sheen-sweep-${id} {
          0% {
            transform: translateX(-160%) translateY(-20%) rotate(25deg);
          }
          28%, 100% {
            transform: translateX(260%) translateY(20%) rotate(25deg);
          }
        }

        @keyframes bm-sun-pulse-${id} {
          0%, 100% {
            filter: drop-shadow(0 0 3px rgba(255, 215, 0, 0.7)) drop-shadow(0 0 8px rgba(255, 193, 7, 0.4));
            transform: scale(1);
          }
          50% {
            filter: drop-shadow(0 0 6px rgba(255, 235, 59, 0.95)) drop-shadow(0 0 16px rgba(255, 193, 7, 0.7));
            transform: scale(1.05);
          }
        }

        @keyframes bm-star-twinkle-a-${id} {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.22); filter: drop-shadow(0 0 5px #FFE082); }
        }

        @keyframes bm-star-twinkle-b-${id} {
          0%, 100% { opacity: 0.9; transform: scale(1); }
          40% { opacity: 1; transform: scale(1.25); filter: drop-shadow(0 0 5px #FFE082); }
        }

        @keyframes bm-star-twinkle-c-${id} {
          0%, 100% { opacity: 0.82; transform: scale(1); }
          65% { opacity: 1; transform: scale(1.2); filter: drop-shadow(0 0 5px #FFE082); }
        }
      `}</style>

      {/* Outer 3D Canvas Container */}
      <div
        className="relative shrink-0 flex items-center justify-center transition-transform duration-300 ease-out"
        style={{
          width: dim.width,
          height: dim.height,
          transform: tilt.isHovered
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.05)`
            : 'none',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Animated Realistic Ground Shadow */}
        {animated && (
          <div
            className="absolute -bottom-2 w-3/4 h-2.5 bg-black/40 rounded-full blur-[3px] pointer-events-none transition-all duration-300"
            style={{
              animation: animated && !tilt.isHovered ? `bm-shadow-${id} 4.2s ease-in-out infinite` : 'none',
              transform: tilt.isHovered
                ? `translateX(${-tilt.y * 0.8}px) scale(${1 - Math.abs(tilt.x) * 0.02})`
                : undefined,
            }}
          />
        )}

        {/* 3D Floating SVG Emblem */}
        <div
          className="relative w-full h-full"
          style={{
            animation: animated && !tilt.isHovered ? `bm-float-${id} 4.2s ease-in-out infinite` : 'none',
            transformStyle: 'preserve-3d',
          }}
        >
          <svg
            width={dim.width}
            height={dim.height}
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible drop-shadow-md select-none"
          >
            <defs>
              {/* Blue Diamond Gradient with Rich Depth */}
              <linearGradient id={`bmBlueGrad-${id}`} x1="30" y1="20" x2="185" y2="180" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#154ec1" />
                <stop offset="35%" stopColor="#0D3B9C" />
                <stop offset="70%" stopColor="#08256E" />
                <stop offset="100%" stopColor="#03133D" />
              </linearGradient>

              {/* Red 3D Block Front Gradient */}
              <linearGradient id={`bmRedGrad-${id}`} x1="45" y1="35" x2="175" y2="155" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#EF232C" />
                <stop offset="45%" stopColor="#D81720" />
                <stop offset="85%" stopColor="#B30E16" />
                <stop offset="100%" stopColor="#960910" />
              </linearGradient>

              {/* Red Right Extrusion Shading */}
              <linearGradient id={`bmRedRightGrad-${id}`} x1="168" y1="40" x2="182" y2="155" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#7E0A0F" />
                <stop offset="100%" stopColor="#4A0306" />
              </linearGradient>

              {/* Red Bottom Extrusion Shading */}
              <linearGradient id={`bmRedBottomGrad-${id}`} x1="50" y1="140" x2="180" y2="155" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#5E0509" />
                <stop offset="100%" stopColor="#380104" />
              </linearGradient>

              {/* Top Bevel Highlight for Red Block */}
              <linearGradient id={`bmRedTopHighlight-${id}`} x1="50" y1="35" x2="175" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFA4A8" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#FF6B72" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#B30E16" stopOpacity="0.2" />
              </linearGradient>

              {/* Sun & Star Metallic Gold */}
              <linearGradient id={`bmGoldGrad-${id}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFF9A6" />
                <stop offset="35%" stopColor="#FFD54F" />
                <stop offset="70%" stopColor="#FFB300" />
                <stop offset="100%" stopColor="#FF8F00" />
              </linearGradient>

              {/* Specular Sheen Gradient */}
              <linearGradient id={`bmSheenGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.75" />
                <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>

              {/* Clip path for the Front Red Face to sweep specular light */}
              <clipPath id={`bmRedFaceClip-${id}`}>
                <polygon points="48,42 168,36 168,144 48,140" />
              </clipPath>

              {/* Ambient 3D drop shadow */}
              <filter id={`bm3dShadow-${id}`} x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="3" dy="5" stdDeviation="4" floodColor="#000" floodOpacity="0.45" />
              </filter>
            </defs>

            {/* LAYER 1: Deep Blue Diamond & Patriotic Elements (with subtle Parallax) */}
            <g
              filter={`url(#bm3dShadow-${id})`}
              style={{
                transform: tilt.isHovered ? `translate(${tilt.y * 0.15}px, ${-tilt.x * 0.15}px)` : undefined,
                transition: 'transform 0.15s ease-out',
              }}
            >
              {/* Royal Blue Diamond (Rotated Square) */}
              <polygon
                points="115,12 192,92 115,172 38,92"
                fill={`url(#bmBlueGrad-${id})`}
                stroke="#020E2C"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Inner Diamond Bevel border */}
              <polygon
                points="115,18 186,92 115,166 44,92"
                fill="none"
                stroke="#1B4CC5"
                strokeWidth="1.2"
                strokeOpacity="0.6"
              />
            </g>

            {/* Radiant Golden Sun on the Left (with Organic Breathing Animation) */}
            <g
              transform="translate(40, 92)"
              style={{
                animation: animated ? `bm-sun-pulse-${id} 3.2s ease-in-out infinite` : 'none',
                transformOrigin: '40px 92px',
              }}
            >
              {/* Glowing Sun Center Disc */}
              <circle cx="0" cy="0" r="19" fill={`url(#bmGoldGrad-${id})`} stroke="#FFE082" strokeWidth="1" />
              <circle cx="0" cy="0" r="14" fill="#FFE57F" opacity="0.6" />
              
              {/* 8 Golden Sun Rays */}
              {[-80, -60, -40, -20, 0, 20, 40, 60].map((angle, idx) => (
                <path
                  key={idx}
                  d="M -3 0 L -33 -6 L -25 0 L -33 6 Z"
                  fill={`url(#bmGoldGrad-${id})`}
                  stroke="#FFC107"
                  strokeWidth="0.5"
                  transform={`rotate(${angle})`}
                />
              ))}
            </g>

            {/* Three Golden Stars (Top, Right, Bottom) with Realistic Twinkle */}
            {/* Top Star */}
            <g
              transform="translate(115, 26)"
              style={{
                animation: animated ? `bm-star-twinkle-a-${id} 2.6s ease-in-out infinite` : 'none',
                transformOrigin: '115px 26px',
              }}
            >
              <polygon
                points="0,-10 3,-3 10,-3 4,2 6,9 0,5 -6,9 -4,2 -10,-3 -3,-3"
                fill={`url(#bmGoldGrad-${id})`}
                stroke="#FFD54F"
                strokeWidth="0.8"
              />
            </g>

            {/* Right Star */}
            <g
              transform="translate(180, 92)"
              style={{
                animation: animated ? `bm-star-twinkle-b-${id} 3.1s ease-in-out infinite 0.8s` : 'none',
                transformOrigin: '180px 92px',
              }}
            >
              <polygon
                points="0,-10 3,-3 10,-3 4,2 6,9 0,5 -6,9 -4,2 -10,-3 -3,-3"
                fill={`url(#bmGoldGrad-${id})`}
                stroke="#FFD54F"
                strokeWidth="0.8"
              />
            </g>

            {/* Bottom Star */}
            <g
              transform="translate(115, 158)"
              style={{
                animation: animated ? `bm-star-twinkle-c-${id} 2.9s ease-in-out infinite 1.4s` : 'none',
                transformOrigin: '115px 158px',
              }}
            >
              <polygon
                points="0,-10 3,-3 10,-3 4,2 6,9 0,5 -6,9 -4,2 -10,-3 -3,-3"
                fill={`url(#bmGoldGrad-${id})`}
                stroke="#FFD54F"
                strokeWidth="0.8"
              />
            </g>

            {/* LAYER 2: 3D Red Extruded Prism Block (Foreground with Parallax) */}
            <g
              filter={`url(#bm3dShadow-${id})`}
              style={{
                transform: tilt.isHovered ? `translate(${tilt.y * 0.35}px, ${-tilt.x * 0.35}px)` : undefined,
                transition: 'transform 0.15s ease-out',
              }}
            >
              {/* 3D Right Side Extrusion Wall */}
              <polygon
                points="168,36 180,45 180,152 168,144"
                fill={`url(#bmRedRightGrad-${id})`}
                stroke="#3E0205"
                strokeWidth="1"
              />

              {/* 3D Bottom Side Extrusion Wall */}
              <polygon
                points="48,140 168,144 180,152 56,147"
                fill={`url(#bmRedBottomGrad-${id})`}
                stroke="#320103"
                strokeWidth="1"
              />

              {/* 3D Top Bevel Reflection Line */}
              <polygon
                points="48,42 56,38 180,45 168,36"
                fill={`url(#bmRedTopHighlight-${id})`}
              />

              {/* Front Main Red Face */}
              <polygon
                points="48,42 168,36 168,144 48,140"
                fill={`url(#bmRedGrad-${id})`}
                stroke="#8E0A0F"
                strokeWidth="1.5"
              />

              {/* Specular Shimmer / Glass Light Reflection Sweep */}
              {animated && (
                <g clipPath={`url(#bmRedFaceClip-${id})`}>
                  <rect
                    x="20"
                    y="20"
                    width="60"
                    height="160"
                    fill={`url(#bmSheenGrad-${id})`}
                    style={{
                      animation: `bm-sheen-sweep-${id} 4.8s ease-in-out infinite`,
                    }}
                  />
                </g>
              )}

              {/* 3D White "BM" Letters with Deep Drop Shadow */}
              {/* Shadow for Letter B */}
              <path
                d="M 58 58 L 77 58 C 86 58 91 62 91 68 C 91 72 88 75 84 77 C 89 79 93 83 93 90 C 93 98 86 103 76 103 L 58 103 Z"
                fill="#4A0306"
                transform="translate(3.5, 4.5)"
              />
              {/* Front White B */}
              <path
                d="M 58 56 L 77 56 C 86 56 91 60 91 67 C 91 71 88 74 84 76 C 89 78 93 82 93 89 C 93 98 85 103 75 103 L 58 103 Z M 67 65 L 67 73.5 L 75.5 73.5 C 78.5 73.5 81 72 81 69.5 C 81 67 78.5 65 75.5 65 Z M 67 82.5 L 67 94.5 L 76 94.5 C 80 94.5 83 92.5 83 88.5 C 83 84.5 80 82.5 76 82.5 Z"
                fill="#FFFFFF"
                stroke="#ECEFF1"
                strokeWidth="1.2"
              />

              {/* Shadow for Letter M */}
              <path
                d="M 98 58 L 112 58 L 123 85 L 134 58 L 148 58 L 148 103 L 138 103 L 138 75 L 128 99 L 118 99 L 108 75 L 108 103 L 98 103 Z"
                fill="#4A0306"
                transform="translate(3.5, 4.5)"
              />
              {/* Front White M */}
              <path
                d="M 98 56 L 112 56 L 123 83 L 134 56 L 148 56 L 148 103 L 138 103 L 138 73 L 127 98 L 119 98 L 108 73 L 108 103 L 98 103 Z"
                fill="#FFFFFF"
                stroke="#ECEFF1"
                strokeWidth="1.2"
              />

              {/* "BAGONG MARTIREZ" Banner Box at Bottom */}
              <g transform="translate(0, 0)">
                {/* Yellow Box Border */}
                <rect
                  x="52"
                  y="118"
                  width="112"
                  height="18"
                  rx="2"
                  fill="#7A090D"
                  stroke="#FFD54F"
                  strokeWidth="1.5"
                />
                <rect
                  x="53"
                  y="119"
                  width="110"
                  height="16"
                  rx="1"
                  fill="#990B11"
                  stroke="#FFE082"
                  strokeWidth="0.6"
                />
                {/* Crisp Yellow Text */}
                <text
                  x="108"
                  y="131"
                  textAnchor="middle"
                  fill="#FFF59D"
                  fontSize="9.5"
                  fontWeight="900"
                  fontFamily="'Arial Black', Impact, sans-serif"
                  letterSpacing="0.6"
                  style={{
                    filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.6))',
                  }}
                >
                  BAGONG MARTIREZ
                </text>
              </g>
            </g>
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold tracking-tight text-slate-900 leading-none ${dim.text}`}>
            Serbisyong Martirez del '96
          </span>
          <span className={`text-slate-500 font-medium mt-0.5 ${dim.sub}`}>
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
};
