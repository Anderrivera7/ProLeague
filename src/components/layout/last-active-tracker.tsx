"use client";

import { useEffect, useRef } from "react";
import { touchLastActive } from "@/actions/chat-actions";

export function LastActiveTracker() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const timer = setTimeout(() => void touchLastActive(), 3000);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
