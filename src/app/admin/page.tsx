"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminLogin from "@/components/AdminLogin";
import AdminDashboard from "@/components/AdminDashboard";

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
      setChecking(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (checking) {
    return <div className="px-5 py-24 text-center text-ink/50">Yükleniyor...</div>;
  }

  if (!loggedIn) {
    return <AdminLogin onSuccess={() => setLoggedIn(true)} />;
  }

  return <AdminDashboard onLogout={() => setLoggedIn(false)} />;
}