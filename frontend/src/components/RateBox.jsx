import React, { useEffect, useRef, useState } from 'react';

export default function RateBox({ type, price, size }) {
  const [flash, setFlash] = useState(null);
  const prevPriceRef = useRef(price);

  useEffect(() => {
    if (prevPriceRef.current !== undefined && price !== prevPriceRef.current) {
      const isUp = price > prevPriceRef.current;
      setFlash(isUp ? 'flash-up' : 'flash-down');
      const timer = setTimeout(() => setFlash(null), 400);
      prevPriceRef.current = price;
      return () => clearTimeout(timer);
    }
    prevPriceRef.current = price;
  }, [price]);

  const isBack = type === 'back';
  const baseBg = isBack ? 'bg-[#72bbef] hover:bg-[#5bb2ec]' : 'bg-[#faa9ba] hover:bg-[#f692a7]';

  return (
    <div className={`flex flex-col items-center justify-center py-1.5 px-3 cursor-pointer transition-colors duration-150 select-none ${baseBg} ${flash || ''}`}>
      <span className="text-sm font-extrabold text-slate-900 leading-tight">
        {price !== undefined && price !== null ? price : '-'}
      </span>
      <span className="text-[10px] font-semibold text-slate-700 leading-tight">
        {size !== undefined && size !== null && size !== 0 ? size : '-'}
      </span>
    </div>
  );
}

