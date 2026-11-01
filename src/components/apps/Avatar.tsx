import { PROFILE_PHOTOS } from '@/lib/profiles';

type Props = { photo: string | null; label: string; size?: number };

export default function Avatar({ photo, label, size = 32 }: Props) {
  const style = { width: size, height: size };
  if (photo && PROFILE_PHOTOS[photo]) {
    return (
      <img
        src={PROFILE_PHOTOS[photo]}
        alt=""
        style={style}
        className="shrink-0 rounded-full object-cover object-[50%_22%] ring-1 ring-black/5"
      />
    );
  }
  return (
    <span
      style={{ ...style, fontSize: size * 0.4 }}
      className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F9D7A8] to-[#E8A36B] font-semibold text-[#3B2A1A]"
    >
      {label.slice(0, 1)}
    </span>
  );
}
