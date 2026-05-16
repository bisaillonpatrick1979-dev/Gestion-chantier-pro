"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEmployeeStore } from "@/store/useEmployeeStore";

export default function BottomNav() {
  const pathname = usePathname();
  const { currentEmployee } = useEmployeeStore();
  const isAdmin = currentEmployee?.role === "admin";

  function IconHome(active: boolean) {
    const c = active ? "#D4AF37" : "#666";
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <polyline points="3,11 12,2 21,11" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="5" y="11" width="14" height="11" rx="1" stroke={c} strokeWidth="2" fill="none" />
      </svg>
    );
  }

  function IconCalendar(active: boolean) {
    const c = active ? "#D4AF37" : "#666";
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke={c} strokeWidth="2" fill="none" />
        <line x1="16" y1="2" x2="16" y2="6" stroke={c} strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="2" x2="8" y2="6" stroke={c} strokeWidth="2" strokeLinecap="round" />
        <line x1="3" y1="10" x2="
