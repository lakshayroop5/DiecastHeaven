import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { POLICIES, type PolicyBlock } from '@/lib/policies'
import { BUSINESS, SITE_LOCALE, SITE_NAME, absoluteUrl, defaultOgImage } from '@/lib/seo/site'
import { cn } from '@/lib/utils'

// Static content - pre-render every policy at build time and revalidate daily.
export const revalidate = 86400

export function generateStaticParams() {
  return POLICIES.map(({ slug }) => ({ slug }))
}

interface PolicyPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PolicyPageProps): Promise<Metadata> {
  const { slug } = await params
  const policy = POLICIES.find((candidate) => candidate.slug === slug)
  if (!policy) return { title: 'Policy Not Found', robots: { index: false, follow: false } }

  return {
    title: policy.title,
    description: policy.description,
    alternates: { canonical: `/policies/${policy.slug}` },
    openGraph: {
      type: 'website',
      url: absoluteUrl(`/policies/${policy.slug}`),
      siteName: SITE_NAME,
      title: policy.title,
      description: policy.description,
      locale: SITE_LOCALE,
      images: [defaultOgImage()],
    },
    twitter: {
      card: 'summary_large_image',
      title: policy.title,
      description: policy.description,
      images: [defaultOgImage().url],
    },
  }
}

function Blocks({ blocks }: { blocks: PolicyBlock[] }) {
  return (
    <div className="space-y-3 text-gray-300 leading-relaxed">
      {blocks.map((block, i) =>
        typeof block === 'string' ? (
          <p key={i} className="whitespace-pre-line">{block}</p>
        ) : Array.isArray(block) ? (
          <ul key={i} className="list-disc space-y-1.5 pl-5 marker:text-hotwheels-red">
            {block.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <h3 key={i} className="pt-2 font-semibold text-hotwheels-white">{block.sub}</h3>
        )
      )}
    </div>
  )
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { slug } = await params
  const policy = POLICIES.find((candidate) => candidate.slug === slug)
  if (!policy) notFound()

  return (
    <div className="min-h-screen bg-hotwheels-black">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 font-mono mb-2">
            Policies
          </p>
          <h1 className="text-3xl sm:text-4xl font-black uppercase italic text-hotwheels-white">
            {policy.title}
          </h1>
        </div>

        <nav aria-label="Policies" className="mb-10 flex flex-wrap justify-center gap-2">
          {POLICIES.map((candidate) => (
            <Link
              key={candidate.slug}
              href={`/policies/${candidate.slug}`}
              aria-current={candidate.slug === policy.slug ? 'page' : undefined}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm transition-colors',
                candidate.slug === policy.slug
                  ? 'border-hotwheels-red bg-hotwheels-red text-white'
                  : 'border-[#2D2D2D] text-gray-300 hover:border-hotwheels-yellow/50 hover:text-hotwheels-white'
              )}
            >
              {candidate.title}
            </Link>
          ))}
        </nav>

        {policy.intro.length > 0 && (
          <div className="mb-6">
            <Blocks blocks={policy.intro} />
          </div>
        )}

        <div className="space-y-4">
          {policy.sections.map((section) => (
            <section
              key={section.title}
              className="bg-hotwheels-gray rounded-2xl p-6 border border-[#2D2D2D]"
            >
              <h2 className="text-lg font-semibold text-hotwheels-yellow mb-3">{section.title}</h2>
              <Blocks blocks={section.blocks} />
            </section>
          ))}
        </div>

        {policy.outro.length > 0 && (
          <div className="mt-6">
            <Blocks blocks={policy.outro} />
          </div>
        )}
      </div>
    </div>
  )
}
