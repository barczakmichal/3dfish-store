'use client';

import { useState, useEffect } from 'react';

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('announcementDismissed');
    if (!dismissed) setVisible(true);
  }, []);

  function dismiss() {
    sessionStorage.setItem('announcementDismissed', '1');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="h-10 bg-blue-900 text-white text-sm flex items-center justify-center relative">
      <span>Darmowa dostawa od 99 zł | Druk 3D premium</span>
      <button
        onClick={dismiss}
        aria-label="Zamknij"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
