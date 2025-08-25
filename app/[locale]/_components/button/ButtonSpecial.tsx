"use client";

interface Props {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}

export default function BtnSp(props: Props) {
  const { active, disabled, onClick, className, children } = props;

  return (
    <button
      className={`
        flex items-center
        cursor-pointer
        transition-all duration-500
        font-bold text-white text-base px-9 py-4 rounded-full 

        bg-[linear-gradient(0deg,_var(--p-purple),_var(--p-blue))]
        bg-[length:150%_150%]

        disabled:bg-[linear-gradient(180deg,_var(--c3),_var(--c4))]
        disabled:cursor-not-allowed
        disabled:shadow-none

        ${
          !disabled &&
          (active
            ? `
                bg-[position:0%_0%]
                shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),_inset_0_0_1px_0_rgba(255,255,255,0.6)]
                hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),_inset_0_0_1px_0_rgba(255,255,255,0.6),_0_0_10px_rgba(var(--p-blue-rgb),0.8)]
              `
            : `
                bg-[position:100%_100%]
                hover:bg-[position:0%_0%]
                shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),_inset_0_0_1px_0_rgba(255,255,255,0.1)]
                hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35),_inset_0_0_1px_0_rgba(255,255,255,0.35),_0_0_10px_rgba(var(--p-blue-rgb),0.8)]
              `)
        }
        ${className}
      `}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
