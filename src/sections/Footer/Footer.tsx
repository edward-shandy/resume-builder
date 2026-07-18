export function Footer() {
  return (
    <footer id="footer" data-section="footer" className="relative px-6 py-14 sm:px-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 border-t border-white/10 pt-10 text-center sm:flex-row sm:justify-between sm:text-left">
        <span className="label-readout text-white/40">
          NorthStar // Resume builder, guided by starlight
        </span>
        <span className="label-readout text-white/30">
          © {new Date().getFullYear()} NorthStar — write your story in the stars
        </span>
      </div>
    </footer>
  )
}
