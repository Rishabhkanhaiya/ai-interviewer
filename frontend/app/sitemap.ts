import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.in'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: BASE_URL, priority: 1.0, changeFrequency: 'weekly' as const },
    { url: `${BASE_URL}/auth`, priority: 0.8, changeFrequency: 'monthly' as const },
    { url: `${BASE_URL}/buy`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${BASE_URL}/blog`, priority: 0.8, changeFrequency: 'daily' as const },
    { url: `${BASE_URL}/help`, priority: 0.7, changeFrequency: 'monthly' as const },
  ]

  // Blog post slugs — add as you publish
  const blogPosts = [
    'tcs-nqt-interview-questions',
    'how-to-answer-tell-me-about-yourself-hinglish',
    'star-method-indian-examples',
    'why-you-freeze-in-interviews',
    'infosys-interview-preparation-2025',
    'speaking-pace-130-wpm-interviews',
    'filler-words-interview-score',
    'wipro-nlth-interview-guide',
    'solo-interview-practice',
    'hr-round-questions-freshers-india',
  ].map(slug => ({
    url: `${BASE_URL}/blog/${slug}`,
    priority: 0.7,
    changeFrequency: 'monthly' as const,
  }))

  return [...staticPages, ...blogPosts]
}
