"use client";

import type { CSSProperties, ReactNode } from 'react';

type AlertProps = {
  variant?: 'error' | 'success' | 'info';
  children?: ReactNode;
  style?: CSSProperties;
};

export default function Alert({ variant = 'info', children, style }: AlertProps) {
  return (
    <div className={`alert ${variant}`} style={style}>
      {children}
    </div>
  );
}


