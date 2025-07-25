interface ImageProps {
  src: string;
  width?: number;
  height?: number;
  alt?: string;
  containerClassName?: string;
  md?: boolean;
  sm?: boolean;
  lg?: boolean;
}

export default function Image({
  src,
  width,
  height,
  alt = "",
  containerClassName,
  md = false,
  sm = false,
  lg = false,
}: ImageProps) {
  return (
    <div
      className={containerClassName}
      style={{
        maxWidth: md ? "20rem" : sm ? "10rem" : lg ? "30rem" : "fit-content",
        margin: "0 auto",
      }}
    >
      <img
        src={src}
        width={width}
        height={height}
        alt={alt}
        loading="lazy"
        style={{
          objectFit: "contain",
          width: "100%",
          height: "auto",
        }}
      />
    </div>
  );
}
