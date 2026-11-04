"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 380);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {/* Har bir sahifa/bo'limga o'tganda yuqorida chiroyli o'tuvchi progress chizig'i */}
      {loading && (
        <div className="fixed top-0 left-0 right-0 h-[3px] z-[9999] pointer-events-none overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.9)] animate-top-loader" />
        </div>
      )}

      {/* Sahifaning silliq va mayin kirib kelish animatsiyasi */}
      <div className="animate-page-enter flex-1 flex flex-col w-full">
        {children}
      </div>
    </>
  );
}

