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
  cta: { primary: "Cotizar servicio", secondary: "Conocer Movex" },
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
    id: "portuarias",
    title: "Operaciones Portuarias",
    featured: true,
    image: "/assets/images/01-hero.jpg",
    items: [
      "Trincado y destrincado",
      "Conexión y desconexión a bordo",
      "Estiba y desestiba general",
      "Estiba y desestiba de contenedores",
      "Estiba y desestiba refrigerada",
    ],
  },
  {
    id: "terrestres",
    title: "Operaciones Terrestres",
    image: "/assets/images/terrestres-reach-stacker.jpg",
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
    id: "digital",
    title: "Logística Digital",
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
    image: "/assets/images/global-puerto-dusk.jpg",
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
    image: "/assets/images/03-portuario.jpg",
    items: [
      "Equipos de manipulación",
      "Equipos de seguridad",
      "Equipos de mantenimiento portuario",
    ],
  },
] as const;

export const sustainability = [
  { title: "Impacto Social", body: "Programas sociales en Urabá y Santa Marta.", image: "/assets/images/sostenibilidad-fundacion.jpg" },
  { title: "Bienestar Laboral", body: "Programas integrales para el equipo Movex.", image: "/assets/images/05-sostenibilidad.jpg" },
  { title: "Ambiente", body: "Operaciones con mínimo impacto ecológico.", image: "/assets/images/sostenibilidad-ambiente.jpg" },
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
  { name: "Vancouver", lat: 50.5, lng: -121.5 },
  { name: "Seattle", lat: 47.4, lng: -121.6 },
  { name: "Portland", lat: 45.3, lng: -122.0 },
  { name: "San Francisco", lat: 37.6, lng: -121.6 },
  { name: "Los Angeles", lat: 34.5, lng: -118.0 },
  { name: "Long Beach", lat: 33.9, lng: -117.5 },
  { name: "San Diego", lat: 32.7, lng: -116.8 },
  { name: "Phoenix", lat: 33.4, lng: -111.9 },
  { name: "Houston", lat: 30.5, lng: -95.5 },
  { name: "New Orleans", lat: 30.2, lng: -89.7 },
  { name: "Mobile", lat: 30.7, lng: -88.0 },
  { name: "Savannah", lat: 32.1, lng: -81.0 },
  { name: "Charleston", lat: 32.8, lng: -79.8 },
  { name: "Norfolk", lat: 36.9, lng: -76.2 },
  { name: "Philadelphia", lat: 39.9, lng: -75.0 },
  { name: "New York", lat: 41.2, lng: -74.5 },
  { name: "Boston", lat: 42.4, lng: -71.0 },
  { name: "Halifax", lat: 44.7, lng: -63.6 },
  { name: "Miami", lat: 26.5, lng: -80.5 },
  { name: "Tampa", lat: 27.9, lng: -82.5 },
  { name: "Manzanillo", lat: 20, lng: -103.5 },
  { name: "Veracruz", lat: 19.5, lng: -96.5 },
  { name: "Mazatlán", lat: 23.2, lng: -106.4 },
  { name: "Tijuana", lat: 32.5, lng: -116.9 },
  { name: "Chicago", lat: 41.8, lng: -87.6 },

  // Centroamérica & Caribe
  { name: "Habana", lat: 23.1, lng: -82.4 },
  { name: "Kingston", lat: 18.1, lng: -77.0 },
  { name: "Santo Domingo", lat: 18.7, lng: -70.0 },
  { name: "San Juan", lat: 18.4, lng: -66.1 },
  { name: "Panama", lat: 8.5, lng: -80.5 },
  { name: "San José", lat: 9.9, lng: -84.0 },
  { name: "Limón", lat: 10.0, lng: -83.0 },
  { name: "San Pedro Sula", lat: 15.5, lng: -88.0 },
  { name: "Cartagena", lat: 10.4, lng: -75.5 },
  { name: "Barranquilla", lat: 10.9, lng: -74.8 },

  // Sudamérica
  { name: "Guayaquil", lat: -2.2, lng: -79.9 },
  { name: "Manta", lat: -1.0, lng: -80.7 },
  { name: "Callao", lat: -12, lng: -76.5, from: "apartado" },
  { name: "Iquique", lat: -20.2, lng: -70.1 },
  { name: "Antofagasta", lat: -23.6, lng: -70.4 },
  { name: "Valparaíso", lat: -33, lng: -71, from: "santamarta" },
  { name: "Buenos Aires", lat: -34, lng: -60, from: "apartado" },
  { name: "Montevideo", lat: -34.9, lng: -56.2 },
  { name: "Santos", lat: -23, lng: -47 },
  { name: "Rio de Janeiro", lat: -22, lng: -43.5 },
  { name: "Salvador", lat: -12.9, lng: -38.5 },
  { name: "Belém", lat: -1.4, lng: -48.5 },
  { name: "Manaus", lat: -3.1, lng: -60.0 },

  // Europa occidental
  { name: "Lisbon", lat: 38.7, lng: -9.1 },
  { name: "Porto", lat: 41.1, lng: -8.6 },
  { name: "Algeciras", lat: 37, lng: -5 },
  { name: "Valencia", lat: 39.5, lng: -0.4 },
  { name: "Barcelona", lat: 41.4, lng: 2.2 },
  { name: "Marseille", lat: 43.3, lng: 5.4 },
  { name: "Genoa", lat: 44.4, lng: 8.9 },
  { name: "Naples", lat: 40.8, lng: 14.3 },
  { name: "Athens", lat: 37.9, lng: 23.7 },
  { name: "Istanbul", lat: 41.0, lng: 29.0 },
  { name: "Le Havre", lat: 49, lng: 1.5, from: "apartado" },
  { name: "Antwerp", lat: 50.85, lng: 4.7 },
  { name: "Rotterdam", lat: 52.13, lng: 5.29 },
  { name: "Hamburg", lat: 52.5, lng: 10.5 },
  { name: "Bremen", lat: 53.1, lng: 8.8 },
  { name: "Felixstowe", lat: 51.9, lng: 1.3 },
  { name: "Liverpool", lat: 53.4, lng: -3.0 },
  { name: "Dublin", lat: 53.3, lng: -6.2 },
  { name: "Copenhagen", lat: 55.7, lng: 12.6 },
  { name: "Gothenburg", lat: 57.7, lng: 11.9 },
  { name: "Oslo", lat: 59.9, lng: 10.7 },
  { name: "Gdansk", lat: 54.3, lng: 18.6 },

  // África occidental
  { name: "Casablanca", lat: 33.5, lng: -7.5 },
  { name: "Dakar", lat: 14.6, lng: -17.4 },
  { name: "Abidjan", lat: 5.3, lng: -4.0 },
  { name: "Accra", lat: 5.5, lng: -0.2 },
  { name: "Lagos", lat: 8, lng: 4 },
  { name: "Cape Town", lat: -33.9, lng: 18.4 },
];
