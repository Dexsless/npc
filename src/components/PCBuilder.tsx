import { useState, useEffect } from "react";
import { api, formatPrice } from "../lib/api";
import { Component, PCBuild, ComponentType } from "../types/component";
import {
  Cpu,
  MonitorPlay,
  HardDrive,
  CircuitBoard,
  Database,
  Zap,
  Box,
  Fan,
  Search,
  Info,
} from "lucide-react";
import MarketplaceButtons from "./MarketplaceButtons";
import ComponentDetailModal from "./ComponentDetailModal";

const BUDGET_ALLOCATION = {
  CPU: 0.25,
  GPU: 0.3,
  RAM: 0.1,
  Motherboard: 0.12,
  Storage: 0.08,
  PSU: 0.07,
  Case: 0.05,
  Cooler: 0.03,
};

const COMPONENT_ICONS = {
  cpu: Cpu,
  gpu: MonitorPlay,
  ram: HardDrive,
  motherboard: CircuitBoard,
  storage: Database,
  psu: Zap,
  case: Box,
  cooler: Fan,
};

export default function PCBuilder() {
  const [budget, setBudget] = useState("");
  const [components, setComponents] = useState<Component[]>([]);
  const [recommendation, setRecommendation] = useState<PCBuild | null>(null);
  const [loading, setLoading] = useState(false);

  // Modes
  const [buildMode, setBuildMode] = useState<"full" | "part">("full");
  const [targetComponent, setTargetComponent] = useState<ComponentType>("GPU");
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(
    null,
  );

  // Filters
  const [platform, setPlatform] = useState<"all" | "intel" | "amd">("all");
  const [gpuType, setGpuType] = useState<"all" | "nvidia" | "amd">("all");

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    const data = await api.getComponents();
    setComponents(data || []);
  };

  const findBestComponent = (
    type: ComponentType,
    maxPrice: number,
    componentPlatform: "all" | "intel" | "amd",
    componentGpuType: "all" | "nvidia" | "amd",
  ): Component | undefined => {
    let typeComponents = components.filter(
      (c) => c.type === type && c.price <= maxPrice,
    );

    // Apply Platform Filter (CPU & Motherboard)
    if (componentPlatform !== "all") {
      if (type === "CPU") {
        typeComponents = typeComponents.filter((c) =>
          c.name.toLowerCase().includes(componentPlatform),
        );
      } else if (type === "Motherboard") {
        const isIntel = (c: Component) =>
          c.name.includes("LGA") ||
          c.name.includes("Z790") ||
          c.name.includes("B760") ||
          c.name.includes("H610");
        const isAmd = (c: Component) =>
          c.name.includes("AM4") ||
          c.name.includes("AM5") ||
          c.name.includes("B650") ||
          c.name.includes("X670");

        if (componentPlatform === "intel")
          typeComponents = typeComponents.filter(isIntel);
        if (componentPlatform === "amd")
          typeComponents = typeComponents.filter(isAmd);
      }
    }

    // Apply GPU Filter
    if (type === "GPU" && componentGpuType !== "all") {
      if (componentGpuType === "nvidia") {
        typeComponents = typeComponents.filter(
          (c) =>
            c.name.toLowerCase().includes("rtx") ||
            c.name.toLowerCase().includes("gtx"),
        );
      } else if (componentGpuType === "amd") {
        typeComponents = typeComponents.filter((c) =>
          c.name.toLowerCase().includes("rx"),
        );
      }
    }

    if (typeComponents.length === 0) {
      // Fallback: strict filter failed, try relaxed filter (ignore price cap but keep type/platform)
      let fallbackComponents = components.filter((c) => c.type === type);

      if (componentPlatform !== "all") {
        if (type === "CPU")
          fallbackComponents = fallbackComponents.filter((c) =>
            c.name.toLowerCase().includes(componentPlatform),
          );
        // Add motherboard logic here if needed for fallback
        if (type === "Motherboard") {
          // minimal fallback logic if needed
        }
      }
      if (type === "GPU" && componentGpuType !== "all") {
        if (componentGpuType === "nvidia")
          fallbackComponents = fallbackComponents.filter(
            (c) =>
              c.name.toLowerCase().includes("rtx") ||
              c.name.toLowerCase().includes("gtx"),
          );
        if (componentGpuType === "amd")
          fallbackComponents = fallbackComponents.filter((c) =>
            c.name.toLowerCase().includes("rx"),
          );
      }

      // If we are in 'part' mode (using full budget), taking the cheapest might be weird if budget is high,
      // but 'maxPrice' passed here is actually the budget. So if nothing is found <= maxPrice,
      // it means even the cheapest is too expensive OR filters are too strict.
      // Ideally we return undefined if truly nothing fits.
      // But let's stick to returning the cheapest valid one as a "closest match".
      return fallbackComponents.sort((a, b) => a.price - b.price)[0];
    }

    // Return the most expensive one that fits in budget (best performance logic)
    return typeComponents.reduce((best, current) => {
      const bestDiff = maxPrice - best.price;
      const currentDiff = maxPrice - current.price;
      return currentDiff < bestDiff ? current : best;
    });
  };

  const generateRecommendation = () => {
    if (!budget || parseFloat(budget) <= 0) {
      alert("Masukkan budget yang valid!");
      return;
    }

    setLoading(true);
    const totalBudget = parseFloat(budget);
    const build: PCBuild = { totalPrice: 0 };

    if (buildMode === "full") {
      Object.entries(BUDGET_ALLOCATION).forEach(([type, allocation]) => {
        const maxPrice = totalBudget * allocation;
        const component = findBestComponent(
          type as ComponentType,
          maxPrice,
          platform,
          gpuType,
        );
        if (component) {
          const key = type.toLowerCase() as keyof Omit<PCBuild, "totalPrice">;
          // @ts-ignore - dynamic assignment
          build[key] = component;
          build.totalPrice += component.price;
        }
      });
    } else {
      // Single Component Mode
      // Use nearly 100% of budget (maybe keep a tiny buffer? No, let's use 100%)
      const component = findBestComponent(
        targetComponent,
        totalBudget,
        platform,
        gpuType,
      );

      if (component) {
        const key = targetComponent.toLowerCase() as keyof Omit<
          PCBuild,
          "totalPrice"
        >;
        // @ts-ignore
        build[key] = component;
        build.totalPrice = component.price;
      }
    }

    setRecommendation(build);
    setLoading(false);
  };

  const budgetSuggestions = [
    5000000, 8000000, 12000000, 15000000, 20000000, 30000000,
  ];

  const componentTypes: ComponentType[] = [
    "CPU",
    "GPU",
    "Motherboard",
    "RAM",
    "Storage",
    "PSU",
    "Case",
    "Cooler",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 mb-6 tracking-tight">
          Rakit PC Impian dalam Sekejap
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
          Gunakan algoritma pintar kami untuk mendapatkan kombinasi spesifikasi
          komputer terbaik sesuai anggaran Anda. Pasti cepat, akurat, dan optimal.
        </p>
      </div>

      {/* Input Section */}
      <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full"></div>

        <div className="relative z-10">
          {/* Mode Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button
              onClick={() => {
                setBuildMode("full");
                setRecommendation(null);
              }}
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${buildMode === "full"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
                }`}
            >
              Full Rakitan FC
            </button>
            <button
              onClick={() => {
                setBuildMode("part");
                setRecommendation(null);
              }}
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${buildMode === "part"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
                }`}
            >
              Cari Komponen Satuan
            </button>
          </div>

          <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">
            {buildMode === "full"
              ? "Total Anggaran (IDR)"
              : "Anggaran Maksimal (IDR)"}
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-slate-400 font-semibold group-focus-within:text-blue-500 transition-colors">
                Rp
              </span>
            </div>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Contoh: 10000000"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition-all font-bold text-slate-800 placeholder:font-normal placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap gap-2 mt-4 mb-6">
            {budgetSuggestions.map((amount) => (
              <button
                key={amount}
                onClick={() => setBudget(amount.toString())}
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:scale-105 transition-all"
              >
                {formatPrice(amount)}
              </button>
            ))}
          </div>

          {buildMode === "part" && (
            <div className="mb-6 animate-fade-in">
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Pilih Jenis Komponen
              </label>
              <div className="grid grid-cols-2 gap-2">
                {componentTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setTargetComponent(type)}
                    className={`py-2 px-3 text-sm font-bold rounded-lg border-2 transition-all ${targetComponent === type
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filters - Only show relevant filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Show Platform filter if Full Mode OR (Part Mode AND (CPU or Mobo selected)) */}
            {(buildMode === "full" ||
              (buildMode === "part" &&
                (targetComponent === "CPU" ||
                  targetComponent === "Motherboard"))) && (
                <div className="flex-1 animate-fade-in">
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                    Platform Processor
                  </label>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                      onClick={() => setPlatform("all")}
                      className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${platform === "all"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setPlatform("intel")}
                      className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${platform === "intel"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                      Intel
                    </button>
                    <button
                      onClick={() => setPlatform("amd")}
                      className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${platform === "amd"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                      AMD
                    </button>
                  </div>
                </div>
              )}

            {/* Show GPU Filter if Full Mode OR (Part Mode AND GPU selected) */}
            {(buildMode === "full" ||
              (buildMode === "part" && targetComponent === "GPU")) && (
                <div className="flex-1 animate-fade-in">
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                    Jenis GPU
                  </label>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                      onClick={() => setGpuType("all")}
                      className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${gpuType === "all"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setGpuType("nvidia")}
                      className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${gpuType === "nvidia"
                        ? "bg-white text-green-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                      NVIDIA
                    </button>
                    <button
                      onClick={() => setGpuType("amd")}
                      className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${gpuType === "amd"
                        ? "bg-white text-red-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                      Radeon
                    </button>
                  </div>
                </div>
              )}
          </div>

          <button
            onClick={generateRecommendation}
            disabled={loading}
            className="w-full mt-8 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Menganalisis...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>
                  {buildMode === "full" ? "Buat Rakitan PC" : "Cari Komponen"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {recommendation && (
        <div className="mt-20 animate-slide-up">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></span>
              {buildMode === "full"
                ? "Rekomendasi Spesifikasi"
                : `Rekomendasi ${targetComponent}`}
            </h2>
            <div className="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-xl border border-emerald-100 flex flex-col items-end">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600/70">
                {buildMode === "full" ? "Total Estimasi" : "Harga Terbaik"}
              </span>
              <span className="text-2xl font-black tracking-tight">
                {formatPrice(recommendation.totalPrice)}
              </span>
            </div>
          </div>

          <div
            className={`grid gap-6 ${buildMode === "full" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 max-w-lg mx-auto"}`}
          >
            {Object.entries(recommendation)
              .filter(([key]) => key !== "totalPrice")
              .map(([key, component], index) => {
                const Icon =
                  COMPONENT_ICONS[key as keyof typeof COMPONENT_ICONS] || Box;
                return (
                  <div
                    key={key}
                    className={`bg-white p-6 rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl hover:border-blue-200 transition-all group duration-300 ${buildMode === "part" ? "border-l-4 border-l-blue-500" : ""}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                        <Icon size={24} />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded-md uppercase tracking-wider">
                        {key}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div
                        className={`${buildMode === "part" ? "h-48" : "h-32"} rounded-xl bg-slate-50 flex items-center justify-center p-4 group-hover:bg-slate-50/50 transition-colors`}
                      >
                        {/* Placeholder for component image if available, else generic placeholder */}
                        <img
                          src={
                            (component as Component).image_url ||
                            "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=300&h=300"
                          }
                          alt={(component as Component).name}
                          className="w-full h-full object-contain mix-blend-multiply filter group-hover:brightness-110 transition-all duration-300"
                        />
                      </div>
                      <div>
                        <h3
                          className={`font-bold text-slate-800 leading-tight ${buildMode === "part" ? "text-xl" : "line-clamp-2 min-h-[2.5rem]"} group-hover:text-blue-600 transition-colors`}
                        >
                          {(component as Component).name}
                        </h3>
                        {buildMode === "part" && (
                          <p className="text-sm text-slate-500 mt-1 mb-2 line-clamp-2">
                            {(component as Component).description}
                          </p>
                        )}
                        <p className="text-blue-600 font-bold mt-2 text-lg">
                          {formatPrice((component as Component).price)}
                        </p>
                      </div>
                      <MarketplaceButtons
                        name={(component as Component).name}
                        links={(component as Component).marketplace_links}
                      />
                      <button
                        onClick={() => setSelectedComponent(component as Component)}
                        className="w-full mt-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Info size={16} />
                        Lihat Detail
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {selectedComponent && (
        <ComponentDetailModal
          component={selectedComponent}
          onClose={() => setSelectedComponent(null)}
        />
      )}
    </div>
  );
}
