import { createPortal } from "react-dom";
import { Component } from "../types/component";
import { formatPrice } from "../lib/api";
import MarketplaceButtons from "./MarketplaceButtons";

interface ComponentDetailModalProps {
    component: Component;
    onClose: () => void;
}

export default function ComponentDetailModal({
    component,
    onClose,
}: ComponentDetailModalProps) {
    // Use a type guard or optional chaining safest approach since generic Component might not have rating
    // Based on types/component.ts, Component doesn't have rating. 
    // checking MonitorModal which uses Monitor type which likely extends Component or has specific fields.
    // We'll stick to what's available in Component interface for now.

    // Actually, checking types/component.ts again:
    // export interface Component {
    //   id: number;
    //   name: string;
    //   type: ComponentType;
    //   price: number;
    //   image_url: string;
    //   description: string;
    //   specs: string;
    //   marketplace_links?: { ... };
    //   ...
    // }
    // It does NOT have rating. So I will remove the rating section for now or mock it if needed for UI consistency, 
    // but looking at the request "detail berbentuk modal", showing specs and description is key.

    // Note: specific components might have specific fields but Component interface is generic.
    // I will check if there are other specific interfaces later or just use Component.

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999] overflow-y-auto">
            <div className="fixed inset-0" onClick={onClose}></div>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative z-10 my-auto animate-fade-in">
                <div className="flex justify-between items-start mb-6">
                    <h2 className="text-3xl font-bold text-slate-800 leading-tight">
                        {component.name}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 text-2xl min-w-[24px]"
                    >
                        ×
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="h-64 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-4">
                        <img
                            src={
                                component.image_url ||
                                "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=300&h=300"
                            }
                            alt={component.name}
                            className="w-full h-full object-contain mix-blend-multiply"
                        />
                    </div>

                    <div>
                        <div className="mb-4">
                            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
                                {component.type}
                            </span>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                {component.description}
                            </p>
                        </div>

                        {component.specs && (
                            <div className="bg-slate-50 rounded-xl p-4 mb-6">
                                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">
                                    Spesifikasi Teknis
                                </h3>
                                <div className="space-y-2 text-sm text-slate-600">
                                    {/* Parsing specs string if it's newline separated or just displaying it */}
                                    {component.specs.split('\n').map((spec, index) => (
                                        spec.trim() && (
                                            <div key={index} className="flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 shrink-0"></span>
                                                <span>{spec}</span>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between mb-6">
                            <div className="text-3xl font-bold text-slate-800">
                                {formatPrice(component.price)}
                            </div>
                        </div>

                        <MarketplaceButtons
                            name={component.name}
                            links={component.marketplace_links}
                        />
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
