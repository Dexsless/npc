import { createClient } from "@supabase/supabase-js";

// Configuration
const SUPABASE_URL = "https://dnnrsywfztqetgbzftgh.supabase.co";
const SUPABASE_KEY = "sb_publishable_a0uKcdehjxi8wIRZEq20ZA_hNTz1ZG2"; // Using the key provided in prompt

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const componentsData = [
  {
    name: "Intel Core i9-14900K",
    type: "CPU",
    price: 9500000,
    image_url:
      "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=500&q=80",
    specs: "Socket LGA1700, 24 Cores, up to 6.0 GHz",
    description:
      "Processor flagship terbaru dari Intel untuk gaming dan produktivitas kelas atas.",
    marketplace_link: "https://www.tokopedia.com/search?q=intel%20i9%2014900k",
  },
  {
    name: "AMD Ryzen 7 7800X3D",
    type: "CPU",
    price: 6800000,
    image_url:
      "https://images.unsplash.com/photo-1555618568-9b168a22d7a9?auto=format&fit=crop&w=500&q=80",
    specs: "Socket AM5, 8 Cores, 3D V-Cache",
    description: "Processor gaming terbaik dengan teknologi 3D V-Cache.",
    marketplace_link: "https://www.tokopedia.com/search?q=ryzen%207%207800x3d",
  },
  {
    name: "NVIDIA GeForce RTX 4090",
    type: "GPU",
    price: 32000000,
    image_url:
      "https://images.unsplash.com/photo-1555616635-6409600377c8?auto=format&fit=crop&w=500&q=80",
    specs: "24GB GDDR6X, Ada Lovelace Architecture",
    description: "Kartu grafis terkuat di dunia untuk gaming 4K dan rendering.",
    marketplace_link: "https://www.tokopedia.com/search?q=rtx%204090",
  },
  {
    name: "NVIDIA GeForce RTX 4070",
    type: "GPU",
    price: 9500000,
    image_url:
      "https://images.unsplash.com/photo-1627389955611-7053075b0683?auto=format&fit=crop&w=500&q=80",
    specs: "12GB GDDR6X",
    description: "Kartu grafis mid-high range yang sangat efisien.",
    marketplace_link: "https://www.tokopedia.com/search?q=rtx%204070",
  },
  {
    name: "Kingston Fury Beast 32GB (2x16GB)",
    type: "RAM",
    price: 1800000,
    image_url:
      "https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=500&q=80",
    specs: "DDR5 6000MHz CL36",
    description: "RAM DDR5 kencang dan stabil untuk gaming.",
    marketplace_link:
      "https://www.tokopedia.com/search?q=kingston%20fury%20ddr5%2032gb",
  },
  {
    name: "ASUS ROG Strix Z790-E Gaming WIFI",
    type: "Motherboard",
    price: 8500000,
    image_url:
      "https://images.unsplash.com/photo-1544652478-6653e09f9055?auto=format&fit=crop&w=500&q=80",
    specs: "LGA1700, DDR5, PCIe 5.0, WiFi 6E",
    description: "Motherboard premium dengan fitur lengkap untuk overclocking.",
    marketplace_link: "https://www.tokopedia.com/search?q=rog%20z790-e",
  },
  {
    name: "Samsung 990 PRO 2TB",
    type: "Storage",
    price: 3200000,
    image_url:
      "https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&w=500&q=80",
    specs: "M.2 NVMe Gen4, up to 7450 MB/s",
    description: "SSD NVMe tercepat untuk loading game instan.",
    marketplace_link:
      "https://www.tokopedia.com/search?q=samsung%20990%20pro%202tb",
  },
  {
    name: "Corsair RM1000e",
    type: "PSU",
    price: 2500000,
    image_url:
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=500&q=80",
    specs: "1000W 80+ Gold, ATX 3.0",
    description: "Power supply fully modular dengan efisiensi tinggi.",
    marketplace_link: "https://www.tokopedia.com/search?q=corsair%20rm1000e",
  },
  {
    name: "NZXT H9 Flow",
    type: "Case",
    price: 2800000,
    image_url:
      "https://images.unsplash.com/photo-1558494949-ef010dbacc31?auto=format&fit=crop&w=500&q=80",
    specs: "Mid Tower, Dual Chamber, High Airflow",
    description: "Casing PC estetik dengan airflow maksimal.",
    marketplace_link: "https://www.tokopedia.com/search?q=nzxt%20h9%20flow",
  },
  {
    name: "NZXT Kraken Elite 360",
    type: "Cooler",
    price: 4500000,
    image_url:
      "https://images.unsplash.com/photo-1544731612-de7f96afe55f?auto=format&fit=crop&w=500&q=80",
    specs: "360mm AIO, LCD Display",
    description: "Cooler AIO premium dengan layar LCD custom.",
    marketplace_link:
      "https://www.tokopedia.com/search?q=nzxt%20kraken%20elite%20360",
  },
];

