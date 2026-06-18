import Link from "next/link"

export type Crumb = { label: string; href?: string }

type Props = {
  items: Crumb[]
  className?: string
  separator?: React.ReactNode
}

export default function Breadcrumb({ items, className = "", separator = "›" }: Props) {
  return (
    <nav aria-label="Breadcrumb" className={`text-sm text-gray-500 mb-4 ${className}`}>
      {items.map((item, i) => (
        <span key={i} className="inline-flex items-center">
          {item.href ? (
            <Link href={item.href} className="hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-gray-800">{item.label}</span>
          )}
          {i < items.length - 1 && <span className="mx-2">{separator}</span>}
        </span>
      ))}
    </nav>
  )
}
