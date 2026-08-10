/**
 * 23 — Footer. Compact index (Dragonfly numbering), disclaimers, honest
 * asset provenance. Server-rendered, no motion.
 */

const INDEX = [
  { num: "01", label: "Project", href: "#glance" },
  { num: "02", label: "Systems", href: "#route" },
  { num: "03", label: "Residences", href: "#residences" },
  { num: "04", label: "Location", href: "#location" },
  { num: "05", label: "Gallery", href: "#gallery" },
  { num: "06", label: "Enquire", href: "#enquire" },
];

export default function Footer() {
  return (
    <footer className="bg-charcoal text-ivory/70 relative">
      <div className="mx-auto max-w-(--container-page) px-(--spacing-gutter) py-14">
        <div className="flex flex-wrap items-start justify-between gap-10">
          <div>
            <p className="font-display text-ivory text-2xl font-bold">wind corridor.</p>
            <p className="mt-2 max-w-xs text-sm">
              Foakh Wind Corridor Enclave — where nature powers modern living. DHA City,
              Karachi, Pakistan.
            </p>
          </div>
          <nav aria-label="Site index">
            <ul className="grid grid-cols-2 gap-x-10 gap-y-2.5 sm:grid-cols-3">
              {INDEX.map((i) => (
                <li key={i.num}>
                  <a href={i.href} className="hover:text-ivory text-sm transition-colors">
                    <span className="text-champagne/70 mr-2 text-xs tabular-nums">{i.num}</span>
                    {i.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="border-ivory/10 mt-12 space-y-2 border-t pt-6 text-xs leading-relaxed">
          <p>
            Natural-technology systems — wind catcher, corridor airflow, wind turbines, solar
            support and water treatment/desalination — are planned and remain subject to final
            engineering, approvals and system specifications.
          </p>
          <p>
            Potential electricity-bill savings of up to 75% are projections based on optimum
            engineering performance; savings may vary according to wind conditions, solar
            output, occupancy, appliance usage, tariff changes and final system
            specifications.
          </p>
          <p>
            Architectural visuals on this site are schematic concepts derived from the physical
            scale model. They are not survey drawings and not completed-construction
            photography.
          </p>
          <p className="text-ivory/40 pt-2">
            © {new Date().getFullYear()} Foakh Wind Corridor Enclave. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
