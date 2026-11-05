export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div class={`logo logo--${size}`} aria-label="La Caribeña Encajes">
      <span class="logo__la">LA</span>
      <span class="logo__script">Caribeña</span>
      <span class="logo__caps">ENCAJES</span>
    </div>
  )
}

export function Avatar({
  name,
  size = 'md',
}: {
  name: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return <span class={`avatar avatar--${size}`}>{initials}</span>
}
