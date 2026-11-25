import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import {
  MASCOT_IMAGES,
  resolveSceneArt,
  type StoryImage,
} from "./story-images";

export type ArtVariant = "station" | "city" | "shrine" | "market" | "forest" | "sea";

const VARIANTS: ArtVariant[] = ["station", "city", "shrine", "market", "forest", "sea"];

function hash(input: string): number {
  let value = 0;
  for (let index = 0; index < input.length; index += 1) {
    value = (value * 31 + input.charCodeAt(index)) % 997;
  }
  return value;
}

export function pickArtVariant(seed: string): ArtVariant {
  return VARIANTS[hash(seed) % VARIANTS.length];
}

/**
 * Lightweight, local-only story artwork. It keeps the app fast and offline
 * friendly while echoing the illustrated adventure covers in the design.
 */
export function StoryArtwork({
  variant = "city",
  palette,
  variantSeed,
  className = "",
  overlay = true,
  setting,
  worldId,
  image,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 720px",
  children,
}: {
  variant?: ArtVariant;
  palette?: string | null;
  variantSeed?: string;
  className?: string;
  overlay?: boolean;
  /** Scene setting text from the story content, used to choose fitting art. */
  setting?: string | null;
  /** Story world id, used as a stable seed and for setting hints. */
  worldId?: string | null;
  /** Force one artwork; pass `null` to keep the generated vector fallback. */
  image?: StoryImage | null;
  priority?: boolean;
  sizes?: string;
  children?: ReactNode;
}) {
  const resolved = variantSeed ? pickArtVariant(variantSeed) : variant;
  const tone = palette && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(palette) ? palette : "#006c49";
  const style: CSSProperties = {
    background: `linear-gradient(158deg, ${tone} 0%, var(--exp-inverse-surface) 78%)`,
  };
  const artwork =
    image === null
      ? null
      : (image ??
        resolveSceneArt({
          seed: variantSeed,
          setting,
          worldId,
        }));

  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      {artwork ? (
        <>
          <Image
            src={artwork.src}
            alt=""
            fill
            priority={priority}
            sizes={sizes}
            className="object-cover"
            style={artwork.position ? { objectPosition: artwork.position } : undefined}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-tr from-exp-inverse-surface/35 via-transparent to-exp-secondary-fixed/10"
          />
        </>
      ) : (
        <svg
        viewBox="0 0 400 240"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
      >
        {resolved === "station" && (
          <>
            <circle cx="322" cy="54" r="30" fill="var(--exp-secondary-fixed)" opacity="0.9" />
            <path d="M0 120 Q100 84 200 120 T400 120" stroke="var(--exp-inverse-on-surface)" strokeOpacity="0.25" strokeWidth="3" fill="none" />
            <path d="M40 138 h320 v20 H40z" fill="var(--exp-inverse-surface)" opacity="0.55" />
            <rect x="62" y="132" width="276" height="62" rx="16" fill="var(--exp-primary-fixed-dim)" opacity="0.85" />
            <rect x="84" y="144" width="48" height="24" rx="6" fill="var(--exp-surface)" opacity="0.9" />
            <rect x="144" y="144" width="48" height="24" rx="6" fill="var(--exp-surface)" opacity="0.9" />
            <rect x="204" y="144" width="48" height="24" rx="6" fill="var(--exp-surface)" opacity="0.9" />
            <rect x="264" y="144" width="48" height="24" rx="6" fill="var(--exp-surface)" opacity="0.9" />
            <rect x="58" y="194" width="284" height="8" rx="4" fill="var(--exp-inverse-surface)" opacity="0.6" />
            <g fill="var(--exp-secondary-container)">
              <circle cx="42" cy="92" r="8" />
              <circle cx="106" cy="80" r="6" />
              <circle cx="300" cy="90" r="7" />
            </g>
            <g stroke="var(--exp-inverse-surface)" strokeOpacity="0.5">
              <path d="M0 72 H400" strokeWidth="4" />
              <path d="M24 72 V0" strokeWidth="3" />
              <path d="M376 72 V0" strokeWidth="3" />
            </g>
          </>
        )}
        {resolved === "city" && (
          <>
            <circle cx="318" cy="58" r="26" fill="var(--exp-secondary-fixed)" opacity="0.85" />
            <g fill="var(--exp-inverse-surface)" opacity="0.45">
              <rect x="20" y="108" width="46" height="100" rx="5" />
              <rect x="74" y="86" width="58" height="122" rx="5" />
              <rect x="140" y="118" width="42" height="90" rx="5" />
              <rect x="190" y="70" width="64" height="138" rx="6" />
              <rect x="262" y="104" width="48" height="104" rx="5" />
              <rect x="318" y="92" width="60" height="116" rx="5" />
            </g>
            <g fill="var(--exp-secondary-fixed)" opacity="0.8">
              <rect x="30" y="124" width="8" height="10" rx="2" />
              <rect x="46" y="124" width="8" height="10" rx="2" />
              <rect x="88" y="104" width="8" height="10" rx="2" />
              <rect x="108" y="104" width="8" height="10" rx="2" />
              <rect x="206" y="92" width="9" height="11" rx="2" />
              <rect x="228" y="92" width="9" height="11" rx="2" />
              <rect x="206" y="118" width="9" height="11" rx="2" />
              <rect x="274" y="122" width="8" height="10" rx="2" />
              <rect x="336" y="112" width="9" height="11" rx="2" />
            </g>
            <g fill="var(--exp-primary-fixed-dim)" opacity="0.9">
              <rect x="20" y="200" width="360" height="40" rx="8" />
              <rect x="150" y="156" width="8" height="44" />
              <circle cx="154" cy="150" r="10" fill="var(--exp-secondary-container)" />
            </g>
            <path d="M0 216 Q100 200 200 216 T400 216" stroke="var(--exp-inverse-on-surface)" strokeOpacity="0.25" strokeWidth="3" fill="none" />
          </>
        )}
        {resolved === "shrine" && (
          <>
            <circle cx="200" cy="60" r="34" fill="var(--exp-secondary-fixed)" opacity="0.7" />
            <g fill="var(--exp-inverse-surface)" opacity="0.55">
              <path d="M0 240 L60 120 L130 240 Z" />
              <path d="M280 240 L340 110 L400 240 Z" />
              <path d="M140 240 L200 140 L260 240 Z" opacity="0.6" />
            </g>
            <g fill="var(--exp-error)" opacity="0.9">
              <rect x="110" y="96" width="180" height="12" rx="4" />
              <rect x="122" y="118" width="156" height="10" rx="3" />
              <rect x="140" y="86" width="120" height="10" rx="4" />
              <rect x="136" y="108" width="14" height="112" rx="4" />
              <rect x="250" y="108" width="14" height="112" rx="4" />
            </g>
            <g fill="var(--exp-secondary-container)">
              <circle cx="86" cy="144" r="12" />
              <circle cx="314" cy="136" r="12" />
            </g>
            <path d="M200 240 L168 240 L196 128 L204 128 L232 240 Z" fill="var(--exp-cream)" opacity="0.25" />
          </>
        )}
        {resolved === "market" && (
          <>
            <rect x="0" y="0" width="400" height="240" fill="var(--exp-inverse-surface)" opacity="0.25" />
            <g fill="var(--exp-secondary-container)">
              <circle cx="62" cy="52" r="12" />
              <circle cx="124" cy="44" r="10" />
              <circle cx="314" cy="54" r="13" />
              <circle cx="254" cy="40" r="9" />
            </g>
            <g stroke="var(--exp-inverse-surface)" strokeOpacity="0.4" strokeWidth="2">
              <path d="M0 56 H400" />
            </g>
            <g>
              <path d="M18 140 h108 l-14 -34 H32 Z" fill="var(--exp-error)" opacity="0.9" />
              <rect x="28" y="140" width="88" height="76" rx="8" fill="var(--exp-inverse-surface)" opacity="0.65" />
              <path d="M146 152 h110 l-12 -30 h-86 Z" fill="var(--exp-primary-fixed-dim)" opacity="0.9" />
              <rect x="156" y="152" width="90" height="64" rx="8" fill="var(--exp-inverse-surface)" opacity="0.65" />
              <path d="M276 142 h106 l-12 -32 h-82 Z" fill="var(--exp-tertiary-container)" opacity="0.9" />
              <rect x="286" y="142" width="86" height="74" rx="8" fill="var(--exp-inverse-surface)" opacity="0.65" />
            </g>
            <g stroke="var(--exp-secondary-fixed)" strokeWidth="4" strokeLinecap="round">
              <path d="M54 176 h36" />
              <path d="M184 184 h34" />
              <path d="M312 176 h34" />
            </g>
            <rect x="0" y="216" width="400" height="24" fill="var(--exp-inverse-surface)" opacity="0.5" />
          </>
        )}
        {resolved === "forest" && (
          <>
            <circle cx="302" cy="54" r="28" fill="var(--exp-primary-fixed)" opacity="0.7" />
            <g fill="var(--exp-inverse-surface)" opacity="0.55">
              <path d="M40 240 L40 120 L8 120 L64 48 L120 120 L88 120 L88 240 Z" />
              <path d="M280 240 L280 146 L256 146 L304 84 L352 146 L328 146 L328 240 Z" />
              <path d="M150 240 L150 172 L134 172 L170 128 L206 172 L190 172 L190 240 Z" opacity="0.8" />
            </g>
            <path d="M180 240 Q200 190 220 240 Z" fill="var(--exp-secondary-fixed)" opacity="0.7" />
            <g fill="var(--exp-primary-fixed-dim)" opacity="0.75">
              <circle cx="76" cy="196" r="4" />
              <circle cx="122" cy="220" r="3" />
              <circle cx="330" cy="208" r="4" />
              <circle cx="250" cy="222" r="3" />
            </g>
          </>
        )}
        {resolved === "sea" && (
          <>
            <circle cx="320" cy="52" r="24" fill="var(--exp-surface)" opacity="0.55" />
            <g fill="var(--exp-inverse-surface)" opacity="0.6">
              <path d="M130 180 L150 116 L170 180 Z" />
              <path d="M168 180 L200 100 L232 180 Z" opacity="0.85" />
              <path d="M230 180 L252 130 L274 180 Z" />
              <rect x="116" y="172" width="172" height="22" rx="8" />
            </g>
            <g fill="var(--exp-tertiary-container)" opacity="0.9">
              <rect x="150" y="124" width="10" height="10" rx="5" />
              <rect x="196" y="110" width="10" height="10" rx="5" />
              <rect x="246" y="136" width="10" height="10" rx="5" />
            </g>
            <g stroke="var(--exp-primary-fixed-dim)" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.75">
              <path d="M0 208 Q40 196 80 208 T160 208 T240 208 T320 208 T400 208" />
              <path d="M0 226 Q40 214 80 226 T160 226 T240 226 T320 226 T400 226" />
            </g>
            <g fill="var(--exp-secondary-fixed)" opacity="0.6">
              <circle cx="82" cy="166" r="4" />
              <circle cx="142" cy="156" r="3" />
              <circle cx="304" cy="172" r="4" />
            </g>
          </>
        )}
      </svg>
      )}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-exp-inverse-surface/85 via-exp-inverse-surface/25 to-transparent" />
      )}
      {children}
    </div>
  );
}

export function LangoMascot({
  className = "h-16 w-16",
  hat = "explorer",
  image,
  priority = false,
}: {
  className?: string;
  hat?: "explorer" | "detective" | "none";
  /** Force a specific mascot illustration (defaults to the hat pose). */
  image?: StoryImage;
  priority?: boolean;
}) {
  const artwork =
    image ?? (hat === "detective" ? MASCOT_IMAGES.detective : MASCOT_IMAGES.explorer);

  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden rounded-full bg-exp-primary-fixed align-middle ${className}`}
    >
      <Image
        src={artwork.src}
        alt=""
        fill
        priority={priority}
        sizes="(max-width: 640px) 96px, 256px"
        className="object-cover"
        style={artwork.position ? { objectPosition: artwork.position } : undefined}
      />
    </span>
  );
}
