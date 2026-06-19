"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

export default function NixFloat({
  src,
  alt,
  width = 440,
  height = 440,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      animate={shouldReduce ? {} : { y: [0, -14, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
      />
    </motion.div>
  );
}
