// "use client";

import Image from "next/image";

interface Props {
  name: string;
  size?: 2 | "2_5" | 3 | "3_5" | 5 | 6 | 8 | 15;
  className?: string;
}

export default function Icon(props: Props) {
  const { name, size = 3, className } = props;

  const sizeMap = {
    2: "w-2 h-2", // 8px
    "2_5": "w-2.5 h-2.5", // 10px
    3: "w-3 h-3", // 12px
    "3_5": "w-3.5 h-3.5", // 14px
    5: "w-5 h-5", // 20px
    6: "w-6 h-6", // 24px
    8: "w-8 h-8", // 32px
    15: "w-15 h-15", // 60px
  };

  const sizeLevel = sizeMap[size];

  return (
    <div className={`relative ${sizeLevel}${className ? ` ${className}` : ""}`}>
      <Image
        src={`/icons/${name}.svg`}
        alt={name}
        fill
        className="object-contain"
      />
    </div>
  );
}
