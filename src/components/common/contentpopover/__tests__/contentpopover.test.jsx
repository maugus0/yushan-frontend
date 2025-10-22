/**
 * @fileoverview Test suite for ContentPopover component
 *
 * This file tests all functionality of ContentPopover including:
 * - categoriesOnly mode rendering
 * - Normal mode with left rail and right pane
 * - User interactions (click, keyboard)
 * - Edge cases and error handling
 * - Data transformation and column splitting
 */

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContentPopover from '../contentpopover';

// --- Test Data ---
const mockData = [
  {
    key: 'novels',
    label: 'Novels',
    right: [
      {
        title: 'Genres',
        types: [
          'Romance',
          'Fantasy',
          'Mystery',
          'Sci-Fi',
          'Thriller',
          'Horror',
          'Comedy',
          'Drama',
          'Action',
        ],
      },
    ],
  },
  {
    key: 'manga',
    label: 'Manga',
    right: [
      {
        title: 'Categories',
        types: ['Shounen', 'Shoujo', 'Seinen', 'Josei', 'Slice of Life', 'Isekai'],
      },
    ],
  },
  {
    key: 'webtoons',
    label: 'Webtoons',
    right: [
      {
        title: 'Types',
        types: ['Romance', 'Fantasy', 'Action', 'Comedy'],
      },
    ],
  },
];

const mockDataWithMultipleColumns = [
  {
    key: 'test',
    label: 'Test',
    right: [
      {
        title: 'Column 1',
        types: ['Type1', 'Type2', 'Type3'],
      },
      {
        title: 'Column 2',
        types: ['Type4', 'Type5', 'Type6'],
      },
    ],
  },
];

const mockOnSelect = jest.fn();