const monitorsData = [
  {
    title: "LG UltraGear 27GR95QE-B",
    description:
      "Monitor gaming OLED pertama di dunia dengan refresh rate 240Hz dan response time 0.03ms.",
    resolution: "2560 x 1440",
    refresh_rate: 240,
    panel_type: "OLED",
    screen_size: 26.5,
    price: 14500000,
    rating: 4.8,
    featured: true,
    image_url:
      "https://m.media-amazon.com/images/I/71J+e-L+e-L._AC_SL1500_.jpg",
  },
  {
    title: "ASUS TUF Gaming VG27AQ",
    description:
      "Monitor gaming value terbaik dengan panel IPS 165Hz dan kompatibilitas G-SYNC.",
    resolution: "2560 x 1440",
    refresh_rate: 165,
    panel_type: "IPS",
    screen_size: 27,
    price: 4500000,
    rating: 4.6,
    featured: true,
    image_url:
      "https://m.media-amazon.com/images/I/71J+e-L+e-L._AC_SL1500_.jpg",
  },
  {
    title: "BenQ ZOWIE XL2546K",
    description:
      "Monitor esports standar turnamen dengan DyAc+ Technology untuk kejernihan gerakan terbaik.",
    resolution: "1920 x 1080",
    refresh_rate: 240,
    panel_type: "TN",
    screen_size: 24.5,
    price: 7200000,
    rating: 4.7,
    featured: false,
    image_url:
      "https://m.media-amazon.com/images/I/71J+e-L+e-L._AC_SL1500_.jpg",
  },
  {
    title: "Samsung Odyssey G9 OLED",
    description:
      "Super ultrawide 49 inch monitor dengan curve 1800R dan panel OLED yang memukau.",
    resolution: "5120 x 1440",
    refresh_rate: 240,
    panel_type: "OLED",
    screen_size: 49,
    price: 24000000,
    rating: 4.9,
    featured: true,
    image_url:
      "https://m.media-amazon.com/images/I/71J+e-L+e-L._AC_SL1500_.jpg",
  },
  {
    title: "KOORUI 24E3",
    description:
      "Monitor gaming budget terbaik, 165Hz IPS panel dengan harga sangat terjangkau.",
    resolution: "1920 x 1080",
    refresh_rate: 165,
    panel_type: "IPS",
    screen_size: 24,
    price: 1600000,
    rating: 4.5,
    featured: false,
    image_url:
      "https://m.media-amazon.com/images/I/71J+e-L+e-L._AC_SL1500_.jpg",
  },
];

async function seed() {
  console.log("Seeding components...");
  const { error: componentsError } = await supabase
    .from("components")
    .upsert(componentsData, { onConflict: "name" }); // Assuming name is unique enough for seeding, or just insert if empty

  if (componentsError) {
    console.error("Error seeding components:", componentsError);
  } else {
    console.log("Components seeded successfully.");
  }

  console.log("Seeding monitors...");
  const { error: monitorsError } = await supabase
    .from("monitors")
    .upsert(monitorsData, { onConflict: "title" }); // Assuming title is unique

  if (monitorsError) {
    console.error("Error seeding monitors:", monitorsError);
  } else {
    console.log("Monitors seeded successfully.");
  }
}

seed();
