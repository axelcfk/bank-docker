"use strict";

import React, { useEffect, useState } from "react";

export default function Clock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const currentTime =
        String(now.getHours()).padStart(2, "0") +
        ":" +
        String(now.getMinutes()).padStart(2, "0") +
        ":" +
        String(now.getSeconds()).padStart(2, "0");
      setTime(currentTime);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return <div className="text-slate-100 text-xs">{time}</div>;
}
