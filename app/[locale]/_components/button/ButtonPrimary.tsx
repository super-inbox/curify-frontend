"use client";

interface Props {
  type?: "normal" | "white";
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function BtnP(props: Props) {
  const { type = "normal", disabled, onClick, children } = props;

  let colors = "text-white bg-[var(--p-blue)] hover:bg-[var(--p-blue-hover)]";
  if (type === "white") {
    colors =
      "text-[var(--c1)] bg-white border border-[var(--p-purple)] hover:text-[var(--p-blue)]";
  }

  return (
    <button
      className={`
        flex items-center
        cursor-pointer
        transition duration-300
        ${colors}
        font-bold text-xl px-9 py-4 rounded-xl

        disabled:bg-white
        disabled:text-[var(--c4)]
        disabled:shadow-[inset_0_0_0_1px_var(--c4)]
        disabled:cursor-not-allowed
      `}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
