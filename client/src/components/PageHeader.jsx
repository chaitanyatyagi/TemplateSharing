import { Sparkles } from "lucide-react";

/**
 * Unified branded page banner. Reuses the home hero's visual language — a dark
 * navy surface with a soft radial brand glow and an optional pill badge — in a
 * compact form, so every page across the site opens with the same signature
 * look instead of ad-hoc plain-text headings.
 */
const PageHeader = ({ badge, title, subtitle, children }) => {
  return (
    <section className="relative w-full overflow-hidden bg-darkBg">
      {/* Soft radial brand glow for depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-bluePrimary/20 blur-[120px]"
      />
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 py-14 text-center sm:px-6 md:py-16">
        {badge && (
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-lightBlue backdrop-blur sm:text-sm">
            <Sparkles size={14} className="text-lightBlue" />
            {badge}
          </span>
        )}
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="max-w-2xl text-base text-white/70 sm:text-lg">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
};

export default PageHeader;
