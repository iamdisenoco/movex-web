// Single source of truth for site copy and structure.
// All placeholders {{...}} are filled by the client.

export const brand = {
  name: "Movex",
  tagline: "Avance & Movilidad",
  parent: "Cargoban Group",
  established: 2012,
  origin: { lat: 7.88, lng: -76.62, city: "Apartadó" },
  secondaryOrigin: { lat: 11.24, lng: -74.2, city: "Santa Marta" },
} as const;

export const nav = [
  { label: "Quiénes Somos", href: "#quienes-somos" },
  { label: "Servicios", href: "#servicios" },
  { label: "Sostenibilidad", href: "#sostenibilidad" },
  { label: "Contacto", href: "#contacto" },
] as const;

export const hero = {
  marquee: ["AVANCE", "MOVILIDAD", "PRECISIÓN"] as const,
  accentWord: "MOVILIDAD",
  subtitle: brand.tagline,
  description:
    "Operador logístico portuario premium para carga internacional desde Apartadó y Santa Marta hacia el mundo.",
  cta: { primary: "Cotizar carga", secondary: "Conocer Movex" },
} as const;

// Counters provisionales — el cliente ajusta los números reales sin tocar el código.
// La animación countup (ver Layout.astro) lee el atributo data-countup y anima 0→target.
export const counters = [
  { value: "250000", label: "Cajas movilizadas" },
  { value: "18000", label: "Contenedores al año" },
  { value: "45", label: "Vehículos en flota" },
  { value: "28", label: "Países atendidos" },
] as const;

export const timeline = [
  { year: 2012, label: "Fundación Cargoban", detail: "Inicio de operaciones en Apartadó." },
  { year: 2018, label: "Expansión Santa Marta", detail: "Apertura de operaciones portuarias en el Caribe." },
  { year: 2024, label: "Logística Digital", detail: "Plataforma de trazabilidad y cadena de frío." },
  { year: 2026, label: "Movex Internacional", detail: "Lanzamiento de la marca premium global." },
] as const;

export const services = [
  {
    id: "terrestres",
    title: "Operaciones Terrestres",
    image: "/assets/images/02-terrestre.jpg",
    items: [
      "Descargue de camiones",
      "Consolidación de contenedores",
      "Desconsolidación de contenedores",
      "Apoyo a inspecciones",
      "Inspecciones de calidad",
      "Etiquetado",
      "Operación de equipos portuarios",
      "Mantenimiento portuario",
      "Alistamiento de contenedores",
      "Auxiliares de grúa",
    ],
  },
  {
    id: "portuarias",
    title: "Operaciones Portuarias",
    image: "/assets/images/03-portuario.jpg",
    items: [
      "Trincado y destrincado",
      "Conexión y desconexión a bordo",
      "Estiba y desestiba general",
      "Estiba y desestiba de contenedores",
      "Estiba y desestiba refrigerada",
    ],
  },
  {
    id: "digital",
    title: "Logística Digital",
    featured: true,
    image: "/assets/images/04-digital-dashboard.jpg",
    items: [
      "Trazabilidad integral",
      "Auditoría de cadena de frío",
      "Consultoría de procesos",
      "Tarja y chequeo",
      "Software a medida",
    ],
  },
  {
    id: "global",
    title: "Logística Global",
    image: "/assets/images/01-hero.jpg",
    items: [
      "Gestión segura de carga",
      "Asesoramiento de transporte",
      "Coordinación marítimo y terrestre",
      "Agenciamiento aduanero",
    ],
  },
  {
    id: "alquiler",
    title: "Alquiler de Equipos",
    image: "/assets/images/02-terrestre.jpg",
    items: [
      "Equipos de manipulación",
      "Equipos de seguridad",
      "Equipos de mantenimiento portuario",
    ],
  },
] as const;

export const sustainability = [
  { title: "Fundación Movex", body: "Programas sociales en Urabá y Santa Marta." },
  { title: "FONDECAR", body: "Apoyo educativo a familias colaboradoras." },
  { title: "Bienestar Laboral", body: "Programas integrales para el equipo Movex." },
  { title: "Ambiente", body: "Operaciones con mínimo impacto ecológico." },
] as const;

export const contact = {
  whatsapp: "{{WHATSAPP}}",
  primary: { city: "Apartadó", address: "{{DIR_APARTADO}}", tel: "{{TEL_APARTADO}}", email: "info@movex.com.co" },
  secondary: { city: "Santa Marta", address: "{{DIR_SM}}", tel: "{{TEL_SM}}", email: "santamarta@movex.com.co" },
} as const;

/**
 * 22 destinos comerciales internacionales usados por la intro 3D.
 * TODOS están en el hemisferio visible desde Colombia (centro vista lat 4.5°, lng -74°),
 * por lo que los arcos completos quedan dentro del marco visible — sin partes
 * cruzando el Pacífico abierto.
 * Coordenadas desplazadas tierra adentro respecto al puerto, hacia el centroide
 * del país, para que cada dot caiga sobre tierra en el dataset 110m simplificado.
 */
export const introDestinations: Array<{ name: string; lat: number; lng: number; from?: "apartado" | "santamarta" | "colombia" }> = [
  // Norteamérica
  { name: "Vancouver", lat: 50.5, lng: -121.5 },    // BC interior
  { name: "Los Angeles", lat: 34.5, lng: -118.0 },  // California inland
  { name: "Long Beach", lat: 33.9, lng: -117.5 },   // LA basin inland
  { name: "Houston", lat: 30.5, lng: -95.5 },       // Texas inland
  { name: "New York", lat: 41.2, lng: -74.5 },      // NY/NJ inland
  { name: "Miami", lat: 26.5, lng: -80.5 },         // Florida interior
  { name: "Manzanillo", lat: 20, lng: -103.5 },     // Jalisco interior
  { name: "Veracruz", lat: 19.5, lng: -96.5 },      // Mexico east coast inland

  // Centroamérica & Caribe
  { name: "Kingston", lat: 18.1, lng: -77.0 },      // Jamaica interior
  { name: "Santo Domingo", lat: 18.7, lng: -70.0 }, // DR interior
  { name: "Panama", lat: 8.5, lng: -80.5 },         // Panama interior

  // Sudamérica
  { name: "Callao", lat: -12, lng: -76.5, from: "apartado" }, // Lima interior
  { name: "Valparaíso", lat: -33, lng: -71, from: "santamarta" }, // Central Chile
  { name: "Buenos Aires", lat: -34, lng: -60, from: "apartado" }, // Pampas interior
  { name: "Santos", lat: -23, lng: -47 },           // São Paulo interior
  { name: "Rio de Janeiro", lat: -22, lng: -43.5 }, // RJ interior

  // Europa occidental (hemisferio visible)
  { name: "Algeciras", lat: 37, lng: -5 },          // Andalucía interior
  { name: "Le Havre", lat: 49, lng: 1.5, from: "apartado" }, // Normandy interior
  { name: "Antwerp", lat: 50.85, lng: 4.7 },        // Belgium interior
  { name: "Rotterdam", lat: 52.13, lng: 5.29 },     // Netherlands centroid
  { name: "Hamburg", lat: 52.5, lng: 10.5 },        // Germany north

  // África occidental
  { name: "Lagos", lat: 8, lng: 4 },                // Nigeria south interior
];
