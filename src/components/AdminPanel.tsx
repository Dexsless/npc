import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { api, formatPrice } from "../lib/api";
import { Component, ComponentType } from "../types/component";
import { Monitor } from "../types/monitor";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Monitor as MonitorIcon,
  Cpu,
} from "lucide-react";
import { z, ZodIssue } from "zod";

/* =====================
   CONSTANTS
===================== */
const COMPONENT_TYPES = [
  "CPU",
  "GPU",
  "RAM",
  "Motherboard",
  "Storage",
  "PSU",
  "Case",
  "Cooler",
] as const;

/* =====================
   ZOD SCHEMAS
===================== */
const componentSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  type: z.enum(COMPONENT_TYPES),
  price: z.number().min(1000, "Harga minimal 1.000"),
  image_url: z.string().url("URL gambar tidak valid"),
  specs: z.string().optional(),
  description: z.string().optional(),
  marketplace_links: z
    .object({
      shopee: z.string().url().optional().or(z.literal("")),
      tokopedia: z.string().url().optional().or(z.literal("")),
      lazada: z.string().url().optional().or(z.literal("")),
    })
    .optional(),
});

const monitorSchema = z.object({
  title: z.string().min(2, "Nama minimal 2 karakter"),
  price: z.number().min(1000, "Harga minimal 1.000"),
  image_url: z.string().url("URL gambar tidak valid"),
  screen_size: z.number().min(10, "Ukuran layar minimal 10 inch"),
  resolution: z.string().min(2, "Resolusi wajib diisi"),
  refresh_rate: z.number().min(30, "Refresh rate minimal 30Hz"),
  panel_type: z.string().min(2, "Tipe panel wajib diisi"),
  rating: z.number().min(0).max(5).default(0),
  featured: z.boolean().default(false),
  description: z.string().optional(),
  marketplace_links: z
    .object({
      shopee: z.string().url().optional().or(z.literal("")),
      tokopedia: z.string().url().optional().or(z.literal("")),
      lazada: z.string().url().optional().or(z.literal("")),
    })
    .optional(),
});

/* =====================
   DEBOUNCE HOOK
===================== */
function useDebounce<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

