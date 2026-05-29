interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 28,  // tabel baris
  md: 36,  // kartu beranda
  lg: 64,  // modal popup
};

export default function UserAvatar({ size = 'sm', className = '' }: UserAvatarProps) {
  const px = sizeMap[size];

  return (
    <div
      className={`shrink-0 rounded-full flex items-center justify-center ${className}`}
      style={{
        width: px,
        height: px,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <svg
        width={px * 0.6}
        height={px * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M20 21a8 8 0 1 0-16 0" />
      </svg>
    </div>
  );
}
