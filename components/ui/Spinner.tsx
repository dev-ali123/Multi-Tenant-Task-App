"use client";

type SpinnerProps = {
  size?: number;
  'aria-label'?: string;
};

export default function Spinner(props: SpinnerProps) {
  const { size = 16 } = props;
  return <span className="spinner" style={{ width: size, height: size }} aria-label={props['aria-label'] || 'Loading'} />;
}


