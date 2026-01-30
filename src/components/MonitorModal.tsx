import { createPortal } from "react-dom";
import { Star, Heart } from "lucide-react";
import { Monitor } from "../types/monitor";
import { formatPrice } from "../lib/api";
import MarketplaceButtons from "./MarketplaceButtons";
import { useWishlist } from "../context/WishlistContext";

interface MonitorModalProps {
  monitor: Monitor;
  onClose: () => void;
}

export default function MonitorModal({ monitor, onClose }: MonitorModalProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const getRatingColor = (rating: number) => {
    if (rating >= 4.7) return "text-red-600";
    if (rating >= 4.5) return "text-orange-600";
    return "text-yellow-600";
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999] overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative z-10 my-auto animate-fade-in">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-3xl font-bold text-slate-800">{monitor.title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="h-64 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg overflow-hidden">
            {monitor.image_url && (
              <img
                src={monitor.image_url}
                alt={monitor.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div>
            <p className="text-slate-600 mb-4">{monitor.description}</p>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-600">Resolution</span>
                <span className="font-semibold text-slate-800">
                  {monitor.resolution}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-600">Refresh Rate</span>
                <span className="font-semibold text-slate-800">
                  {monitor.refresh_rate}Hz
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-600">Panel Type</span>
                <span className="font-semibold text-slate-800">
                  {monitor.panel_type}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-600">Screen Size</span>
                <span className="font-semibold text-slate-800">
                  {monitor.screen_size}"
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-4xl font-bold text-slate-800">
                  {formatPrice(monitor.price)}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center mb-1">
                  <Star
                    size={20}
                    className={`fill-current ${getRatingColor(monitor.rating)}`}
                  />
                  <span
                    className={`text-2xl font-bold ${getRatingColor(
                      monitor.rating,
                    )}`}
                  >
                    {monitor.rating}
                  </span>
                </div>
                <span className="text-sm text-slate-600">/5 Rating</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (isInWishlist(monitor.id)) {
                  removeFromWishlist(monitor);
                } else {
                  addToWishlist(monitor);
                }
              }}
              className={`w-full font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mb-4 ${
                isInWishlist(monitor.id)
                  ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              <Heart
                size={20}
                className={isInWishlist(monitor.id) ? "fill-current" : ""}
              />
              {isInWishlist(monitor.id)
                ? "Remove from Wishlist"
                : "Add to Wishlist"}
            </button>

            <MarketplaceButtons
              name={monitor.title}
              links={monitor.marketplace_links}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
