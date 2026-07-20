/**
 * Hero Reveal — CSS keyframes puro, SSR-safe.
 *
 * Por qué keyframes y NO state-based reveal (intentos previos):
 *   - Framer Motion: salta `initial="hidden"` cuando ready=true al mount
 *     (sessionStorage flag re-seteada antes de paint).
 *   - useState + useEffect: React hidrata tan rápido en dev (HMR/Vite) que
 *     el primer paint nunca captura `mounted=false`. La transition CSS
 *     entonces se aplica entre dos estados idénticos → invisible.
 *
 * Solución: CSS keyframes con `animation-fill-mode: backwards` en
 * global.css. El browser aplica el estado del primer frame ANTES del
 * animation-delay, sin depender de JS. Stagger vía `--hero-reveal-delay`.
 *
 * El componente sigue siendo client:load porque el subtexto usa anchors
 * con href interno (suficiente como server-side, pero conservamos React
 * para coherencia con el resto del Hero por si crece el comportamiento).
 */

type Props = {
  position: "title" | "subtext";
};

export default function HeroReveal({ position }: Props) {
  if (position === "title") {
    return (
      <div className="max-w-4xl">
        <h1 className="font-display-xl text-[clamp(2.2rem,7.5vw,6.5rem)] leading-[0.92]">
          <span
            data-hero-reveal
            className="block text-white"
            style={{ "--hero-reveal-delay": "150ms" } as React.CSSProperties}
          >
            Tu carga,
          </span>
          <span
            data-hero-reveal
            className="block text-white"
            style={{ "--hero-reveal-delay": "320ms" } as React.CSSProperties}
          >
            en las
          </span>
          <span
            data-hero-reveal
            className="block text-teal-300"
            style={{ "--hero-reveal-delay": "490ms" } as React.CSSProperties}
          >
            mejores manos.
          </span>
        </h1>
      </div>
    );
  }

  // position === "subtext"
  return (
    <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl text-left lg:text-right">
      <p
        data-hero-reveal
        className="text-base sm:text-lg leading-relaxed text-white/90 mb-8"
        style={{ "--hero-reveal-delay": "780ms" } as React.CSSProperties}
      >
        Soluciones logísticas, portuarias y digitales diseñadas para una
        operación más eficiente, conectada y precisa.
      </p>
      <div
        data-hero-reveal
        className="flex flex-col sm:flex-row flex-wrap gap-4 justify-start lg:justify-end"
        style={{ "--hero-reveal-delay": "980ms" } as React.CSSProperties}
      >
        <a
          href="#quienes-somos"
          data-magnetic
          data-ripple
          className="mvx-shimmer inline-flex items-center justify-center w-full sm:w-auto sm:min-w-[180px] rounded-full bg-teal-500 hover:bg-teal-300 text-white font-semibold px-7 py-4 text-base transition-colors"
        >
          <span>Sobre Movex</span>
        </a>
        <a
          href="#contacto"
          data-magnetic
          data-ripple
          className="inline-flex items-center justify-center w-full sm:w-auto sm:min-w-[180px] rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold px-7 py-4 text-base transition-colors border border-white/25"
        >
          <span>Contáctanos</span>
        </a>
      </div>
    </div>
  );
}
