// components/StreamingLinks.tsx

const PLATFORMS: Record<string, string> = {
  Crunchyroll: "#f47521",
  Netflix: "#e50914",
  Funimation: "#410099",
  HIDIVE: "#00aeef",
  "Disney+": "#113ccf",
  "Amazon Prime Video": "#00a8e0",
  "HBO Max": "#741ecc",
  "Apple TV": "#555555",
}

interface ExternalLink {
  url: string
  site: string
  color: string | null
  icon: string | null
}

interface StreamingLinksProps {
  links: ExternalLink[]
}

export default function StreamingLinks({ links }: StreamingLinksProps) {
  const streaming = links.filter((l) => PLATFORMS[l.site])

  if (!streaming.length) return null

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
      <h2 className="text-base font-semibold mb-4 text-gray-200">
        Where to Watch
      </h2>
      <div className="flex flex-wrap gap-3">
  {streaming.map((link) => (
    <a
      key={link.site}
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-2 rounded-full
                 text-sm font-medium text-white transition-opacity
                 hover:opacity-80"
      style={{ backgroundColor: PLATFORMS[link.site] }}
    >
      {link.icon && (
        <img
          src={link.icon}
          alt=""
          className="w-4 h-4 rounded-sm object-contain"
        />
      )}
      {link.site}
    </a>
  ))}
</div>
      </div>
  )
}