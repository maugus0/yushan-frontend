// src/pages/settings/__tests__/reading-settings.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ReadingSettingsPage from '../reading-settings';
import { ReadingSettingsProvider } from '../../../store/readingSettings';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Helper function to render component with providers
const renderWithProviders = (component) => {
  return render(
    <ReadingSettingsProvider>
      <MemoryRouter>{component}</MemoryRouter>
    </ReadingSettingsProvider>
  );
};

describe('ReadingSettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
  });

  describe('Component Rendering', () => {
    test('renders reading settings page with correct title', () => {
      renderWithProviders(<ReadingSettingsPage />);

      expect(screen.getByText('Reading Settings')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Reading Settings');
    });

    test('renders font size control with default value', () => {
      renderWithProviders(<ReadingSettingsPage />);

      const fontSizeLabel = screen.getByText('Font Size (18px)');
      expect(fontSizeLabel).toBeInTheDocument();

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('min', '14');
      expect(slider).toHaveAttribute('max', '22');
      expect(slider).toHaveAttribute('step', '1');
      expect(slider).toHaveValue('18');
    });

    test('renders font family control with default value', () => {
      renderWithProviders(<ReadingSettingsPage />);

      const fontFamilyLabel = screen.getByText('Font Family');
      expect(fontFamilyLabel).toBeInTheDocument();

      const select = screen.getByDisplayValue('Serif (Georgia)');
      expect(select).toBeInTheDocument();
      expect(select).toHaveValue('serif');
    });

    test('renders preview section with sample text', () => {
      renderWithProviders(<ReadingSettingsPage />);

      const previewText = screen.getByText(
        /Preview paragraph. Adjust settings to see live changes/
      );
      expect(previewText).toBeInTheDocument();
    });

    test('renders reset button', () => {
      renderWithProviders(<ReadingSettingsPage />);

      const resetButton = screen.getByText('Reset Defaults');
      expect(resetButton).toBeInTheDocument();
      expect(resetButton).toHaveAttribute('type', 'button');
    });

    test('applies correct CSS classes', () => {
      renderWithProviders(<ReadingSettingsPage />);

      const page = screen.getByText('Reading Settings').closest('.reading-settings-page');
      expect(page).toBeInTheDocument();

      const card = screen.getByText('Reading Settings').closest('.reading-settings-card');
      expect(card).toBeInTheDocument();

      const preview = screen.getByText(/Preview paragraph/).closest('.reading-preview');
      expect(preview).toBeInTheDocument();
    });
  });

  describe('Font Size Control', () => {
    test('updates font size when slider is moved', () => {
      renderWithProviders(<ReadingSettingsPage />);

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '20' } });

      expect(screen.getByText('Font Size (20px)')).toBeInTheDocument();
    });

    test('updates preview text font size when slider is moved', () => {
      renderWithProviders(<ReadingSettingsPage />);

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '16' } });

      const preview = screen.getByText(/Preview paragraph/).closest('.reading-preview');
      expect(preview).toHaveStyle({ fontSize: '16px' });
    });

    test('handles minimum font size value', () => {
      renderWithProviders(<ReadingSettingsPage />);

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '14' } });

      expect(screen.getByText('Font Size (14px)')).toBeInTheDocument();
    });

    test('handles maximum font size value', () => {
      renderWithProviders(<ReadingSettingsPage />);

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '22' } });

      expect(screen.getByText('Font Size (22px)')).toBeInTheDocument();
    });

    test('updates slider value when font size changes', () => {
      renderWithProviders(<ReadingSettingsPage />);

      const slider = screen.getByRole('slider');
      expect(slider).toHaveValue('18');

      fireEvent.change(slider, { target: { value: '19' } });
      expect(slider).toHaveValue('19');
    });
  });

  describe('Font Family Control', () => {
    test('updates font family when select option is changed', () => {
      renderWithProviders(<ReadingSettingsPage />);

      const select = screen.getByDisplayValue('Serif (Georgia)');
      fireEvent.change(select, { target: { value: 'sans' } });

      expect(select).toHaveValue('sans');
    });

    test('updates preview text font family when select is changed to sans', () => {
      renderWithProviders(<ReadingSettingsPage />);

      const select = screen.getByDisplayValue('Serif (Georgia)');
      fireEvent.change(select, { target: { value: 'sans' } });

      const preview = screen.getByText(/Preview paragraph/).closest('.reading-preview');
      expect(preview).toHaveStyle({
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
      });
    });

    test('updates preview text font family when select is changed to serif', () => {
      renderWithProviders(<ReadingSettingsPage />);

      const select = screen.getByDisplayValue('Serif (Georgia)');
      fireEvent.change(select, { target: { value: 'serif' } });

      const preview = screen.getByText(/Preview paragraph/).closest('.reading-preview');
      expect(preview).toHaveStyle({
        fontFamily: 'Georgia, "Times New Roman", serif',
      });
    });

    test('renders all font family options', () => {
      renderWithProviders(<ReadingSettingsPage />);

      const select = screen.getByDisplayValue('Serif (Georgia)');
      const options = select.querySelectorAll('option');

      expect(options).toHaveLength(2);
      expect(options[0]).toHaveValue('serif');
      expect(options[0]).toHaveTextContent('Serif (Georgia)');
      expect(options[1]).toHaveValue('sans');
      expect(options[1]).toHaveTextContent('Sans (System UI)');
    });
  });

  describe('Preview Section', () => {
    test('displays preview text with correct styling', () => {
      renderWithProviders(<ReadingSettingsPage />);

      const preview = screen.getByText(/Preview paragraph/).closest('.reading-preview');
      expect(preview).toHaveStyle({
        fontSize: '18px',
        fontFamily: 'Georgia, "Times New Roman", serif',
      });
    });

    test('updates preview when both font size and family change', () => {
      renderWithProviders(<ReadingSettingsPage />);

      // Change font size
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '20' } });

      // Change font family
      const select = screen.getByDisplayValue('Serif (Georgia)');
      fireEvent.change(select, { target: { value: 'sans' } });

      const preview = screen.getByText(/Preview paragraph/).closest('.reading-preview');
      expect(preview).toHaveStyle({
        fontSize: '20px',
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
      });
    });

    test('maintains preview text content', () => {
      renderWithProviders(<ReadingSettingsPage />);

      const previewText = screen.getByText(
        /Preview paragraph. Adjust settings to see live changes. Lorem ipsum dolor sit amet/
      );
      expect(previewText).toBeInTheDocument();
    });
  });

  describe('Reset Functionality', () => {
    test('resets settings to default values when reset button is clicked', () => {
      renderWithProviders(<ReadingSettingsPage />);

      // Change settings first
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '20' } });

      const select = screen.getByDisplayValue('Serif (Georgia)');
      fireEvent.change(select, { target: { value: 'sans' } });

      // Verify changes
      expect(screen.getByText('Font Size (20px)')).toBeInTheDocument();
      expect(select).toHaveValue('sans');

      // Reset
      const resetButton = screen.getByText('Reset Defaults');
      fireEvent.click(resetButton);

      // Verify reset
      expect(screen.getByText('Font Size (18px)')).toBeInTheDocument();
      expect(select).toHaveValue('serif');
    });

    test('updates preview when settings are reset', () => {
      renderWithProviders(<ReadingSettingsPage />);

      // Change settings first
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '16' } });

      const select = screen.getByDisplayValue('Serif (Georgia)');
      fireEvent.change(select, { target: { value: 'sans' } });

      // Reset
      const resetButton = screen.getByText('Reset Defaults');
      fireEvent.click(resetButton);

      // Verify preview is reset
      const preview = screen.getByText(/Preview paragraph/).closest('.reading-preview');
      expect(preview).toHaveStyle({
        fontSize: '18px',
        fontFamily: 'Georgia, "Times New Roman", serif',
      });
    });
  });

  describe('LocalStorage Integration', () => {
    test('loads settings from localStorage on mount', () => {
      const savedSettings = JSON.stringify({ fontSize: 20, fontFamily: 'sans' });
      localStorageMock.getItem.mockReturnValue(savedSettings);

      renderWithProviders(<ReadingSettingsPage />);

      expect(screen.getByText('Font Size (20px)')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Sans (System UI)')).toBeInTheDocument();
    });

    test('handles corrupted localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      renderWithProviders(<ReadingSettingsPage />);

      // Should fall back to defaults
      expect(screen.getByText('Font Size (18px)')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Serif (Georgia)')).toBeInTheDocument();
    });

    test('handles missing localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValue(null);

      renderWithProviders(<ReadingSettingsPage />);

      // Should use defaults
      expect(screen.getByText('Font Size (18px)')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Serif (Georgia)')).toBeInTheDocument();
    });

    test('saves settings to localStorage when changed', () => {
      renderWithProviders(<ReadingSettingsPage />);

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '20' } });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'yushan.reader.settings.v1',
        JSON.stringify({ fontSize: 20, fontFamily: 'serif' })
      );
    });
  });

  describe('Accessibility', () => {
    test('has proper form labels', () => {
      renderWithProviders(<ReadingSettingsPage />);

      const fontSizeLabel = screen.getByText('Font Size (18px)');
      const fontFamilyLabel = screen.getByText('Font Family');

      expect(fontSizeLabel).toBeInTheDocument();
      expect(fontFamilyLabel).toBeInTheDocument();
    });

    test('slider has proper accessibility attributes', () => {
      renderWithProviders(<ReadingSettingsPage />);

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('min', '14');
      expect(slider).toHaveAttribute('max', '22');
      expect(slider).toHaveAttribute('step', '1');
    });

    test('select has proper accessibility attributes', () => {
      renderWithProviders(<ReadingSettingsPage />);

      const select = screen.getByDisplayValue('Serif (Georgia)');
      expect(select).toBeInTheDocument();
      expect(select.tagName).toBe('SELECT');
    });

    test('reset button has proper accessibility attributes', () => {
      renderWithProviders(<ReadingSettingsPage />);

      const resetButton = screen.getByText('Reset Defaults');
      expect(resetButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Component Structure', () => {
    test('has correct DOM structure', () => {
      renderWithProviders(<ReadingSettingsPage />);

      const page = screen.getByText('Reading Settings').closest('.reading-settings-page');
      expect(page).toBeInTheDocument();

      const card = page.querySelector('.reading-settings-card');
      expect(card).toBeInTheDocument();

      const group = card.querySelector('.reading-settings-group');
      expect(group).toBeInTheDocument();

      const preview = card.querySelector('.reading-preview');
      expect(preview).toBeInTheDocument();

      const actions = card.querySelector('.reading-settings-actions');
      expect(actions).toBeInTheDocument();
    });

    test('has correct heading hierarchy', () => {
      renderWithProviders(<ReadingSettingsPage />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Reading Settings');
    });
  });

  describe('Edge Cases', () => {
    test('handles rapid slider changes', () => {
      renderWithProviders(<ReadingSettingsPage />);

      const slider = screen.getByRole('slider');

      // Rapid changes
      fireEvent.change(slider, { target: { value: '14' } });
      fireEvent.change(slider, { target: { value: '16' } });
      fireEvent.change(slider, { target: { value: '20' } });
      fireEvent.change(slider, { target: { value: '22' } });

      expect(screen.getByText('Font Size (22px)')).toBeInTheDocument();
    });

    test('handles rapid select changes', () => {
      renderWithProviders(<ReadingSettingsPage />);

      const select = screen.getByDisplayValue('Serif (Georgia)');

      // Rapid changes
      fireEvent.change(select, { target: { value: 'sans' } });
      fireEvent.change(select, { target: { value: 'serif' } });
      fireEvent.change(select, { target: { value: 'sans' } });

      expect(select).toHaveValue('sans');
    });

    test('handles multiple reset clicks', () => {
      renderWithProviders(<ReadingSettingsPage />);

      // Change settings
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '20' } });

      const select = screen.getByDisplayValue('Serif (Georgia)');
      fireEvent.change(select, { target: { value: 'sans' } });

      // Multiple resets
      const resetButton = screen.getByText('Reset Defaults');
      fireEvent.click(resetButton);
      fireEvent.click(resetButton);
      fireEvent.click(resetButton);

      // Should still be at defaults
      expect(screen.getByText('Font Size (18px)')).toBeInTheDocument();
      expect(select).toHaveValue('serif');
    });
  });

  describe('Integration with ReadingSettingsProvider', () => {
    test('uses settings from context provider', () => {
      renderWithProviders(<ReadingSettingsPage />);

      // Should use default values from provider
      expect(screen.getByText('Font Size (18px)')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Serif (Georgia)')).toBeInTheDocument();
    });

    test('updates context when settings change', () => {
      renderWithProviders(<ReadingSettingsPage />);

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '20' } });

      // Context should be updated (this is tested through the UI updates)
      expect(screen.getByText('Font Size (20px)')).toBeInTheDocument();
    });
  });

  describe('CSS Classes and Styling', () => {
    test('applies correct CSS classes to elements', () => {
      renderWithProviders(<ReadingSettingsPage />);

      const page = screen.getByText('Reading Settings').closest('.reading-settings-page');
      expect(page).toHaveClass('reading-settings-page');

      const card = page.querySelector('.reading-settings-card');
      expect(card).toHaveClass('reading-settings-card');

      const group = card.querySelector('.reading-settings-group');
      expect(group).toHaveClass('reading-settings-group');

      const preview = card.querySelector('.reading-preview');
      expect(preview).toHaveClass('reading-preview');

      const actions = card.querySelector('.reading-settings-actions');
      expect(actions).toHaveClass('reading-settings-actions');
    });

    test('select wrapper has correct classes', () => {
      renderWithProviders(<ReadingSettingsPage />);

      const selectWrapper = screen
        .getByDisplayValue('Serif (Georgia)')
        .closest('.reading-select-wrapper');
      expect(selectWrapper).toHaveClass('reading-select-wrapper');

      const select = selectWrapper.querySelector('.reading-select');
      expect(select).toHaveClass('reading-select');
    });
  });
});
