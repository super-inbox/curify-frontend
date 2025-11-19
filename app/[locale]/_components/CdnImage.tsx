"use client";

import Image, { ImageProps } from "next/image";
import { cdn } from "@/lib/cdn";

export default function CdnImage(props: ImageProps) {
  const { src, ...rest } = props;

  // Allow string or StaticImageData
  const finalSrc = typeof src === "string" ? cdn(src) : src;

  return <Image src={finalSrc} {...rest} />;
}
