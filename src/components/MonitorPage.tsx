import { useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { api, formatPrice } from "../lib/api";
import { Search, Star, Zap, Grid3x3, List, Filter, Heart } from "lucide-react";
import { Monitor } from "../types/monitor";
import MarketplaceButtons from "./MarketplaceButtons";
import { useWishlist } from "../context/WishlistContext";
import MonitorModal from "./MonitorModal";

type FilterType = "all" | "gaming" | "professional" | "budget";
type ViewType = "grid" | "list";

export default function MonitorPage() {
  const { isInWishlist } = useWishlist();

  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [filteredMonitors, setFilteredMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewType, setViewType] = useState<ViewType>("grid");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [selectedMonitor, setSelectedMonitor] = useState<Monitor | null>(null);

  const applyFilters = useCallback(() => {
    let filtered = [...monitors];

    filtered = filtered.filter(
      (m) =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    if (filterType === "gaming") {
      filtered = filtered.filter((m) => m.refresh_rate >= 144);
    } else if (filterType === "professional") {
      filtered = filtered.filter((m) => m.screen_size >= 27);
    } else if (filterType === "budget") {
      filtered = filtered.filter((m) => m.price <= 4500000); // Adjusted for IDR
    }

    setFilteredMonitors(filtered);
  }, [monitors, searchQuery, filterType]);

  useEffect(() => {
    fetchMonitors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Animate cards when filteredMonitors changes
  useEffect(() => {
    if (filteredMonitors.length > 0) {
      gsap.fromTo(
        ".monitor-card",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.2)",
          clearProps: "all", // Clean up to avoid conflict with hover effects
        },
      );
    }
  }, [filteredMonitors, viewType]);

  const fetchMonitors = async () => {
    const data = await api.getMonitors();
    setMonitors(data);
    setLoading(false);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.7) return "text-red-600";
    if (rating >= 4.5) return "text-orange-600";
    return "text-yellow-600";
  };

  const getResolutionBadgeColor = (resolution: string) => {
    if (resolution.includes("3840")) return "bg-purple-100 text-purple-700";
    if (resolution.includes("2560")) return "bg-blue-100 text-blue-700";
    return "bg-slate-100 text-slate-700";
  };

  const getPanelTypeBadgeColor = (panelType: string) => {
    if (panelType === "IPS") return "bg-green-100 text-green-700";
    if (panelType === "VA") return "bg-indigo-100 text-indigo-700";
    return "bg-orange-100 text-orange-700";
  };

  const featuredMonitors = monitors.filter((m) => m.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg">
              <Zap className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-800">
                Monitor Katalog
              </h1>
              <p className="text-slate-600 text-lg">
                Temukan monitor PC terbaik untuk kebutuhan Anda
              </p>
            </div>
          </div>
        </div>

        {featuredMonitors.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Star size={24} className="text-yellow-500" />
              Monitor Rekomendasi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredMonitors.map((monitor) => (
                <div
                  key={monitor.id}
                  className="monitor-card bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border-2 border-yellow-200 cursor-pointer group"
                  onClick={() => setSelectedMonitor(monitor)}
                >
                  <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                    {monitor.image_url && (
                      <img
                        src={monitor.image_url}
                        alt={monitor.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                      <Star size={14} className="fill-current" />
                      Featured
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                      {monitor.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                      {monitor.description}
                    </p>

                    <div className="flex gap-2 mb-4 flex-wrap">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${getResolutionBadgeColor(
                          monitor.resolution,
                        )}`}
                      >
                        {monitor.resolution}
                      </span>
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-cyan-100 text-cyan-700">
                        {monitor.refresh_rate}Hz
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${getPanelTypeBadgeColor(
                          monitor.panel_type,
                        )}`}
                      >
                        {monitor.panel_type}
                      </span>
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {monitor.screen_size}"
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-2xl font-bold text-slate-800">
                          {formatPrice(monitor.price)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star
                          size={16}
                          className={`fill-current ${getRatingColor(
                            monitor.rating,
                          )}`}
                        />
                        <span
                          className={`font-semibold ${getRatingColor(
                            monitor.rating,
                          )}`}
                        >
                          {monitor.rating}/5
                        </span>
                      </div>
                    </div>

                    <MarketplaceButtons
                      name={monitor.title}
                      links={monitor.marketplace_links}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-slate-200">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
            <div className="flex-1 max-w-md relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Cari monitor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setViewType("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewType === "grid"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}
              >
                <Grid3x3 size={20} />
              </button>
              <button
                onClick={() => setViewType("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewType === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                filterType === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              <Filter size={16} />
              Semua Monitor
            </button>
            <button
              onClick={() => setFilterType("gaming")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterType === "gaming"
                  ? "bg-red-600 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              Gaming (144Hz+)
            </button>
            <button
              onClick={() => setFilterType("professional")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterType === "professional"
                  ? "bg-purple-600 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              Professional (27"+)
            </button>
            <button
              onClick={() => setFilterType("budget")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterType === "budget"
                  ? "bg-green-600 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              Budget (&lt; 4.5jt)
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-blue-600"></div>
            <p className="mt-4 text-slate-600">Memuat monitor...</p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-sm text-slate-600 font-medium">
              {filteredMonitors.length} monitor ditemukan
            </div>

            {filteredMonitors.length > 0 ? (
              viewType === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {filteredMonitors.map((monitor) => (
                    <div
                      key={monitor.id}
                      className="monitor-card bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden cursor-pointer border border-slate-200 hover:border-blue-300 group"
                      onClick={() => setSelectedMonitor(monitor)}
                    >
                      <div className="relative h-40 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                        {monitor.image_url && (
                          <img
                            src={monitor.image_url}
                            alt={monitor.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                        {isInWishlist(monitor.id) && (
                          <div className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-500 shadow-sm">
                            <Heart size={16} className="fill-current" />
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="font-bold text-slate-800 mb-1 line-clamp-1">
                          {monitor.title}
                        </h3>
                        <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                          {monitor.description}
                        </p>

                        <div className="flex gap-1 mb-3 flex-wrap">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded ${getResolutionBadgeColor(
                              monitor.resolution,
                            )}`}
                          >
                            {monitor.resolution}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-100 text-cyan-700">
                            {monitor.refresh_rate}Hz
                          </span>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded ${getPanelTypeBadgeColor(
                              monitor.panel_type,
                            )}`}
                          >
                            {monitor.panel_type}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                          <div className="text-lg font-bold text-slate-800">
                            {formatPrice(monitor.price)}
                          </div>
                          <div className="flex items-center gap-0.5">
                            <Star
                              size={14}
                              className={`fill-current ${getRatingColor(
                                monitor.rating,
                              )}`}
                            />
                            <span
                              className={`text-sm font-semibold ${getRatingColor(
                                monitor.rating,
                              )}`}
                            >
                              {monitor.rating}
                            </span>
                          </div>
                        </div>

                        <MarketplaceButtons
                          name={monitor.title}
                          links={monitor.marketplace_links}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 mb-12">
                  {filteredMonitors.map((monitor) => (
                    <div
                      key={monitor.id}
                      className="monitor-card bg-white rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden cursor-pointer border border-slate-200 hover:border-blue-300 p-4 flex gap-4 group"
                      onClick={() => setSelectedMonitor(monitor)}
                    >
                      <div className="relative w-32 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                        {monitor.image_url && (
                          <img
                            src={monitor.image_url}
                            alt={monitor.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                        {isInWishlist(monitor.id) && (
                          <div className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-500 shadow-sm">
                            <Heart size={14} className="fill-current" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800 mb-1">
                          {monitor.title}
                        </h3>
                        <p className="text-sm text-slate-600 mb-2">
                          {monitor.description}
                        </p>

                        <div className="flex gap-2 flex-wrap mb-2">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded ${getResolutionBadgeColor(
                              monitor.resolution,
                            )}`}
                          >
                            {monitor.resolution}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-100 text-cyan-700">
                            {monitor.refresh_rate}Hz
                          </span>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded ${getPanelTypeBadgeColor(
                              monitor.panel_type,
                            )}`}
                          >
                            {monitor.panel_type}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                            {monitor.screen_size}"
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-center gap-2">
                        <div className="text-2xl font-bold text-slate-800">
                          {formatPrice(monitor.price)}
                        </div>
                        <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100">
                          <Star
                            size={16}
                            className={`fill-current ${getRatingColor(
                              monitor.rating,
                            )}`}
                          />
                          <span
                            className={`font-semibold text-sm ${getRatingColor(
                              monitor.rating,
                            )}`}
                          >
                            {monitor.rating}
                          </span>
                        </div>
                      </div>

                      <div className="px-4 pb-4 md:pl-4 md:pb-4 md:pt-0 pt-0 w-full md:w-auto self-center">
                        <MarketplaceButtons
                          name={monitor.title}
                          links={monitor.marketplace_links}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center border border-slate-200">
                <Search size={48} className="mx-auto text-slate-400 mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  Monitor Tidak Ditemukan
                </h3>
                <p className="text-slate-600">
                  Coba ubah filter atau pencarian Anda
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {selectedMonitor && (
        <MonitorModal
          monitor={selectedMonitor}
          onClose={() => setSelectedMonitor(null)}
        />
      )}
    </div>
  );
}
