import { useState } from "react";
import { Monitor } from "../types/monitor";
import { formatPrice } from "../lib/api";
import { Star, Heart } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import MarketplaceButtons from "./MarketplaceButtons";
import MonitorModal from "./MonitorModal";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const [selectedMonitor, setSelectedMonitor] = useState<Monitor | null>(null);

  const getRatingColor = (rating: number) => {
    if (rating >= 4.7) return "text-red-600";
    if (rating >= 4.5) return "text-orange-600";
    return "text-yellow-600";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Heart className="text-red-500 fill-current" />
            Wishlist Saya
          </h1>
          <p className="text-slate-600">
            Daftar monitor impian yang Anda simpan.
          </p>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
            <Heart size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              Wishlist Kosong
            </h3>
            <p className="text-slate-600">
              Anda belum menambahkan monitor apapun ke wishlist.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((monitor) => (
              <div
                key={monitor.id}
                onClick={() => setSelectedMonitor(monitor)}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200 group flex flex-col h-full cursor-pointer hover:shadow-lg transition-all"
              >
                <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden flex-shrink-0">
                  {monitor.image_url && (
                    <img
                      src={monitor.image_url}
                      alt={monitor.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWishlist(monitor);
                    }}
                    className="absolute top-3 right-3 bg-white/90 p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                    title="Hapus dari wishlist"
                  >
                    <Heart size={20} className="fill-current" />
                  </button>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-slate-800 mb-2 line-clamp-1">
                    {monitor.title}
                  </h3>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-700">
                      {monitor.resolution}
                    </span>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-700">
                      {monitor.refresh_rate}Hz
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-auto mb-4">
                    <div className="text-xl font-bold text-slate-800">
                      {formatPrice(monitor.price)}
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
