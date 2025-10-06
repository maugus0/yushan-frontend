import React, { useMemo, useState } from 'react';

/**
 * GenreSidebar (aligned with Rankings left nav)
 * - Single "Novels" button that toggles a collapsible category list.
 * - Categories are displayed as two-column pills.
 * - No Readers/Writers links.
 *
 * Props used:
 *  - activeGenre: string | null       // display name, e.g., "Fantasy"
 *  - onClickAll(section)              // called with 'novel' when "All Novels" is selected
 *  - onClickGenre(section, _lead, g)  // called with ('novel', null, 'Fantasy') for a category
 *
 * Other legacy props (section, lead, onClickSection, onClickLead) are accepted but unused.
 */

const NOVEL_CATEGORIES = [
  'Action',
  'Adventure',
  'Martial Arts',
  'Fantasy',
  'Sci-Fi',
  'Urban',
  'Historical',
  'Eastern Fantasy',
  'Wuxia',
  'Xianxia',
  'Military',
  'Sports',
  'Romance',
  'Drama',
  'Slice of Life',
  'School Life',
  'Comedy',
];

const GenreSidebar = ({ activeGenre, onClickAll, onClickGenre }) => {
  // Keep "Novels" expanded by default (same as Rankings)
  const [catsOpen, setCatsOpen] = useState(true);

  // UI active genre derived from current browse URL state
  const uiGenre = useMemo(() => activeGenre || 'all', [activeGenre]);

  return (
    <aside className="browse-sidebar" aria-label="Genre navigation">
      <nav className="side-nav" role="tablist" aria-orientation="vertical">
        {/* Novels header (toggle) */}
        <button
          type="button"
          className="side-nav-item active"
          onClick={() => setCatsOpen((v) => !v)}
          aria-selected
          aria-expanded={catsOpen}
        >
          Novels
          <span className={`caret ${catsOpen ? 'open' : ''}`} />
        </button>

        {/* Collapsible category pills (two columns) */}
        {catsOpen && (
          <div className="side-accordion-body">
            <button
              key="all-novels"
              type="button"
              className={`cat-pill${uiGenre === 'all' ? ' active' : ''}`}
              onClick={() => onClickAll?.('novel')}
            >
              All Novels
            </button>
            {NOVEL_CATEGORIES.map((category, i) => {
              const isActive = uiGenre === category;
              return (
                <button
                  key={`${category}-${i}`}
                  type="button"
                  className={`cat-pill${isActive ? ' active' : ''}`}
                  onClick={() => onClickGenre?.('novel', null, category)}
                >
                  {category}
                </button>
              );
            })}
          </div>
        )}
      </nav>
    </aside>
  );
};

export default GenreSidebar;
