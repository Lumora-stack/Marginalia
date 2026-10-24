export default function VisualFilters() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute h-0 w-0 overflow-hidden">
      <filter id="liquid-image" x="-15%" y="-15%" width="130%" height="130%">
        <feTurbulence type="fractalNoise" baseFrequency="0.016 0.045" numOctaves="2" seed="12" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="16" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  )
}
