export function FluxiaLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="fluxia-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#fluxia-grad)" />
      {/* Three wave lines representing flux/flow */}
      <path
        d="M7 12 C9.5 12 9.5 10 12 10 C14.5 10 14.5 12 17 12 C19.5 12 19.5 10 22 10 C24.5 10 24.5 12 25 12"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M7 16 C9.5 16 9.5 14 12 14 C14.5 14 14.5 16 17 16 C19.5 16 19.5 14 22 14 C24.5 14 24.5 16 25 16"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
      <path
        d="M7 20 C9.5 20 9.5 18 12 18 C14.5 18 14.5 20 17 20 C19.5 20 19.5 18 22 18 C24.5 18 24.5 20 25 20"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function FluxiaWordmark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <FluxiaLogo />
      <span className="font-semibold text-sm tracking-tight text-foreground">Fluxia</span>
    </div>
  );
}
