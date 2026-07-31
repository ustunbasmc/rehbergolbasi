"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Calendar as CalendarIcon } from "lucide-react";

interface TaskWithOrder {
  id: string;
  title: string;
  due_date: string;
  done: boolean;
  work_order_id: string;
  client_name: string;
}

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

export default function WorkCalendar() {
  const [tasks, setTasks] = useState<TaskWithOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: taskData } = await supabase
      .from("work_order_tasks")
      .select("id, title, due_date, done, work_order_id");

    if (!taskData) { setLoading(false); return; }

    const { data: orders } = await supabase
      .from("work_orders")
      .select("id, client_name");

    const orderMap = new Map((orders ?? []).map((o) => [o.id, o.client_name]));

    setTasks(
      taskData.map((t) => ({
        ...t,
        client_name: orderMap.get(t.work_order_id) ?? "Bilinmeyen",
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleToggle(task: TaskWithOrder) {
    await supabase
      .from("work_order_tasks")
      .update({ done: !task.done, done_at: !task.done ? new Date().toISOString() : null })
      .eq("id", task.id);
    load();
  }

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7; // Pazartesi = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const tasksByDate: Record<string, TaskWithOrder[]> = {};
  tasks.forEach((t) => {
    tasksByDate[t.due_date] = [...(tasksByDate[t.due_date] ?? []), t];
  });

  function dateKey(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const todayKey = new Date().toISOString().slice(0, 10);

  function goPrevMonth() {
    setViewDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  }

  function goNextMonth() {
    setViewDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  }

  const selectedTasks = selectedDate ? (tasksByDate[selectedDate] ?? []) : [];

  if (loading) {
    return <p className="text-sm text-ink/40">Yükleniyor...</p>;
  }

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
      {/* Takvim */}
      <div className="card-shadow flex-1 rounded-2xl border border-line bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-navy">
            {MONTHS[month]} {year}
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={goPrevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line hover:bg-offwhite"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goNextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line hover:bg-offwhite"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-1 text-center text-[11px] font-bold uppercase text-ink/40">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />;
            const key = dateKey(day);
            const dayTasks = tasksByDate[key] ?? [];
            const isToday = key === todayKey;
            const isSelected = key === selectedDate;
            const hasUndone = dayTasks.some((t) => !t.done);

            return (
              <button
                key={key}
                onClick={() => setSelectedDate(isSelected ? null : key)}
                className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg border p-1 text-xs transition ${
                  isSelected
                    ? "border-bordo bg-bordo text-white"
                    : isToday
                    ? "border-bordo bg-bordo/5 text-bordo"
                    : "border-line hover:bg-offwhite"
                }`}
              >
                <span className={`font-semibold ${isSelected ? "text-white" : isToday ? "text-bordo" : "text-navy"}`}>
                  {day}
                </span>
                {dayTasks.length > 0 && (
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isSelected
                        ? "bg-white"
                        : hasUndone
                        ? "bg-gold"
                        : "bg-green-500"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-4 border-t border-line pt-3 text-[11px] text-ink/50">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Bekleyen görev
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Tamamlandı
          </div>
        </div>
      </div>

      {/* Seçili gün detayı */}
      <div className="card-shadow w-full rounded-2xl border border-line bg-white p-5 lg:w-80">
        <div className="mb-3 flex items-center gap-1.5">
          <CalendarIcon className="h-4 w-4 text-bordo" />
          <h3 className="text-sm font-bold text-navy">
            {selectedDate
              ? new Date(selectedDate).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
              : "Bir gün seçin"}
          </h3>
        </div>

        {!selectedDate ? (
          <p className="text-xs text-ink/40">Takvimden bir güne tıklayarak o günün görevlerini görebilirsin.</p>
        ) : selectedTasks.length === 0 ? (
          <p className="text-xs text-ink/40">Bu tarihte planlanmış görev yok.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {selectedTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-2.5 rounded-lg border border-line p-2.5">
                <button onClick={() => handleToggle(task)} className="mt-0.5 shrink-0">
                  {task.done ? (
                    <CheckCircle2 className="h-4.5 w-4.5 text-green-500" />
                  ) : (
                    <Circle className="h-4.5 w-4.5 text-ink/20" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold ${task.done ? "text-ink/40 line-through" : "text-navy"}`}>
                    {task.title}
                  </p>
                  <p className="text-[11px] text-ink/40">{task.client_name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}