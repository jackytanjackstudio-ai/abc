/** Renders trusted, server-generated SVG markup (catalog art / design previews). */
export default function SvgImage({ svg, className = '' }: { svg: string; className?: string }) {
  return <div className={`svg-fill ${className}`} dangerouslySetInnerHTML={{ __html: svg }} />
}
