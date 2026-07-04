"use client";

import { useEffect } from "react";
import { touchLastActive } from "@/actions/chat-actions";

export function LastActiveTracker() {
  useEffect(() => {
    touchLastActive();
    const interval = setInterval(touchLastActive, 60_000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
