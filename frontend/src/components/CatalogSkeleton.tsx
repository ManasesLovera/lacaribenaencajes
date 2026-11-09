const pills = [94, 97, 102, 89, 97]
const rows = Array.from({ length: 8 }, (_, index) => index)
const cards = Array.from({ length: 4 }, (_, index) => index)

export function CatalogSkeleton() {
  return (
    <div
      class="catalog-skeleton"
      aria-busy="true"
      aria-label="Cargando productos"
    >
      <div class="catalog-skeleton__bar" aria-hidden="true" />

      <header class="page-header">
        <div>
          <span class="skeleton skeleton--eyebrow" />
          <span class="skeleton skeleton--title" />
          <span class="skeleton skeleton--subtitle" />
        </div>
        <div class="page-header__actions">
          <span class="skeleton skeleton--button" />
          <span class="skeleton skeleton--button skeleton--primary" />
        </div>
      </header>

      <div class="stats-grid stats-grid--three">
        {[96, 124, 108].map((width) => (
          <article class="stat-card stat-card--inline" key={width}>
            <span class="skeleton skeleton--label" style={{ width: `${width}px` }} />
            <span class="skeleton skeleton--value" style={{ width: `${width + 48}px` }} />
            <span class="skeleton skeleton--detail" style={{ width: `${width + 76}px` }} />
          </article>
        ))}
      </div>

      <div class="toolbar">
        <div class="pill-row">
          {pills.map((width, index) => (
            <span
              class="skeleton skeleton--pill"
              key={`${width}-${index}`}
              style={{ '--pill-w': `${width}px` }}
            />
          ))}
        </div>
        <div class="toolbar__right">
          <span class="skeleton skeleton--count" />
          <span class="skeleton skeleton--sort" />
        </div>
      </div>

      <div class="table-wrap table-wrap--desktop">
        <table class="table table--skeleton">
          <thead>
            <tr>
              <th scope="col">Producto</th>
              <th scope="col">Categoría</th>
              <th scope="col" class="is-right">Precio</th>
              <th scope="col" class="is-right">Costo</th>
              <th scope="col" class="is-right">
                <span class="computed-head">Ganancia neta</span>
              </th>
              <th scope="col">
                <span class="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr class="skeleton-row" key={row}>
                <td>
                  <div class="product-cell">
                    <span class="skeleton skeleton--thumb" />
                    <div>
                      <span class="skeleton skeleton--name" />
                      <span class="skeleton skeleton--meta" />
                    </div>
                  </div>
                </td>
                <td>
                  <span class="skeleton skeleton--chip" />
                </td>
                <td class="is-right">
                  <span class="skeleton skeleton--money" />
                </td>
                <td class="is-right">
                  <span class="skeleton skeleton--money skeleton--money-sm" />
                </td>
                <td class="is-right">
                  <div class="net-cell">
                    <span class="skeleton skeleton--net" />
                    <span class="skeleton skeleton--margin" />
                  </div>
                </td>
                <td />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div class="product-cards">
        {cards.map((card) => (
          <article class="product-card" key={card}>
            <div class="product-card__main">
              <span class="skeleton skeleton--thumb" />
              <div class="product-card__name">
                <span class="skeleton skeleton--name" />
                <span class="skeleton skeleton--chip" />
              </div>
            </div>
            <div class="product-card__numbers">
              {['precio', 'costo', 'ganancia'].map((label) => (
                <div key={label}>
                  <span class="skeleton skeleton--label-xs" />
                  <span class="skeleton skeleton--money" />
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div class="pagination">
        <span class="skeleton skeleton--pagination" />
        <div class="pagination__controls">
          <span class="skeleton skeleton--page" />
          <span class="skeleton skeleton--page skeleton--page-current" />
          <span class="skeleton skeleton--page" />
        </div>
      </div>
    </div>
  )
}
