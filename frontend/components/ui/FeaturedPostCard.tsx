import Link from 'next/link'
import Image from 'next/image'

export interface Post {
  slug: string
  title: string
  excerpt: string
  category: 'Interview Tips' | 'System Design' | 'Behavioral' | 'Company Guides' | string
  date: string
  readTime: string
  author: {
    name: string
    avatarUrl?: string
  }
  coverImage?: string
}

const CATEGORY_COLORS: Record<string, { bg: string, text: string }> = {
  'Interview Tips': { bg: 'var(--color-info-subtle)', text: 'var(--color-info)' },
  'System Design': { bg: 'var(--color-accent-subtle)', text: 'var(--color-accent)' },
  'Behavioral': { bg: 'var(--color-success-subtle)', text: 'var(--color-success)' },
  'Company Guides': { bg: 'var(--color-warning-subtle)', text: 'var(--color-warning)' },
}

export function CategoryBadge({ category }: { category: string }) {
  const colors = CATEGORY_COLORS[category] || { bg: 'var(--color-surface-sunken)', text: 'var(--color-text-secondary)' }
  return (
    <span 
      className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ background: colors.bg, color: colors.text }}
    >
      {category}
    </span>
  )
}

export function FeaturedPostCard({ post }: { post: Post }) {
  const catColors = CATEGORY_COLORS[post.category] || { bg: 'var(--color-surface-sunken)' }
  
  return (
    <Link 
      href={`/blog/${post.slug}`}
      className="flex flex-col md:flex-row w-full border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden hover:border-[var(--color-border-strong)] transition-all group hover:-translate-y-0.5"
      style={{ background: 'var(--color-surface)' }}
    >
      {/* 40% Image / Gradient */}
      <div className="w-full md:w-2/5 h-48 md:h-auto relative shrink-0">
        {post.coverImage ? (
          <Image 
            src={post.coverImage} 
            alt={post.title}
            fill
            className="object-cover"
          />
        ) : (
          <div 
            className="w-full h-full"
            style={{ 
              background: `linear-gradient(135deg, ${catColors.bg}, var(--color-surface-sunken))`
            }}
          />
        )}
      </div>

      {/* 60% Content */}
      <div className="p-6 md:p-8 flex flex-col justify-center flex-1 min-w-0">
        <div className="mb-4">
          <CategoryBadge category={post.category} />
        </div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2 line-clamp-2 leading-tight">
          {post.title}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6 line-clamp-3">
          {post.excerpt}
        </p>
        
        {/* Meta */}
        <div className="flex items-center gap-2 mt-auto">
          {post.author.avatarUrl ? (
            <img src={post.author.avatarUrl} alt={post.author.name} className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-[var(--color-surface-sunken)] flex items-center justify-center text-[10px] font-bold text-[var(--color-text-secondary)]">
              {post.author.name.charAt(0)}
            </div>
          )}
          <span className="text-xs font-medium text-[var(--color-text-secondary)]">{post.author.name}</span>
          <span className="text-[var(--color-text-tertiary)] mx-1">·</span>
          <span className="text-xs text-[var(--color-text-tertiary)]">{post.date}</span>
          <span className="text-[var(--color-text-tertiary)] mx-1">·</span>
          <span className="text-xs text-[var(--color-text-tertiary)] font-mono">{post.readTime}</span>
        </div>
      </div>
    </Link>
  )
}
