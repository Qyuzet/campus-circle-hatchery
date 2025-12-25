import Image from "next/image";
import { cn } from "@/lib/utils";

interface ScreenshotSSRProps {
  srcLight: string;
  srcDark?: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export default function ScreenshotSSR({
  srcLight,
  alt,
  width,
  height,
  className,
}: ScreenshotSSRProps) {
  return (
    <Image
      src={srcLight}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}

