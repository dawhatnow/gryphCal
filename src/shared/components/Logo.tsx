import gryph from "../../assets/gryph.png";

// The app logo: the mascot picture in a rounded frame.
export function Logo({ size = 36 }: { size?: number }) {
  return <img className="logo" src={gryph} width={size} height={size} alt="" />;
}
