const LoadingDots = () => (
  <div className="flex items-center gap-1">
    <span className="inline-block h-2 w-2 animate-loading-dots rounded-full bg-current [animation-delay:0s]" />
    <span className="inline-block h-2 w-2 animate-loading-dots rounded-full bg-current [animation-delay:0.2s]" />
    <span className="inline-block h-2 w-2 animate-loading-dots rounded-full bg-current [animation-delay:0.4s]" />
  </div>
);

export default LoadingDots;
