const profileFiles = import.meta.glob<string>('../assets/images/profile/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
});

const PROFILE_NAMES = ['동현', '상혁', '성호', '재현'] as const;

function findProfilePhoto(name: string): string | undefined {
  const entry = Object.entries(profileFiles).find(([path]) => path.normalize('NFC').includes(`/${name}_`));
  return entry?.[1];
}

export const PROFILE_PHOTOS: Record<string, string> = Object.fromEntries(
  PROFILE_NAMES.flatMap((name) => {
    const url = findProfilePhoto(name);
    return url ? [[name, url]] : [];
  }),
);
