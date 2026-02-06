import { useState, useEffect } from "react";
import { api, formatPrice } from "../lib/api";
import { Component, ComponentType } from "../types/component";
import {
  Cpu,
  MonitorPlay,
  HardDrive,
  CircuitBoard,
  Database,
  Zap,
  Box,
  Fan,
  ShoppingCart,
  AlertCircle,
  CheckCircle2,
  FileDown,
  Trash2,
  Plus,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const COMPONENT_TYPES: ComponentType[] = [
  "CPU",
  "Motherboard",
  "GPU",
  "RAM",
  "Storage",
  "PSU",
  "Case",
  "Cooler",
];

const COMPONENT_ICONS = {
  CPU: Cpu,
  GPU: MonitorPlay,
  RAM: HardDrive,
  Motherboard: CircuitBoard,
  Storage: Database,
  PSU: Zap,
  Case: Box,
  Cooler: Fan,
};

interface SelectedComponents {
  [key: string]: Component | null;
}

export default function RacikPC() {
  const [components, setComponents] = useState<Component[]>([]);
  const [selected, setSelected] = useState<SelectedComponents>({
    CPU: null,
    Motherboard: null,
    GPU: null,
    RAM: null,
    Storage: null,
    PSU: null,
    Case: null,
    Cooler: null,
  });
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    loadComponents();
  }, []);

  useEffect(() => {
    const total = Object.values(selected).reduce(
      (sum, item) => sum + (item?.price || 0),
      0
    );
    setTotalPrice(total);
  }, [selected]);

  const loadComponents = async () => {
    const data = await api.getComponents();
    setComponents(data);
  };

  const handleSelect = (type: ComponentType, component: Component) => {
    setSelected((prev) => ({ ...prev, [type]: component }));
  };

  const getFilteredComponents = (type: ComponentType) => {
    return components.filter((c) => c.type === type);
  };

  const checkCompatibility = () => {
    const issues = [];
    if (selected.CPU && selected.Motherboard) {
      // Simple regex check for socket compatibility if specs contain socket info
      // This is a naive check; real world needs structured data
      const cpuSocket = selected.CPU.specs?.match(/LGA\s?\d+|AM\d/i)?.[0];
      const moboSocket =
        selected.Motherboard.specs?.match(/LGA\s?\d+|AM\d/i)?.[0];

      if (
        cpuSocket &&
        moboSocket &&
        cpuSocket.toUpperCase().replace(/\s/g, "") !==
          moboSocket.toUpperCase().replace(/\s/g, "")
      ) {
        issues.push(
          `Socket mismatch: CPU (${cpuSocket}) vs Motherboard (${moboSocket})`
        );
      }
    }
    return issues;
  };

  const issues = checkCompatibility();

  const handleDownloadPDF = async () => {
    const doc = new jsPDF();

    const loadImage = (src: string) => {
      return new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
      });
    };

    try {
      const logo = await loadImage("assets/image/npc_logo.png");
      doc.addImage(logo, "PNG", 15, 10, 20, 20);
    } catch (e) {
      console.error("Could not load logo", e);
    }

    doc.setFontSize(22);
    doc.setTextColor(33, 37, 41);
    doc.text("NPC", 40, 20);
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text("New Personal Computer", 40, 27);

    doc.setDrawColor(200, 200, 200);
    doc.line(15, 35, 195, 35);

    doc.setFontSize(16);
    doc.setTextColor(33, 37, 41);
    doc.text("Detail Rakitan PC", 15, 45);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 15, 52);

    const tableData = COMPONENT_TYPES.map((type) => {
      const item = selected[type];
      return [
        type,
        item ? item.name : "-",
        item ? formatPrice(item.price) : "-",
      ];
    });

    tableData.push(["", "Total Harga", formatPrice(totalPrice)]);

    autoTable(doc, {
      startY: 60,
      head: [["Komponen", "Nama Produk", "Harga"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 40 },
        2: { halign: "right", cellWidth: 40 },
      },
      didParseCell: (data) => {
        if (data.row.index === tableData.length - 1) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.textColor = [37, 99, 235];
        }
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Terima kasih telah menggunakan layanan NPC builder.", 15, finalY);

    doc.save(`Rakitan-NPC-${new Date().getTime()}.pdf`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">
          Racik PC Impian <span className="text-blue-600">Manual</span>
        </h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
          Pilih komponen terbaik satu per satu dan bangun PC custom yang paling
          sesuai dengan kebutuhan spesifik Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Selection Area */}
        <div className="lg:col-span-2 space-y-6">
          {COMPONENT_TYPES.map((type, index) => {
            const Icon = COMPONENT_ICONS[type as keyof typeof COMPONENT_ICONS];
            return (
              <div
                key={type}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={`p-4 border-b border-slate-100 flex justify-between items-center ${
                    selected[type] ? "bg-blue-50/50" : "bg-slate-50"
                  }`}
                >
                  <h2 className="font-bold text-slate-700 flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        selected[type]
                          ? "bg-blue-500 text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    {type}
                  </h2>
                  {selected[type] && (
                    <span className="text-sm font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                      {formatPrice(selected[type]!.price)}
                    </span>
                  )}
                </div>

                <div className="p-4">
                  {selected[type] ? (
                    <div className="flex justify-between items-center group/card">
                      <div className="flex gap-4 items-center">
                        <div className="w-20 h-20 rounded-xl bg-slate-50 flex items-center justify-center p-2 border border-slate-100">
                          <img
                            src={
                              selected[type]!.image_url ||
                              "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=100&h=100"
                            }
                            alt={selected[type]!.name}
                            className="max-w-full max-h-full object-contain mix-blend-multiply"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg leading-tight">
                            {selected[type]!.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 font-mono bg-slate-100 inline-block px-1.5 py-0.5 rounded">
                            {selected[type]!.specs}
                          </p>
                          <div className="mt-2">
                            {(() => {
                              const primaryLink =
                                selected[type]!.marketplace_links?.shopee ||
                                selected[type]!.marketplace_links?.tokopedia ||
                                selected[type]!.marketplace_links?.lazada ||
                                selected[type]!.marketplace_link;
                              return primaryLink ? (
                                <a
                                  href={primaryLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-semibold text-blue-500 hover:text-blue-700 flex items-center gap-1 hover:underline"
                                >
                                  <ShoppingCart size={12} /> Beli Sekarang
                                </a>
                              ) : null;
                            })()}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setSelected((prev) => ({ ...prev, [type]: null }))
                        }
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                        title="Hapus / Ganti"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {getFilteredComponents(type).length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                          {getFilteredComponents(type).map((component) => (
                            <div
                              key={component.id}
                              onClick={() => handleSelect(type, component)}
                              className="border border-slate-200 rounded-xl p-3 hover:border-blue-500 hover:bg-blue-50/30 cursor-pointer transition-all flex gap-3 group/item relative overflow-hidden"
                            >
                              <div className="absolute top-0 right-0 p-1.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                <div className="bg-blue-500 text-white p-1 rounded-full shadow-sm">
                                  <Plus size={12} strokeWidth={4} />
                                </div>
                              </div>
                              <div className="w-14 h-14 bg-white rounded-lg p-1 flex-shrink-0 border border-slate-100 flex items-center justify-center">
                                <img
                                  src={
                                    component.image_url ||
                                    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=100&h=100"
                                  }
                                  alt={component.name}
                                  className="max-w-full max-h-full object-contain mix-blend-multiply"
                                />
                              </div>
                              <div className="flex flex-col justify-center">
                                <h4 className="font-bold text-slate-700 text-sm line-clamp-2 leading-tight group-hover/item:text-blue-700">
                                  {component.name}
                                </h4>
                                <div className="text-blue-600 font-extrabold text-sm mt-1">
                                  {formatPrice(component.price)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                          <p className="text-slate-400 text-sm italic">
                            Stok komponen kosong.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Sidebar - Sticky */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sticky top-24 transform transition-all hover:shadow-2xl">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
              <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
              Ringkasan Rakitan
            </h2>

            <div className="space-y-4 mb-8">
              {issues.length > 0 ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-pulse">
                  <h3 className="text-red-800 font-bold text-sm flex items-center gap-2 mb-2">
                    <AlertCircle size={18} /> Isu Kompatibilitas
                  </h3>
                  <ul className="list-disc list-inside text-xs text-red-600 space-y-1 font-medium ml-1">
                    {issues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                Object.values(selected).some((x) => x) && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-700 text-sm font-bold shadow-sm">
                    <CheckCircle2 size={20} /> Komponen Kompetibel
                  </div>
                )
              )}

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex justify-between items-end">
                  <span className="text-slate-500 font-medium text-sm mb-1 block">
                    Total Estimasi
                  </span>
                  <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-cyan-600">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownloadPDF}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-slate-800/20 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              disabled={issues.length > 0 || totalPrice === 0}
            >
              <FileDown size={20} />
              Simpan PDF
            </button>

            <p className="text-center text-xs text-slate-400 mt-4 px-4 leading-relaxed">
              Pastikan semua komponen terpilih sebelum menyimpan konfigurasi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
