import React, { useMemo, useState, useEffect } from 'react';
import { Collapse, Button } from 'antd';

/**
 * GenreSidebar
 * - Accordion: only one section open at a time.
 * - Male/Female headers are clickable (toggle UI state only, no path change).
 * - Each section has All; All routes to section root via onClickAll.
 * - Font sizes enlarged for readability.
 *
 * Props:
 *  - section: 'novel' | 'comics' | 'fan-fics'
 *  - lead: 'male' | 'female'
 *  - activeGenre: string | null
 *  - onClickSection(sec)
 *  - onClickLead(leadType)
 *  - onClickAll(sec)
 *  - onClickGenre(sec, leadType|null, displayName)
 */

const { Panel } = Collapse;

const NOVEL_MALE_LEAD = [
  'All',
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
];

const NOVEL_FEMALE_LEAD = [
  'All',
  'Romance',
  'Drama',
  'Slice of Life',
  'School Life',
  'Comedy',
];

const COMICS_GENRES = ['All', 'Manga', 'Manhua', 'Webtoon', 'Superhero', 'Fantasy', 'Romance'];
const FANFIC_GENRES = ['All', 'Anime', 'Game', 'Movie', 'TV', 'Book', 'Original'];

const SECTIONS = {
  NOVELS: 'novel',
  COMICS: 'comics',
  FANFICS: 'fan-fics',
};

const GenreSidebar = ({
  section,
  lead,
  activeGenre,
  onClickSection,
  onClickLead,
  onClickAll,
  onClickGenre,
}) => {
  const defaultKey = useMemo(() => {
    if (section === 'novel') return 'novels';
    if (section === 'comics') return 'comics';
    return 'fanfics';
  }, [section]);

  const [activeKey, setActiveKey] = useState(defaultKey);
  useEffect(() => setActiveKey(defaultKey), [defaultKey]);

  const renderNovelGroups = () => (
    <div className="novel-groups-wrapper" role="group" aria-label="Novel genres by lead">
      {/* Male lead */}
      <div className="novel-group">
        <button
          type="button"
          className={`novel-group-header-link ${lead === 'male' ? 'is-active' : ''}`}
          onClick={() => onClickLead('male')}
          aria-pressed={lead === 'male'}
        >
          MALELEAD
        </button>
        <div className="novel-group-body">
          {NOVEL_MALE_LEAD.map((g) => {
            const isAll = g === 'All';
            const isActive = section === 'novel' && lead === 'male' && !isAll && g === activeGenre;
            return (
              <Button
                key={`male-${g}`}
                size="small"
                type={isActive ? 'primary' : 'text'}
                className={`browse-sidebar__genre-btn${isActive ? ' is-active' : ''}`}
                aria-pressed={isActive}
                onClick={() =>
                  isAll ? onClickAll(SECTIONS.NOVELS) : onClickGenre(SECTIONS.NOVELS, 'male', g)
                }
              >
                {g}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Female lead */}
      <div className="novel-group">
        <button
          type="button"
          className={`novel-group-header-link ${lead === 'female' ? 'is-active' : ''}`}
          onClick={() => onClickLead('female')}
          aria-pressed={lead === 'female'}
        >
          FEMALELEAD
        </button>
        <div className="novel-group-body">
          {NOVEL_FEMALE_LEAD.map((g) => {
            const isAll = g === 'All';
            const isActive = section === 'novel' && lead === 'female' && !isAll && g === activeGenre;
            return (
              <Button
                key={`female-${g}`}
                size="small"
                type={isActive ? 'primary' : 'text'}
                className={`browse-sidebar__genre-btn${isActive ? ' is-active' : ''}`}
                aria-pressed={isActive}
                onClick={() =>
                  isAll ? onClickAll(SECTIONS.NOVELS) : onClickGenre(SECTIONS.NOVELS, 'female', g)
                }
              >
                {g}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderTwoColList = (items, secKey) => (
    <div className="browse-sidebar__multi-col">
      {items.map((g) => {
        const isAll = g === 'All';
        const isActive = section === secKey && !isAll && g === activeGenre;
        return (
          <Button
            key={`${secKey}-${g}`}
            size="small"
            type={isActive ? 'primary' : 'text'}
            className={`browse-sidebar__genre-btn${isActive ? ' is-active' : ''}`}
            aria-pressed={isActive}
            onClick={() => (isAll ? onClickAll(secKey) : onClickGenre(secKey, null, g))}
          >
            {g}
          </Button>
        );
      })}
    </div>
  );

  return (
    <aside className="browse-sidebar" aria-label="Genre navigation">
      <Collapse
        ghost
        accordion
        activeKey={activeKey}
        onChange={(key) => {
          const next = Array.isArray(key) ? key[0] : key;
          setActiveKey(next);
          if (next === 'novels') onClickSection(SECTIONS.NOVELS);
          if (next === 'comics') onClickSection(SECTIONS.COMICS);
          if (next === 'fanfics') onClickSection(SECTIONS.FANFICS);
        }}
        expandIconPosition="end"
        className="browse-sidebar__collapse"
      >
        <Panel header="Novels" key="novels" className="browse-sidebar__panel">
          {renderNovelGroups()}
        </Panel>

        <Panel header="Comics" key="comics" className="browse-sidebar__panel">
          {renderTwoColList(COMICS_GENRES, SECTIONS.COMICS)}
        </Panel>

        <Panel header="Fan-fics" key="fanfics" className="browse-sidebar__panel">
          {renderTwoColList(FANFIC_GENRES, SECTIONS.FANFICS)}
        </Panel>
      </Collapse>
    </aside>
  );
};

export default GenreSidebar;