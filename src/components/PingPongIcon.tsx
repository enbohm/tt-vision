const PingPongIcon = ({ className = "w-6 h-6", ...props }: React.SVGProps<SVGSVGElement> & { className?: string }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Paddle */}
    <ellipse cx="28" cy="24" rx="18" ry="22" fill="currentColor" opacity="0.85" />
    <ellipse cx="28" cy="24" rx="15" ry="19" fill="currentColor" opacity="0.55" />
    {/* Handle */}
    <rect x="22" y="44" width="12" height="16" rx="4" fill="currentColor" opacity="0.9" />
    <rect x="24" y="46" width="8" height="12" rx="3" fill="currentColor" opacity="0.5" />
    {/* Ball */}
    <circle cx="52" cy="14" r="8" fill="currentColor" opacity="0.95" />
    <circle cx="50" cy="12" r="3" fill="white" opacity="0.3" />
  </svg>
);

export default PingPongIcon;
