const wallpapers = import.meta.glob<string>('../../assets/images/background/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
});

const wallpaperUrl = Object.entries(wallpapers).find(([path]) => path.normalize('NFC').includes('배경화면'))?.[1];

type Props = { dim: boolean };

export default function Wallpaper({ dim }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-black">
      {wallpaperUrl ? <img src={wallpaperUrl} alt="" draggable={false} className="h-full w-full object-cover" /> : null}
      <div
        className="absolute inset-0 transition-colors duration-700"
        style={{ backgroundColor: dim ? 'rgba(0, 0, 0, 0.35)' : 'rgba(0, 0, 0, 0)' }}
      />
    </div>
  );
}
