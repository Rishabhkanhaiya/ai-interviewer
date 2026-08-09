import Link from 'next/link'
import Image from 'next/image'
import { Post, CategoryBadge } from './FeaturedPostCard'

export function PostCard({ post }: { post: Post }) {
  const catColors = { bg: 'var(--color-surface-sunken)' } // default
  // Just parsing it manually if we want the gradient, but we can also export CATEGORY_COLORS.
  // We'll rely on the global CSS vars defined for gradients.

  return (
    <Link 
      href={`/blog/${post.slug}`}
      className="flex flex-col w-full border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden hover:border-[var(--color-border-strong)] transition-all group hover:-translate-y-0.5"
      style={{ background: 'var(--color-surface)' }}
    >
      {/* Cover Image / Gradient - Top */}
      <div className="w-full h-40 relative shrink-0">
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
              background: `var(--color-surface-sunken)` // simplify for grid cards unless we want full colors here too
            }}
          />
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-3">
          <CategoryBadge category={post.category} />
        </div>
        <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-4 line-clamp-2 leading-snug">
          {post.title}
        </h3>
        
        {/* Meta */}
        <div className="flex items-center gap-2 mt-auto">
          <span className="text-xs text-[var(--color-text-tertiary)]">{post.date}</span>
          <span className="text-[var(--color-text-tertiary)] text-xs">·</span>
          <span className="text-xs text-[var(--color-text-tertiary)] font-mono">{post.readTime}</span>
        </div>
      </div>
    </Link>
  )
}
