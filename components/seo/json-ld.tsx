import type { JsonLdNode } from '@/lib/seo/schema'

interface JsonLdProps {
  data: JsonLdNode | JsonLdNode[]
}

/**
 * Renders Schema.org JSON-LD into a <script> tag.
 *
 * `<` is escaped so a product title containing markup can never close the
 * script element early. `\u003c` is valid JSON and parses identically.
 */
export default function JsonLd({ data }: JsonLdProps) {
  const payload = JSON.stringify(data).replace(/</g, '\\u003c')

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: payload }}
    />
  )
}
