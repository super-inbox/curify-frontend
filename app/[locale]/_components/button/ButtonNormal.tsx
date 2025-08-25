interface Props {
  disabled?: boolean;
  whiteConfig?: (
    | "no-highlight"
    | "no-bg"
    | "no-border"
    | "no-hover"
    | "no-padding"
  )[];
  className?: string;
  onClick: () => void;
  children: React.ReactNode;
}

export default function BtnN(props: Props) {
  const { disabled, whiteConfig, className, onClick, children } = props;

  let classes = "";
  if (whiteConfig) {
    classes = `text-[var(--c2)]`;
    if (!whiteConfig.includes("no-highlight")) {
      classes = `${classes} hover:text-[var(--p-blue)]`;
    }
    if (!whiteConfig.includes("no-bg")) {
      classes = `${classes} bg-white`;
    }
    if (!whiteConfig.includes("no-border")) {
      classes = `${classes} shadow-[inset_0_0_0_1px_var(--p-purple)]`;
    }
    if (!whiteConfig.includes("no-hover")) {
      classes = `${classes} hover:bg-[rgba(var(--c1-rgb),0.03)]`;
    }
    if (!whiteConfig.includes("no-padding")) {
      classes = `${classes} px-5 py-3`;
    }
  } else {
    classes = `text-white bg-[var(--p-blue)] hover:bg-[var(--p-blue-hover)] px-5 py-3`;
  }

  return (
    <button
      className={`
        cursor-pointer
        transition duration-100
        ${classes}
        font-medium text-sm rounded-lg
        ${className}

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
