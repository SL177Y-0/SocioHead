// src/pages/AnalyticsPage.tsx

import React from 'react';

export default function Analysis() {
  return (
    <div className="w-full h-screen">
      <iframe
        src="https://main-chart-nextjs.vercel.app/"
        className="w-full h-full border-none"
        title="Analytics"
      />
    </div>
  );
}
