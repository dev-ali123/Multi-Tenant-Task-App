"use client";

type AlertProps = {
  variant?: 'error' | 'success' | 'info';
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export default function Alert({ variant = 'info', children, style }: AlertProps) {
  return (
    <div className={`alert ${variant}`} style={style}>
      {children}
    </div>
  );
}


