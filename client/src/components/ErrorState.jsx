import { AlertTriangle, RefreshCw, PackageOpen } from "lucide-react";

/**
 * Cobalt "section load failure" / empty state (Error States design #05).
 * - variant "error": red rotated icon tile + Try again (cobalt) + Back to home (outline)
 * - variant "empty": neutral tile, softer copy, optional single action
 */
const ErrorState = ({
  variant = "error",
  title,
  message,
  icon,
  onRetry,
  retryLabel = "Try again",
  secondaryLabel,
  onSecondary,
}) => {
  const isError = variant === "error";
  const Icon = icon || (isError ? AlertTriangle : PackageOpen);

  return (
    <div className="py-16 md:py-24 flex flex-col items-center text-center border-t border-b border-line animate-fadeIn">
      <div
        className={`w-16 h-16 rounded-[18px] flex items-center justify-center mb-6 -rotate-6 ${
          isError ? "bg-errBg text-err" : "bg-creamAlt text-faint"
        }`}
      >
        <Icon size={28} strokeWidth={2} />
      </div>
      <h3 className="font-display text-[clamp(24px,3.4vw,32px)] leading-[1.05] tracking-[-.02em] m-0 max-w-[460px]">
        {title}
      </h3>
      {message && <p className="mt-3 max-w-[420px] text-bodytext text-[15px] m-0">{message}</p>}
      {(onRetry || onSecondary) && (
        <div className="flex flex-wrap gap-3 justify-center mt-7">
          {onRetry && (
            <button
              onClick={onRetry}
              className="h-12 px-6 rounded-full bg-terracotta text-paper font-semibold text-sm flex items-center gap-2 hover:bg-ink transition-colors"
            >
              <RefreshCw size={16} /> {retryLabel}
            </button>
          )}
          {onSecondary && (
            <button
              onClick={onSecondary}
              className="h-12 px-6 rounded-full border border-ink font-semibold text-sm hover:bg-ink hover:text-cream transition-colors"
            >
              {secondaryLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ErrorState;
