import type { ReactNode } from 'react';

/**
 * Brand icon set (replaces emojis): 2px dark outline + yellow fill, drawn on a 48px grid.
 * Decorative by default; pass `titulo` when the icon carries meaning on its own.
 */
type IconeProps = { className?: string; titulo?: string };

function Svg({ className, titulo, children }: IconeProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'size-11'}
      role={titulo ? 'img' : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
    >
      {children}
    </svg>
  );
}

const A = 'var(--color-amarelo)';

export const IconeSalario = (p: IconeProps) => (
  <Svg {...p}>
    <rect x="6" y="12" width="36" height="26" rx="5" fill={A} />
    <path d="M6 20h36" />
    <circle cx="24" cy="30" r="4.5" fill="#fff" />
  </Svg>
);

export const IconeRelogio = (p: IconeProps) => (
  <Svg {...p}>
    <circle cx="24" cy="27" r="15" fill={A} />
    <path d="M24 18v9l6 4M19 5h10" />
  </Svg>
);

export const IconeGrafico = (p: IconeProps) => (
  <Svg {...p}>
    <path d="M6 41h36" />
    <rect x="9" y="26" width="7" height="15" fill={A} />
    <rect x="21" y="18" width="7" height="23" fill={A} />
    <rect x="33" y="9" width="7" height="32" fill="#fff" />
  </Svg>
);

export const IconeCalendario = (p: IconeProps) => (
  <Svg {...p}>
    <rect x="7" y="10" width="34" height="31" rx="5" fill={A} />
    <path d="M7 19h34M16 6v8M32 6v8" />
    <path d="M17 29l5 5 9-9" />
  </Svg>
);

export const IconeLampada = (p: IconeProps) => (
  <Svg {...p}>
    <path d="M24 6a13 13 0 0 0-7 24c1.5 1 2 2.5 2 4h10c0-1.5.5-3 2-4a13 13 0 0 0-7-24z" fill={A} />
    <path d="M19 40h10M21 44h6" />
  </Svg>
);

export const IconeMegafone = (p: IconeProps) => (
  <Svg {...p}>
    <path d="M8 20v9h6l18 9V11L14 20z" fill={A} />
    <path d="M14 29l3 10h5l-2-8M38 19a7 7 0 0 1 0 11" />
  </Svg>
);

export const IconeRaio = (p: IconeProps) => (
  <Svg {...p}>
    <path d="M27 4L10 27h12l-3 17 18-24H25z" fill={A} />
  </Svg>
);

export const IconeSemLoja = (p: IconeProps) => (
  <Svg {...p}>
    <path d="M8 18l3-10h26l3 10z" fill={A} />
    <path d="M10 18v22h28V18M19 40V29h10v11" />
    <path d="M6 6l36 36" stroke="var(--color-negativo)" />
  </Svg>
);

export const IconeLeve = (p: IconeProps) => (
  <Svg {...p}>
    <path d="M24 6l16 8v20l-16 8-16-8V14z" fill={A} />
    <path d="M8 14l16 8 16-8M24 22v20" />
  </Svg>
);

export const IconeLei = (p: IconeProps) => (
  <Svg {...p}>
    <path d="M12 5h17l9 9v29H12z" fill="#fff" />
    <path d="M29 5v9h9" />
    <circle cx="25" cy="29" r="8" fill={A} />
    <path d="M21.5 29l2.5 2.5 5-5" />
  </Svg>
);

export const IconeCadeado = (p: IconeProps) => (
  <Svg {...p}>
    <rect x="9" y="21" width="30" height="21" rx="4" fill={A} />
    <path d="M16 21v-6a8 8 0 0 1 16 0v6M24 30v4" />
  </Svg>
);

export const IconeGratis = (p: IconeProps) => (
  <Svg {...p}>
    <path d="M6 24L24 6h16v16L22 40z" fill={A} />
    <circle cx="32" cy="14" r="3" fill="#fff" />
    <path d="M15 25l8 8" />
  </Svg>
);

export const IconeDocumento = (p: IconeProps) => (
  <Svg {...p}>
    <path d="M12 5h17l9 9v29H12z" fill={A} />
    <path d="M29 5v9h9M18 24h14M18 31h14M18 38h8" />
  </Svg>
);

export const IconeCelular = (p: IconeProps) => (
  <Svg {...p}>
    <rect x="13" y="4" width="22" height="40" rx="5" fill={A} />
    <path d="M21 38h6" />
    <path d="M18.5 20l4 4 7-8" />
  </Svg>
);

export const IconeCasa = (p: IconeProps) => (
  <Svg {...p}>
    <path d="M6 22L24 7l18 15" />
    <path d="M11 19v22h26V19" fill={A} />
    <path d="M20 41V29h8v12" fill="#fff" />
  </Svg>
);

export const IconeConversa = (p: IconeProps) => (
  <Svg {...p}>
    <path d="M8 10h32v22H22l-9 8v-8H8z" fill={A} />
    <path d="M16 19h16M16 25h10" />
  </Svg>
);

export const IconeSino = (p: IconeProps) => (
  <Svg {...p}>
    <path d="M12 34V22a12 12 0 0 1 24 0v12l4 4H8z" fill={A} />
    <path d="M20 42a4 4 0 0 0 8 0" />
  </Svg>
);
