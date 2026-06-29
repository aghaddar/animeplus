// components/ExpandableText.tsx
"use client"
import { useState } from "react"

export default function ExpandableText({
  text,
  limit = 300,
}: {
  text: string
  limit?: number
}) {
  const [expanded, setExpanded] = useState(false)
  const isLong = text.length > limit
  const displayed = !expanded && isLong ? text.slice(0, limit) + "..." : text

  return (
    <div>
      <p className="text-gray-400 leading-relaxed text-sm">{displayed}</p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-purple-400 hover:text-purple-300 text-sm
                    mt-2 transition-colors"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  )
}