/* =====================
   MAIN COMPONENT
===================== */
export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<"components" | "monitors">(
    "components",
  );

  const [components, setComponents] = useState<Component[]>([]);
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [filterType, setFilterType] = useState<ComponentType | "All">("All");

  // Form States
  const [compForm, setCompForm] = useState({
    name: "",
    type: "CPU" as ComponentType,
    price: 0,
    image_url: "",
    specs: "",
    description: "",
    marketplace_links: {
      shopee: "",
      tokopedia: "",
      lazada: "",
    },
  });

  const [monForm, setMonForm] = useState({
    title: "",
    price: 0,
    image_url: "",
    screen_size: 24,
    resolution: "1920x1080",
    refresh_rate: 60,
    panel_type: "IPS",
    rating: 0,
    featured: false,
    description: "",
    marketplace_links: {
      shopee: "",
      tokopedia: "",
      lazada: "",
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const debouncedCompForm = useDebounce(compForm);
  const debouncedMonForm = useDebounce(monForm);

  /* =====================
     FETCH DATA
  ===================== */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "components") {
        const data = await api.getComponents();
        setComponents(data || []);
      } else {
        const data = await api.getMonitors();
        setMonitors(data || []);
      }
    } catch (err: any) {
      console.error(err);
    }
    setLoading(false);
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* =====================
     REALTIME VALIDATION
  ===================== */
  useEffect(() => {
    let result;
    if (activeTab === "components") {
      result = componentSchema.safeParse(debouncedCompForm);
    } else {
      result = monitorSchema.safeParse(debouncedMonForm);
    }

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue: ZodIssue) => {
        const field = issue.path.join("."); // Join path for nested objects like marketplace_links
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
    } else {
      setErrors({});
    }
  }, [debouncedCompForm, debouncedMonForm, activeTab]);

  /* =====================
     FORM ACTIONS
  ===================== */
  const resetForm = () => {
    if (activeTab === "components") {
      setCompForm({
        name: "",
        type: "CPU",
        price: 0,
        image_url: "",
        specs: "",
        description: "",
        marketplace_links: { shopee: "", tokopedia: "", lazada: "" },
      });
    } else {
      setMonForm({
        title: "",
        price: 0,
        image_url: "",
        screen_size: 24,
        resolution: "1920x1080",
        refresh_rate: 60,
        panel_type: "IPS",
        rating: 0,
        featured: false,
        description: "",
        marketplace_links: { shopee: "", tokopedia: "", lazada: "" },
      });
    }
    setErrors({});
    setEditingId(null);
  };

  const openAdd = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (item: Component | Monitor) => {
    if (activeTab === "components") {
      // Safe casting or check properties
      const c = item as Component;
      setCompForm({
        name: c.name,
        type: c.type,
        price: c.price,
        image_url: c.image_url,
        specs: c.specs || "",
        description: c.description || "",
        marketplace_links: c.marketplace_links || {
          shopee: "",
          tokopedia: "",
          lazada: "",
        },
      });
    } else {
      const m = item as Monitor;
      setMonForm({
        title: m.title,
        price: m.price,
        image_url: m.image_url,
        screen_size: m.screen_size,
        resolution: m.resolution,
        refresh_rate: m.refresh_rate,
        panel_type: m.panel_type,
        rating: m.rating || 0,
        featured: m.featured || false,
        description: m.description || "",
        marketplace_links: {
          shopee: m.marketplace_links?.shopee || "",
          tokopedia: m.marketplace_links?.tokopedia || "",
          lazada: m.marketplace_links?.lazada || "",
        },
      });
    }
    setEditingId(item.id);
    setModalOpen(true);
  };

  const closeModal = () => {
    resetForm();
    setModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (activeTab === "components") {
        const parsed = componentSchema.safeParse(compForm);
        if (!parsed.success) return;
        if (editingId) {
          await api.updateComponent(editingId, parsed.data);
        } else {
          await api.createComponent(parsed.data);
        }
      } else {
        const parsed = monitorSchema.safeParse(monForm);
        if (!parsed.success) return;
        if (editingId) {
          await api.updateMonitor(editingId, parsed.data);
        } else {
          await api.createMonitor(parsed.data);
        }
      }

      closeModal();
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan data");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus item ini?")) return;
    try {
      if (activeTab === "components") {
        await api.deleteComponent(id);
      } else {
        await api.deleteMonitor(id);
      }
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus data");
    }
  };

  /* =====================
     DERIVED DATA
  ===================== */
  const filteredComponents =
    filterType === "All"
      ? components
      : components.filter((c) => c.type === filterType);

  /* =====================
     UI
  ===================== */
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">Admin Panel</h1>
          <button
            type="button"
            onClick={openAdd}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={18} /> Tambah{" "}
            {activeTab === "components" ? "Komponen" : "Monitor"}
          </button>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex gap-4 mb-8 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("components")}
            className={`pb-3 px-1 font-medium flex items-center gap-2 transition-all ${activeTab === "components" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Cpu size={20} /> Komponen PC
          </button>
          <button
            onClick={() => setActiveTab("monitors")}
            className={`pb-3 px-1 font-medium flex items-center gap-2 transition-all ${activeTab === "monitors" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:text-slate-700"}`}
          >
            <MonitorIcon size={20} /> Monitor
          </button>
        </div>

        {/* FILTER (Components Only) */}
        {activeTab === "components" && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {["All", ...COMPONENT_TYPES].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterType(t as any)}
                className={`px-4 py-2 rounded-lg ${filterType === t
                  ? "bg-slate-700 text-white"
                  : "bg-white border"
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* LIST */}
        {!loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === "components"
              ? // COMPONENTS LIST
              filteredComponents.map((c) => (
                <div
                  key={c.id}
                  className="bg-white border rounded-xl overflow-hidden shadow-sm"
                >
                  <img
                    src={c.image_url}
                    alt={c.name}
                    className="aspect-video w-full object-cover"
                  />
                  <div className="p-4">
                    <span className="text-xs bg-slate-700 text-white px-2 py-1 rounded">
                      {c.type}
                    </span>
                    <h3 className="font-semibold mt-2">{c.name}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {c.specs}
                    </p>
                    <p className="text-blue-600 font-bold mt-2">
                      {formatPrice(c.price)}
                    </p>

                    <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
                      <button
                        type="button"
                        onClick={() => openEdit(c)}
                        className="text-slate-600 hover:text-blue-600"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        className="text-slate-600 hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
              : // MONITORS LIST
              monitors.map((m) => (
                <div
                  key={m.id}
                  className="bg-white border rounded-xl overflow-hidden shadow-sm"
                >
                  <img
                    src={m.image_url}
                    alt={m.title}
                    className="aspect-video w-full object-cover"
                  />
                  <div className="p-4">
                    <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded">
                      {m.screen_size}" {m.panel_type}
                    </span>
                    <h3 className="font-semibold mt-2">{m.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {m.resolution} | {m.refresh_rate}Hz
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-1.5 py-0.5 rounded">
                        ★ {m.rating}
                      </span>
                      {m.featured && (
                        <span className="text-xs font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-blue-600 font-bold mt-2">
                      {formatPrice(m.price)}
                    </p>

                    <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
                      <button
                        type="button"
                        onClick={() => openEdit(m)}
                        className="text-slate-600 hover:text-blue-600"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(m.id)}
                        className="text-slate-600 hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-center">Memuat...</p>
        )}
      </div>

      {/* MODAL */}
      {modalOpen && (
        <Modal
          title={
            editingId
              ? `Edit ${activeTab === "components" ? "Komponen" : "Monitor"}`
              : `Tambah ${activeTab === "components" ? "Komponen" : "Monitor"}`
          }
          onClose={closeModal}
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-4 max-h-[80vh] overflow-y-auto px-1"
          >
            {activeTab === "components" ? (
              // COMPONENT FORM
              <>
                <Input label="Nama" error={errors.name}>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                    value={compForm.name}
                    onChange={(e) =>
                      setCompForm({ ...compForm, name: e.target.value })
                    }
                  />
                </Input>

                <Input label="Tipe">
                  <select
                    className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                    value={compForm.type}
                    onChange={(e) =>
                      setCompForm({
                        ...compForm,
                        type: e.target.value as ComponentType,
                      })
                    }
                  >
                    {COMPONENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Input>

                <Input label="Harga" error={errors.price}>
                  <input
                    type="number"
                    className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                    value={compForm.price}
                    onChange={(e) =>
                      setCompForm({
                        ...compForm,
                        price:
                          e.target.value === "" ? 0 : Number(e.target.value),
                      })
                    }
                  />
                </Input>

                <Input label="URL Gambar" error={errors.image_url}>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                    value={compForm.image_url}
                    onChange={(e) =>
                      setCompForm({
                        ...compForm,
                        image_url: e.target.value,
                      })
                    }
                  />
                </Input>

                <Input label="Spesifikasi">
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                    value={compForm.specs}
                    onChange={(e) =>
                      setCompForm({
                        ...compForm,
                        specs: e.target.value,
                      })
                    }
                  />
                </Input>

                <Input label="Deskripsi">
                  <textarea
                    rows={2}
                    className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                    value={compForm.description}
                    onChange={(e) =>
                      setCompForm({
                        ...compForm,
                        description: e.target.value,
                      })
                    }
                  />
                </Input>
                <h3 className="font-semibold text-sm pt-2 border-t text-slate-500">
                  Link Marketplace
                </h3>
                <Input
                  label="Shopee"
                  error={errors["marketplace_links.shopee"]}
                >
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                    placeholder="https://shopee.co.id/..."
                    value={compForm.marketplace_links.shopee}
                    onChange={(e) =>
                      setCompForm({
                        ...compForm,
                        marketplace_links: {
                          ...compForm.marketplace_links,
                          shopee: e.target.value,
                        },
                      })
                    }
                  />
                </Input>
                <Input
                  label="Tokopedia"
                  error={errors["marketplace_links.tokopedia"]}
                >
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                    placeholder="https://tokopedia.com/..."
                    value={compForm.marketplace_links.tokopedia}
                    onChange={(e) =>
                      setCompForm({
                        ...compForm,
                        marketplace_links: {
                          ...compForm.marketplace_links,
                          tokopedia: e.target.value,
                        },
                      })
                    }
                  />
                </Input>
                <Input
                  label="Lazada"
                  error={errors["marketplace_links.lazada"]}
                >
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                    placeholder="https://lazada.co.id/..."
                    value={compForm.marketplace_links.lazada}
                    onChange={(e) =>
                      setCompForm({
                        ...compForm,
                        marketplace_links: {
                          ...compForm.marketplace_links,
                          lazada: e.target.value,
                        },
                      })
                    }
                  />
                </Input>
              </>
            ) : (
              // MONITOR FORM
              <>
                <Input label="Nama Monitor (Title)" error={errors.title}>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                    value={monForm.title}
                    onChange={(e) =>
                      setMonForm({ ...monForm, title: e.target.value })
                    }
                  />
                </Input>

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Screen Size (inch)" error={errors.screen_size}>
                    <input
                      type="number"
                      className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                      value={monForm.screen_size}
                      onChange={(e) =>
                        setMonForm({
                          ...monForm,
                          screen_size: Number(e.target.value),
                        })
                      }
                    />
                  </Input>
                  <Input label="Refresh Rate (Hz)" error={errors.refresh_rate}>
                    <input
                      type="number"
                      className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                      value={monForm.refresh_rate}
                      onChange={(e) =>
                        setMonForm({
                          ...monForm,
                          refresh_rate: Number(e.target.value),
                        })
                      }
                    />
                  </Input>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Resolution" error={errors.resolution}>
                    <input
                      type="text"
                      placeholder="1920x1080"
                      className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                      value={monForm.resolution}
                      onChange={(e) =>
                        setMonForm({ ...monForm, resolution: e.target.value })
                      }
                    />
                  </Input>
                  <Input label="Panel Type" error={errors.panel_type}>
                    <input
                      type="text"
                      placeholder="IPS/VA/TN"
                      className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                      value={monForm.panel_type}
                      onChange={(e) =>
                        setMonForm({ ...monForm, panel_type: e.target.value })
                      }
                    />
                  </Input>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Rating" error={errors.rating}>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                      value={monForm.rating}
                      onChange={(e) =>
                        setMonForm({
                          ...monForm,
                          rating: Number(e.target.value),
                        })
                      }
                    />
                  </Input>
                  <div className="flex items-center h-full pt-6">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={monForm.featured}
                        onChange={(e) =>
                          setMonForm({ ...monForm, featured: e.target.checked })
                        }
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                      />
                      <span className="font-medium text-slate-700">
                        Featured (Rekomen)
                      </span>
                    </label>
                  </div>
                </div>

                <Input label="Harga" error={errors.price}>
                  <input
                    type="number"
                    className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                    value={monForm.price}
                    onChange={(e) =>
                      setMonForm({
                        ...monForm,
                        price:
                          e.target.value === "" ? 0 : Number(e.target.value),
                      })
                    }
                  />
                </Input>

                <Input label="URL Gambar" error={errors.image_url}>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                    value={monForm.image_url}
                    onChange={(e) =>
                      setMonForm({
                        ...monForm,
                        image_url: e.target.value,
                      })
                    }
                  />
                </Input>

                <Input label="Deskripsi">
                  <textarea
                    rows={2}
                    className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                    value={monForm.description}
                    onChange={(e) =>
                      setMonForm({
                        ...monForm,
                        description: e.target.value,
                      })
                    }
                  />
                </Input>

                <h3 className="font-semibold text-sm pt-2 border-t">
                  Link Marketplace
                </h3>
                <Input
                  label="Shopee"
                  error={errors["marketplace_links.shopee"]}
                >
                  <input
                    type="text"
                    placeholder="https://shopee.co.id/..."
                    className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                    value={monForm.marketplace_links.shopee}
                    onChange={(e) =>
                      setMonForm({
                        ...monForm,
                        marketplace_links: {
                          ...monForm.marketplace_links,
                          shopee: e.target.value,
                        },
                      })
                    }
                  />
                </Input>
                <Input
                  label="Tokopedia"
                  error={errors["marketplace_links.tokopedia"]}
                >
                  <input
                    type="text"
                    placeholder="https://tokopedia.com/..."
                    className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                    value={monForm.marketplace_links.tokopedia}
                    onChange={(e) =>
                      setMonForm({
                        ...monForm,
                        marketplace_links: {
                          ...monForm.marketplace_links,
                          tokopedia: e.target.value,
                        },
                      })
                    }
                  />
                </Input>
                <Input
                  label="Lazada"
                  error={errors["marketplace_links.lazada"]}
                >
                  <input
                    type="text"
                    placeholder="https://lazada.co.id/..."
                    className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                    value={monForm.marketplace_links.lazada}
                    onChange={(e) =>
                      setMonForm({
                        ...monForm,
                        marketplace_links: {
                          ...monForm.marketplace_links,
                          lazada: e.target.value,
                        },
                      })
                    }
                  />
                </Input>
              </>
            )}

            <button
              type="submit"
              disabled={Object.keys(errors).length > 0}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={18} /> Simpan
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* =====================
   REUSABLE UI
===================== */
function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return createPortal(
    <div className="fixed inset-0 top-0 left-0 w-full h-full bg-black/40 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg relative max-h-full flex flex-col shadow-2xl animate-fade-in-up">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-slate-800">{title}</h2>
        {children}
      </div>
    </div>,
    document.body
  );
}

function Input({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="font-medium text-sm text-slate-700 block mb-1">
        {label}
      </label>
      {children}
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
