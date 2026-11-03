type TrophyPictureProps = {
  src: string;
  className?: string;
  width?: number;
  height?: number;
};

/** Trofeo PNG servido desde /public (sin optimizador de Next). */
export function TrophyPicture({
  src,
  className,
  width,
  height,
}: TrophyPictureProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={width}
      height={height}
      decoding="async"
      className={className}
    />
  );
}
