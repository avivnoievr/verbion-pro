import './ProductCatalog.css'

const COLORS = [
  {
    id:   'blue',
    name: 'OCEAN',
    sub:  'Royal Blue',
    hex:  '#1155DD',
    ring: 'rgba(17,85,221,0.60)',
    glow: 'rgba(17,85,221,0.24)',
    img:  '/images/bottle-blue.png',
  },
  {
    id:   'red',
    name: 'EMBER',
    sub:  'Crimson Red',
    hex:  '#CC1133',
    ring: 'rgba(204,17,51,0.60)',
    glow: 'rgba(204,17,51,0.24)',
    img:  '/images/bottle-red.png',
  },
  {
    id:   'green',
    name: 'SUMMIT',
    sub:  'Forest Green',
    hex:  '#22CC44',
    ring: 'rgba(34,204,68,0.60)',
    glow: 'rgba(34,204,68,0.24)',
    img:  '/images/bottle-green.png',
  },
  {
    id:   'white',
    name: 'FROST',
    sub:  'Arctic White',
    hex:  '#E8EDF2',
    ring: 'rgba(232,237,242,0.45)',
    glow: 'rgba(200,220,255,0.14)',
    img:  null,
  },
]

export function ProductCatalog() {
  return (
    <section className="pc" id="specs">
      <div className="pc__aurora" aria-hidden="true">
        <div className="pc__blob pc__blob--blue" />
      </div>

      <div className="pc__inner">
        <p className="pc__eyebrow">CHOOSE YOUR FINISH</p>
        <h2 className="pc__headline">
          YOUR COLOUR.<br />
          <span className="accent">YOUR VERBION.</span>
        </h2>
        <p className="pc__sub">
          Every finish. Same <span className="accent">10°C</span> performance.
          Same <span className="accent">30W</span> Peltier engine inside.
        </p>

        <div className="pc__grid">
          {COLORS.map((c) => (
            <div key={c.id} className="pc__card" style={{ '--card-glow': c.glow }}>
              {/* Swatch / image area */}
              <div className="pc__swatch" style={{ '--swatch-color': c.hex, '--swatch-ring': c.ring }}>
                {c.img
                  ? <img src={c.img} alt={`VERBION V2.5 ${c.sub}`} className="pc__img" />
                  : (
                    <div className="pc__placeholder">
                      <div className="pc__dot" />
                    </div>
                  )
                }
              </div>
              {/* Label */}
              <div className="pc__label">
                <span className="pc__color-name">{c.name}</span>
                <span className="pc__color-sub">{c.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
