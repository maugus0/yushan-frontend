import { useMemo, useState, useEffect } from 'react';
import categoriesService from '../../../services/categories';
/**
 * GenreSidebar (aligned with Rankings left nav)
 * - Single "Novels" button that toggles a collapsible category list.
 * - Categories are displayed as two-column pills.
 * - No Readers/Writers links.
 *
 * Props used:
 *  - activeGenre: string | null       // display name, e.g., "Fantasy"
 *  - activeCategoryId: number | null  // category ID from URL params
 *  - onClickAll(section)              // called with 'novel' when "All Novels" is selected
 *  - onClickGenre(section, _lead, g, categoryId)  // called with ('novel', null, 'Fantasy', 1) for a category
 *
 * Other legacy props (section, lead, onClickSection, onClickLead) are accepted but unused.
 */

const GenreSidebar = ({ activeGenre, activeCategoryId, onClickAll, onClickGenre }) => {
  // Keep "Novels" expanded by default (same as Rankings)
  const [catsOpen, setCatsOpen] = useState(true);
  const [categories, setCategories] = useState([]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await categoriesService.getCategories();
        setCategories(fetchedCategories.filter((cat) => cat.isActive));
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Fallback to empty array if API fails
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // UI active genre derived from current browse URL state
  const uiGenre = useMemo(() => {
    if (activeCategoryId) {
      // Find category name by ID
      const category = categories.find((cat) => cat.id === activeCategoryId);
      return category ? category.name : 'all';
    }
    return activeGenre || 'all';
  }, [activeGenre, activeCategoryId, categories]);

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
            {categories.map((category, i) => {
              const isActive = uiGenre === category.name;
              return (
                <button
                  key={`${category.id}-${i}`}
                  type="button"
                  className={`cat-pill${isActive ? ' active' : ''}`}
                  onClick={() => onClickGenre?.('novel', null, category.name, category.id)}
                >
                  {category.name}
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
