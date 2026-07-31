"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import WorkCalendar from "@/components/admin/WorkCalendar";
import {
  Plus, Trash2, CheckCircle2, Circle, Briefcase, Calendar,
  Wallet, ChevronDown, X, List, CalendarDays,
} from "lucide-react";

interface WorkTask {
  id: string;
  title: string;
  due_date: string;
  done: boolean;
  notes: string | null;
}

interface WorkOrder {
  id: string;
  client_name: string;
  title: string;
  description: string | null;
  price: number | null;
  revenue_date: string;
  status: "active" | "completed" | "cancelled";
  created_at: string;
  tasks: WorkTask[];
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

export default function WorkOrdersList() {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  // Yeni iş formu
  const [clientName, setClientName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [revenueDate, setRevenueDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  // Yeni görev ekleme (iş bazında)
  const [newTaskTitle, setNewTaskTitle] = useState<Record<string, string>>({});
  const [newTaskDate, setNewTaskDate] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const { data: workOrders } = await supabase
      .from("work_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!workOrders) { setLoading(false); return; }

    const { data: tasks } = await supabase
      .from("work_order_tasks")
      .select("*")
      .order("due_date", { ascending: true });

    const combined: WorkOrder[] = workOrders.map((o) => ({
      ...o,
      tasks: (tasks ?? []).filter((t) => t.work_order_id === o.id),
    }));

    setOrders(combined);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreateOrder() {
    if (!clientName.trim() || !title.trim()) return;
    setSaving(true);
    await supabase.from("work_orders").insert({
      client_name: clientName.trim(),
      title: title.trim(),
      description: description.trim() || null,
      price: price ? Number(price) : null,
      revenue_date: revenueDate,
      status: "active",
    });
    setClientName("");
    setTitle("");
    setDescription("");
    setPrice("");
    setRevenueDate(new Date().toISOString().slice(0, 10));
    setShowNewForm(false);
    setSaving(false);
    load();
  }

  async function handleAddTask(orderId: string) {
    const taskTitle = newTaskTitle[orderId]?.trim();
    const taskDate = newTaskDate[orderId];
    if (!taskTitle || !taskDate) return;

    await supabase.from("work_order_tasks").insert({
      work_order_id: orderId,
      title: taskTitle,
      due_date: taskDate,
    });
    setNewTaskTitle((prev) => ({ ...prev, [orderId]: "" }));
    setNewTaskDate((prev) => ({ ...prev, [orderId]: "" }));
    load();
  }

  async function handleToggleTask(task: WorkTask) {
    await supabase
      .from("work_order_tasks")
      .update({ done: !task.done, done_at: !task.done ? new Date().toISOString() : null })
      .eq("id", task.id);
    load();
  }

  async function handleDeleteTask(taskId: string) {
    await supabase.from("work_order_tasks").delete().eq("id", taskId);
    load();
  }

  async function handleDeleteOrder(orderId: string) {
    const confirmed = window.confirm("Bu işi ve tüm görevlerini silmek istediğine emin misin?");
    if (!confirmed) return;
    await supabase.from("work_orders").delete().eq("id", orderId);
    load();
  }

  async function handleToggleStatus(order: WorkOrder) {
    const newStatus = order.status === "completed" ? "active" : "completed";
    await supabase.from("work_orders").update({ status: newStatus }).eq("id", order.id);
    load();
  }

  const totalActiveRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.price ?? 0), 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
  <div>
    <h2 className="font-display text-lg font-bold text-navy">İş Takibi</h2>
    <p className="text-xs text-ink/50">
      {orders.length} iş · Toplam {formatCurrency(totalActiveRevenue)}
    </p>
  </div>
  <div className="flex items-center gap-2">
    <div className="flex rounded-lg border border-line p-1">
      <button
        onClick={() => setView("list")}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
          view === "list" ? "bg-navy text-white" : "text-ink/60 hover:bg-offwhite"
        }`}
      >
        <List className="h-3.5 w-3.5" /> Liste
      </button>
      <button
        onClick={() => setView("calendar")}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
          view === "calendar" ? "bg-navy text-white" : "text-ink/60 hover:bg-offwhite"
        }`}
      >
        <CalendarDays className="h-3.5 w-3.5" /> Takvim
      </button>
    </div>
    <button
      onClick={() => setShowNewForm(!showNewForm)}
      className="flex items-center gap-2 rounded-lg bg-bordo px-4 py-2 text-sm font-bold text-white hover:bg-bordo-dark"
    >
      <Plus className="h-4 w-4" /> Yeni İş
    </button>
  </div>
</div>

      {showNewForm && (
        <div className="mb-6 rounded-2xl border border-line bg-offwhite p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-navy">Yeni İş Ekle</p>
            <button onClick={() => setShowNewForm(false)} className="text-ink/40 hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Müşteri adı (örn. RS Grup İnşaat)"
              className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-bordo"
            />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="İş başlığı (örn. Instagram Tanıtım Paketi)"
              className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-bordo"
            />
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Açıklama (isteğe bağlı)"
            rows={2}
            className="mt-3 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-bordo"
          />
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink/50">Ücret (TL)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="2000"
                className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-bordo"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink/50">Gelir tarihi (hangi aya sayılsın)</label>
              <input
                type="date"
                value={revenueDate}
                onChange={(e) => setRevenueDate(e.target.value)}
                className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-bordo"
              />
            </div>
          </div>
          <button
            onClick={handleCreateOrder}
            disabled={saving}
            className="mt-4 rounded-lg bg-bordo px-4 py-2.5 text-sm font-bold text-white hover:bg-bordo-dark disabled:opacity-60"
          >
            {saving ? "Kaydediliyor..." : "İşi Oluştur"}
          </button>
        </div>
      )}
{view === "calendar" ? (
        <WorkCalendar />
      ) : loading ? (
        <p className="text-sm text-ink/40">Yükleniyor...</p>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-10 text-center">
          <Briefcase className="mx-auto mb-2 h-6 w-6 text-ink/20" />
          <p className="text-sm text-ink/50">Henüz iş kaydı yok.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => {
            const doneCount = order.tasks.filter((t) => t.done).length;
            const totalCount = order.tasks.length;
            const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
            const isExpanded = expandedId === order.id;

            return (
              <div key={order.id} className="overflow-hidden rounded-2xl border border-line bg-white">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        order.status === "completed" ? "bg-green-50 text-green-600" : "bg-bordo/10 text-bordo"
                      }`}
                    >
                      <Briefcase className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-bold text-navy">{order.client_name}</p>
                        {order.status === "completed" && (
                          <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
                            Tamamlandı
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-ink/50">{order.title}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {order.price != null && (
                      <span className="flex items-center gap-1 text-xs font-bold text-navy">
                        <Wallet className="h-3.5 w-3.5 text-ink/30" /> {formatCurrency(order.price)}
                      </span>
                    )}
                    {totalCount > 0 && (
                      <span className="text-xs font-semibold text-ink/50">{doneCount}/{totalCount}</span>
                    )}
                    <ChevronDown className={`h-4 w-4 text-ink/40 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {totalCount > 0 && (
                  <div className="h-1.5 bg-offwhite">
                    <div
                      className="h-full bg-bordo transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}

                {isExpanded && (
                  <div className="border-t border-line p-4">
                    {order.description && (
                      <p className="mb-4 text-xs text-ink/60">{order.description}</p>
                    )}

                    <div className="mb-3 flex flex-col gap-2">
                      {order.tasks.length === 0 ? (
                        <p className="text-xs text-ink/40">Henüz görev eklenmedi.</p>
                      ) : (
                        order.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center gap-2.5 rounded-lg border border-line p-2.5"
                          >
                            <button onClick={() => handleToggleTask(task)} className="shrink-0">
                              {task.done ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : (
                                <Circle className="h-5 w-5 text-ink/20" />
                              )}
                            </button>
                            <div className="min-w-0 flex-1">
                              <p className={`text-sm font-semibold ${task.done ? "text-ink/40 line-through" : "text-navy"}`}>
                                {task.title}
                              </p>
                              <p className="flex items-center gap-1 text-[11px] text-ink/40">
                                <Calendar className="h-3 w-3" /> {formatDate(task.due_date)}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="shrink-0 text-ink/30 hover:text-bordo"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex flex-col gap-2 rounded-lg border border-dashed border-line p-3 sm:flex-row sm:items-center">
                      <input
                        value={newTaskTitle[order.id] ?? ""}
                        onChange={(e) => setNewTaskTitle((prev) => ({ ...prev, [order.id]: e.target.value }))}
                        placeholder="Görev (örn. 1. Hikaye paylaşımı)"
                        className="flex-1 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
                      />
                      <input
                        type="date"
                        value={newTaskDate[order.id] ?? ""}
                        onChange={(e) => setNewTaskDate((prev) => ({ ...prev, [order.id]: e.target.value }))}
                        className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
                      />
                      <button
                        onClick={() => handleAddTask(order.id)}
                        className="flex items-center justify-center gap-1 rounded-lg bg-navy px-3 py-2 text-xs font-bold text-white hover:bg-navy-dark"
                      >
                        <Plus className="h-3.5 w-3.5" /> Ekle
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                      <button
                        onClick={() => handleToggleStatus(order)}
                        className="text-xs font-semibold text-navy hover:underline"
                      >
                        {order.status === "completed" ? "Aktif yap" : "Tamamlandı olarak işaretle"}
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-bordo hover:underline"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> İşi Sil
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}