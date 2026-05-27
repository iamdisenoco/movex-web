/**
 * Hero Reveal — React island con Framer Motion.
 *
 * Por qué Framer Motion en lugar de CSS/JS vanilla:
 *   - Framer Motion maneja TODO el life cycle (mount/update/unmount) en
 *     React, no se confunde con SplitText/Lenis/parallax que corren
 *     paralelo en el resto del proyecto.
 *   - `initial={{...}}` se aplica via JS al mount (no por CSS class), evita
 *     race conditions.
 *   - `animate={{...}}` corre SIEMPRE al mount, sin depender de eventos
 *     externos que puedan no dispararse.
 *   - `staggerChildren` da cascade smooth sin setTimeout manuales.
 *
 * Espera evento `mvx:intro-done` o sessionStorage flag antes de animar.
 */
import { motion, type Variants } from "framer-motion";
import { useEffect, useState } from "react";

type Props = {
  position: "title" | "subtext";
};

// Animations EXAGERADAS para que sean imposibles de no ver
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.4,    // 400ms entre cada elemento (era 180ms)
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 120,                    // 120px de slide (era 60px)
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.6,            // 1.6s duración (era 1.1s)
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function HeroReveal({ position }: Props) {
  // SIMPLE: si sessionStorage tiene mvx_intro_v6 (intro ya vista) → arrancar
  // inmediato. Si no → esperar máximo 6s (duración de intro + buffer) y
  // arrancar pase lo que pase. Sin polling, sin eventos. Brutal pero confiable.
  const [ready, setReady] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("mvx_intro_v6") !== null;
  });

  useEffect(() => {
    if (ready) return;
    // Escuchar el evento (camino rápido)
    const onIntroDone = () => setReady(true);
    window.addEventListener("mvx:intro-done", onIntroDone, { once: true });
    // Safety net agresivo: a los 6s pase lo que pase
    const safety = setTimeout(() => {
      setReady(true);
      // También limpiar el cover por si quedó stuck
      document.documentElement.classList.remove("intro-locked");
      sessionStorage.setItem("mvx_intro_v6", "1");
    }, 6000);
    return () => {
      window.removeEventListener("mvx:intro-done", onIntroDone);
      clearTimeout(safety);
    };
  }, [ready]);

  const animState = ready ? "visible" : "hidden";

  if (position === "title") {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={animState}
        className="max-w-4xl"
      >
        <motion.h1
          variants={itemVariants}
          className="font-display-xl text-[clamp(2.8rem,7.5vw,6.5rem)] leading-[0.92]"
        >
          <span className="block text-white">Conectamos</span>
          <span className="block text-white">tu carga</span>
          <span className="block text-teal-300">con el mundo.</span>
        </motion.h1>
      </motion.div>
    );
  }

  // position === "subtext"
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={animState}
      className="max-w-md sm:max-w-lg lg:max-w-xl text-right"
    >
      <motion.p
        variants={itemVariants}
        className="text-base sm:text-lg leading-relaxed text-white/90 mb-8"
      >
        Soluciones logísticas, portuarias y digitales diseñadas para una
        operación más eficiente, conectada y precisa.
      </motion.p>
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap gap-4 justify-end"
      >
        <a
          href="#quienes-somos"
          className="inline-flex items-center justify-center min-w-[180px] rounded-full bg-teal-500 hover:bg-teal-300 text-navy-900 font-semibold px-7 py-4 text-base transition-all hover:scale-[1.03]"
        >
          Sobre Movex
        </a>
        <a
          href="#contacto"
          className="inline-flex items-center justify-center min-w-[180px] rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold px-7 py-4 text-base transition-all border border-white/25"
        >
          Contáctanos
        </a>
      </motion.div>
    </motion.div>
  );
}
