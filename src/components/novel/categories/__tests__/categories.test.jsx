import { render, screen } from '@testing-library/react';
import Categories from '../categories';

describe('Categories component', () => {
  test('renders default title and no tags when data is empty', () => {
    render(<Categories data={[]} />);
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(document.querySelectorAll('.categories-tag').length).toBe(0);
  });

  test('renders custom title and tags from nested data shape', () => {
    const data = [
      {
        right: [
          {
            types: ['Fantasy', 'Sci-Fi'],
          },
          {
            types: ['Romance'],
          },
        ],
      },
      {
        right: [
          {
            types: ['Mystery'],
          },
        ],
      },
    ];

    render(<Categories title="Genres" data={data} />);
    expect(screen.getByText('Genres')).toBeInTheDocument();

    const tags = Array.from(document.querySelectorAll('.categories-tag')).map((el) =>
      el.textContent?.trim()
    );
    expect(tags).toEqual(expect.arrayContaining(['Fantasy', 'Sci-Fi', 'Romance', 'Mystery']));
    // ensure the number of rendered tags matches flattened types
    expect(tags.length).toBe(4);
  });

  test('works when some sections/groups are empty (no crash)', () => {
    const data = [{ right: [] }, { right: [{ types: [] }] }];
    render(<Categories data={data} />);
    expect(document.querySelectorAll('.categories-tag').length).toBe(0);
  });
});
