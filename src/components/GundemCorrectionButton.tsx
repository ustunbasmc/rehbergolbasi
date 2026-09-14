"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import GundemReportModal from "@/components/GundemReportModal";

export default function GundemCorrectionButton({ postId, postSlug, postTitle }: { postId: string; postSlug: string; postTitle: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs font-semibold text-ink/50 hover:text-bordo"
      >
        <Flag className="h-3.5 w-3.5" /> Haberde eksik veya yanlış bilgi mi var?
      </button>
      {open && <GundemReportModal postId={postId} postSlug={postSlug} postTitle={postTitle} onClose={() => setOpen(false)} />}
    </>
  );
}
