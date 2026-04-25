export function extractHeadings(content: string): {
  id: string
  text: string
  level: 2 | 3
}[] {
  const headings: { id: string; text: string; level: 2 | 3 }[] = []
  const lines = content.split("\n")

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)$/)
    const h3Match = line.match(/^###\s+(.+)$/)

    if (h2Match) {
      headings.push({
        id: h2Match[1].toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        text: h2Match[1],
        level: 2,
      })
    } else if (h3Match) {
      headings.push({
        id: h3Match[1].toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        text: h3Match[1],
        level: 3,
      })
    }
  }

  return headings
}