// --- Test Suite ---
describe('ContentPopover', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Categories Only Mode Tests ---
  describe('Categories Only Mode', () => {
    it('renders categories in grid layout when categoriesOnly is true', () => {
      render(<ContentPopover data={mockData} categoriesOnly={true} onSelect={mockOnSelect} />);

      // Should render categories grid
      expect(screen.getByRole('menuitem', { name: 'Romance' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Fantasy' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Mystery' })).toBeInTheDocument();

      // Should have correct CSS classes
      const romanceElement = screen.getByRole('menuitem', { name: 'Romance' });
      expect(romanceElement).toHaveClass('browse-popover-type', 'browse-popover-type--strong');
    });

    it('handles empty categories array gracefully', () => {
      const emptyData = [{ key: 'test', label: 'Test', right: [{ title: 'Empty', types: [] }] }];

      render(<ContentPopover data={emptyData} categoriesOnly={true} onSelect={mockOnSelect} />);

      expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
    });

    it('calls onSelect with correct parameters when category is clicked', () => {
      render(<ContentPopover data={mockData} categoriesOnly={true} onSelect={mockOnSelect} />);

      const romanceElement = screen.getByRole('menuitem', { name: 'Romance' });
      fireEvent.click(romanceElement);

      expect(mockOnSelect).toHaveBeenCalledWith('novels', 'Romance');
    });

    it('handles keyboard navigation in categories only mode', () => {
      render(<ContentPopover data={mockData} categoriesOnly={true} onSelect={mockOnSelect} />);

      const romanceElement = screen.getByRole('menuitem', { name: 'Romance' });

      // Test Enter key
      fireEvent.keyDown(romanceElement, { key: 'Enter' });
      expect(mockOnSelect).toHaveBeenCalledWith('novels', 'Romance');

      // Test Space key
      fireEvent.keyDown(romanceElement, { key: ' ' });
      expect(mockOnSelect).toHaveBeenCalledTimes(2);
    });

    it('ignores other keyboard keys', () => {
      render(<ContentPopover data={mockData} categoriesOnly={true} onSelect={mockOnSelect} />);

      const romanceElement = screen.getByRole('menuitem', { name: 'Romance' });

      fireEvent.keyDown(romanceElement, { key: 'Escape' });
      fireEvent.keyDown(romanceElement, { key: 'Tab' });
      fireEvent.keyDown(romanceElement, { key: 'ArrowDown' });

      expect(mockOnSelect).not.toHaveBeenCalled();
    });

    it('works without onSelect callback', () => {
      render(<ContentPopover data={mockData} categoriesOnly={true} />);

      const romanceElement = screen.getByRole('menuitem', { name: 'Romance' });

      // Should not crash when clicking without onSelect
      expect(() => {
        fireEvent.click(romanceElement);
      }).not.toThrow();
    });
  });

  // --- Normal Mode Tests ---
  describe('Normal Mode (Left Rail + Right Pane)', () => {
    it('renders left rail with all data items', () => {
      render(<ContentPopover data={mockData} onSelect={mockOnSelect} />);

      expect(screen.getByRole('menuitem', { name: 'Novels' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Manga' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Webtoons' })).toBeInTheDocument();
    });

    it('sets first item as active by default', () => {
      render(<ContentPopover data={mockData} onSelect={mockOnSelect} />);

      const novelsItem = screen.getByRole('menuitem', { name: 'Novels' });
      expect(novelsItem).toHaveClass('active');
    });

    it('shows right pane content for active item', () => {
      render(<ContentPopover data={mockData} onSelect={mockOnSelect} />);

      // Should show novels content by default
      expect(screen.getByText('Genres')).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Romance' })).toBeInTheDocument();
    });

    it('changes active item on mouse enter', () => {
      render(<ContentPopover data={mockData} onSelect={mockOnSelect} />);

      const mangaItem = screen.getByRole('menuitem', { name: 'Manga' });
      fireEvent.mouseEnter(mangaItem);

      // Manga should become active
      expect(mangaItem).toHaveClass('active');

      // Should show manga content
      expect(screen.getByText('Categories')).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Shounen' })).toBeInTheDocument();
    });

    it('handles keyboard navigation for left rail items', () => {
      render(<ContentPopover data={mockData} onSelect={mockOnSelect} />);

      const mangaItem = screen.getByRole('menuitem', { name: 'Manga' });

      // Test Enter key
      fireEvent.keyDown(mangaItem, { key: 'Enter' });
      expect(mangaItem).toHaveClass('active');

      // Test Space key
      const webtoonsItem = screen.getByRole('menuitem', { name: 'Webtoons' });
      fireEvent.keyDown(webtoonsItem, { key: ' ' });
      expect(webtoonsItem).toHaveClass('active');
    });

    it('ignores other keyboard keys for left rail', () => {
      render(<ContentPopover data={mockData} onSelect={mockOnSelect} />);

      const mangaItem = screen.getByRole('menuitem', { name: 'Manga' });

      fireEvent.keyDown(mangaItem, { key: 'Escape' });
      fireEvent.keyDown(mangaItem, { key: 'Tab' });

      // Should not change active state
      expect(mangaItem).not.toHaveClass('active');
    });

    it('renders multiple columns in right pane', () => {
      render(<ContentPopover data={mockDataWithMultipleColumns} onSelect={mockOnSelect} />);

      // Should show both columns
      expect(screen.getByText('Column 1')).toBeInTheDocument();
      expect(screen.getByText('Column 2')).toBeInTheDocument();

      // Should have items from both columns
      expect(screen.getByRole('menuitem', { name: 'Type1' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Type4' })).toBeInTheDocument();
    });

    it('calls onSelect with correct parameters when right pane item is clicked', () => {
      render(<ContentPopover data={mockData} onSelect={mockOnSelect} />);

      const romanceElement = screen.getByRole('menuitem', { name: 'Romance' });
      fireEvent.click(romanceElement);

      expect(mockOnSelect).toHaveBeenCalledWith('novels', 'Romance');
    });

    it('handles keyboard navigation for right pane items', () => {
      render(<ContentPopover data={mockData} onSelect={mockOnSelect} />);

      const romanceElement = screen.getByRole('menuitem', { name: 'Romance' });

      // Test Enter key
      fireEvent.keyDown(romanceElement, { key: 'Enter' });
      expect(mockOnSelect).toHaveBeenCalledWith('novels', 'Romance');

      // Test Space key
      fireEvent.keyDown(romanceElement, { key: ' ' });
      expect(mockOnSelect).toHaveBeenCalledTimes(2);
    });

    it('works without onSelect callback', () => {
      render(<ContentPopover data={mockData} />);

      const romanceElement = screen.getByRole('menuitem', { name: 'Romance' });

      // Should not crash when clicking without onSelect
      expect(() => {
        fireEvent.click(romanceElement);
      }).not.toThrow();
    });

    it('handles empty data array', () => {
      render(<ContentPopover data={[]} onSelect={mockOnSelect} />);

      // Should render empty popover without crashing
      expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
    });

    it('handles item without right property', () => {
      const dataWithoutRight = [{ key: 'test', label: 'Test' }];

      render(<ContentPopover data={dataWithoutRight} onSelect={mockOnSelect} />);

      // Should render left rail but no right pane
      expect(screen.getByRole('menuitem', { name: 'Test' })).toBeInTheDocument();
    });

    it('handles item with empty right array', () => {
      const dataWithEmptyRight = [{ key: 'test', label: 'Test', right: [] }];

      render(<ContentPopover data={dataWithEmptyRight} onSelect={mockOnSelect} />);

      // Should render left rail but no right pane
      expect(screen.getByRole('menuitem', { name: 'Test' })).toBeInTheDocument();
    });
  });

  // --- Column Splitting Logic Tests ---
  describe('Column Splitting Logic', () => {
    it('handles single item correctly', () => {
      const singleItemData = [
        { key: 'test', label: 'Test', right: [{ title: 'Single', types: ['Only'] }] },
      ];

      render(<ContentPopover data={singleItemData} onSelect={mockOnSelect} />);

      expect(screen.getByRole('menuitem', { name: 'Only' })).toBeInTheDocument();
    });

    it('handles exactly 3 items', () => {
      const threeItemsData = [
        { key: 'test', label: 'Test', right: [{ title: 'Three', types: ['A', 'B', 'C'] }] },
      ];

      render(<ContentPopover data={threeItemsData} onSelect={mockOnSelect} />);

      expect(screen.getByRole('menuitem', { name: 'A' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'B' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'C' })).toBeInTheDocument();
    });

    it('handles more than 3 items with proper distribution', () => {
      const manyItemsData = [
        {
          key: 'test',
          label: 'Test',
          right: [{ title: 'Many', types: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'] }],
        },
      ];

      render(<ContentPopover data={manyItemsData} onSelect={mockOnSelect} />);

      // All items should be rendered
      for (let i = 0; i < 9; i++) {
        expect(
          screen.getByRole('menuitem', { name: String.fromCharCode(65 + i) })
        ).toBeInTheDocument();
      }
    });

    it('handles items with no title', () => {
      const noTitleData = [{ key: 'test', label: 'Test', right: [{ types: ['A', 'B', 'C'] }] }];

      render(<ContentPopover data={noTitleData} onSelect={mockOnSelect} />);

      // Should render items without title
      expect(screen.getByRole('menuitem', { name: 'A' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'B' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'C' })).toBeInTheDocument();
    });
  });

  // --- Accessibility Tests ---
  describe('Accessibility', () => {
    it('has proper ARIA roles', () => {
      render(<ContentPopover data={mockData} onSelect={mockOnSelect} />);

      // All interactive elements should have menuitem role
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBeGreaterThan(0);
    });

    it('has proper tabIndex for keyboard navigation', () => {
      render(<ContentPopover data={mockData} onSelect={mockOnSelect} />);

      const menuItems = screen.getAllByRole('menuitem');
      menuItems.forEach((item) => {
        expect(item).toHaveAttribute('tabIndex', '0');
      });
    });

    it('supports keyboard navigation with Enter and Space keys', () => {
      render(<ContentPopover data={mockData} onSelect={mockOnSelect} />);

      const firstMenuItem = screen.getAllByRole('menuitem')[0];

      // Both Enter and Space should work
      fireEvent.keyDown(firstMenuItem, { key: 'Enter' });
      fireEvent.keyDown(firstMenuItem, { key: ' ' });

      // Should not throw errors
      expect(() => {
        fireEvent.keyDown(firstMenuItem, { key: 'Enter' });
        fireEvent.keyDown(firstMenuItem, { key: ' ' });
      }).not.toThrow();
    });
  });

  // --- Performance and Edge Cases ---
  describe('Performance and Edge Cases', () => {
    it('handles rapid mouse movements', () => {
      render(<ContentPopover data={mockData} onSelect={mockOnSelect} />);

      const novelsItem = screen.getByRole('menuitem', { name: 'Novels' });
      const mangaItem = screen.getByRole('menuitem', { name: 'Manga' });
      const webtoonsItem = screen.getByRole('menuitem', { name: 'Webtoons' });

      // Rapid mouse movements
      fireEvent.mouseEnter(novelsItem);
      fireEvent.mouseEnter(mangaItem);
      fireEvent.mouseEnter(webtoonsItem);
      fireEvent.mouseEnter(novelsItem);

      // Should handle rapid changes without issues
      expect(novelsItem).toHaveClass('active');
    });

    it('handles malformed data gracefully', () => {
      const malformedData = [
        { key: 'test1', label: 'Test1' }, // missing right
        { key: 'test2', label: 'Test2', right: null }, // null right
        { key: 'test3', label: 'Test3', right: [{ types: null }] }, // null types
        { key: 'test4', label: 'Test4', right: [{ types: ['valid'] }] }, // valid
      ];

      render(<ContentPopover data={malformedData} onSelect={mockOnSelect} />);

      // Should render valid items and handle invalid ones gracefully
      expect(screen.getByRole('menuitem', { name: 'Test1' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Test4' })).toBeInTheDocument();
    });
  });
});
