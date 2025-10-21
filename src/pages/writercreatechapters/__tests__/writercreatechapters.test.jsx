import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import WriterCreateChapters from '../writercreatechapters';
import chapterService from '../../../services/chapter';

// --- Mocks ---
jest.mock('../../../services/chapter');

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

jest.mock('@tinymce/tinymce-react', () => ({
  Editor: ({ value, onEditorChange }) => (
    <textarea
      data-testid="mock-editor"
      value={value || ''}
      onChange={(e) => onEditorChange(e.target.value)}
    />
  ),
}));

jest.mock('../../../components/writer/writernavbar/writernavbar', () => {
  const MockWriterNavbar = () => <div data-testid="writer-navbar">Navbar</div>;
  MockWriterNavbar.displayName = 'MockWriterNavbar';
  return MockWriterNavbar;
});

jest.mock('antd', () => {
  const React = jest.requireActual('react');
  const antd = jest.requireActual('antd');

  const MockModal = ({ children, open, onCancel, onOk, footer, title }) => {
    if (!open) return null;

    const renderFooter = () => {
      if (footer === null) return null;
      if (footer && Array.isArray(footer)) {
        return footer.map((button, i) => <React.Fragment key={i}>{button}</React.Fragment>);
      }
      return (
        <div>
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onOk} data-testid="modal-confirm-button">
            OK
          </button>
        </div>
      );
    };

    return (
      <div data-testid="mock-modal" aria-label={title || 'modal'}>
        {title && <div data-testid="modal-title">{title}</div>}
        <div>{children}</div>
        <div>{renderFooter()}</div>
      </div>
    );
  };
  MockModal.displayName = 'MockModal';

  const MockSpin = ({ children, spinning, tip, 'data-testid': dataTestId, ...props }) => {
    // If spinning is undefined, treat it as true (default Spin behavior)
    const isSpinning = spinning !== false;
    return isSpinning ? (
      <div data-testid={dataTestId || 'spinner'} {...props}>
        {tip || 'Loading...'}
      </div>
    ) : (
      <>{children}</>
    );
  };
  MockSpin.displayName = 'MockSpin';

  return {
    ...antd,
    Modal: MockModal,
    Spin: MockSpin,
  };
});

// Mock window.location
delete window.location;
window.location = { search: '', pathname: '/writercreatechapters' };

describe('WriterCreateChapters Component', () => {
  const renderComponent = (searchString = '?novelid=1') => {
    window.location.search = searchString;
    return render(
      <MemoryRouter>
        <WriterCreateChapters />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    window.location.search = '';
    chapterService.getNextChapterNumber.mockResolvedValue({ data: 2 });
    chapterService.getChapterByChapterId.mockResolvedValue({
      data: { chapterNumber: 1, title: 'Existing Chapter', content: 'Existing Content' },
    });
    chapterService.createChapters.mockResolvedValue({});
    chapterService.editChapters.mockResolvedValue({});
  });

  // Test 1: renders loading spinner initially
  test('renders loading spinner initially', () => {
    chapterService.getNextChapterNumber.mockImplementation(() => new Promise(() => {}));
    renderComponent('?novelid=1');
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  // Test 2: renders chapter number and name input in create mode
  test('renders chapter number and name input in create mode', async () => {
    chapterService.getNextChapterNumber.mockResolvedValue({ data: 2 });
    renderComponent('?novelid=1');

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter chapter name')).toBeInTheDocument();
    });

    const chapterNumberInput = await screen.findByDisplayValue('2');
    expect(chapterNumberInput).toBeInTheDocument();
    expect(chapterNumberInput).toBeDisabled();
    expect(chapterService.getNextChapterNumber).toHaveBeenCalledWith('1');
  });

  // Test 3: shows error modal if getNextChapterNumber fails
  test('shows error modal if getNextChapterNumber fails', async () => {
    const errorMsg = 'Failed to get next chapter number.';
    chapterService.getNextChapterNumber.mockRejectedValueOnce(new Error(errorMsg));
    renderComponent('?novelid=1');

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });

    expect(screen.getByText(errorMsg)).toBeInTheDocument();

    const okButton = screen.getByRole('button', { name: /OK/i });
    fireEvent.click(okButton);

    await waitFor(() => {
      expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    });
  });

  // Test 4: shows error modal if chapter name is empty on publish
  test('shows error modal if chapter name is empty on publish', async () => {
    chapterService.getNextChapterNumber.mockResolvedValue({ data: 3 });
    renderComponent('?novelid=1');

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter chapter name')).toBeInTheDocument();
    });

    const publishButton = screen.getByRole('button', { name: /PUBLISH/i });
    fireEvent.click(publishButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm to publish?')).toBeInTheDocument();
    });

    // 2. Find the confirmation modal specifically
    const confirmationModal = screen.getByTestId('mock-modal');

    // 3. Find the "Publish" button *within* that modal
    const publishConfirmButton = within(confirmationModal).getByRole('button', {
      name: /Publish/i,
    });
    fireEvent.click(publishConfirmButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a chapter name.')).toBeInTheDocument();
    });

    const okButton = screen.getByRole('button', { name: /OK/i });
    fireEvent.click(okButton);

    await waitFor(() => {
      expect(screen.queryByText('Please enter a chapter name.')).not.toBeInTheDocument();
    });
  });

  // Test 5: successfully creates chapter
  test('calls createChapters and navigates back on publish', async () => {
    chapterService.getNextChapterNumber.mockResolvedValue({ data: 4 });
    chapterService.createChapters.mockResolvedValue({});
    renderComponent('?novelid=1');

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter chapter name')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Enter chapter name'), {
      target: { value: 'Chapter 1' },
    });
    fireEvent.change(screen.getByTestId('mock-editor'), {
      target: { value: 'Content here' },
    });

    const publishButton = screen.getByRole('button', { name: /PUBLISH/i });
    fireEvent.click(publishButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm to publish?')).toBeInTheDocument();
    });

    const confirmationModal = screen.getByTestId('mock-modal');
    const publishConfirmButton = within(confirmationModal).getByRole('button', {
      name: /Publish/i,
    });
    fireEvent.click(publishConfirmButton);

    await waitFor(() => {
      expect(chapterService.createChapters).toHaveBeenCalledWith({
        novelId: 1,
        chapterNumber: 4,
        title: 'Chapter 1',
        content: 'Content here',
      });
    });

    expect(mockedNavigate).toHaveBeenCalledWith(-1);
  });

  // Test 6: shows error modal if createChapters fails
  test('shows error modal if createChapters fails', async () => {
    chapterService.getNextChapterNumber.mockResolvedValue({ data: 5 });
    const errorMsg = 'Failed to save chapter.';
    chapterService.createChapters.mockRejectedValueOnce(new Error(errorMsg));
    renderComponent('?novelid=1');

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter chapter name')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Enter chapter name'), {
      target: { value: 'Chapter 2' },
    });
    fireEvent.change(screen.getByTestId('mock-editor'), {
      target: { value: 'Some content' },
    });

    const publishButton = screen.getByRole('button', { name: /PUBLISH/i });
    fireEvent.click(publishButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm to publish?')).toBeInTheDocument();
    });

    const confirmationModal = screen.getByTestId('mock-modal');
    const publishConfirmButton = within(confirmationModal).getByRole('button', {
      name: /Publish/i,
    });
    fireEvent.click(publishConfirmButton);

    await waitFor(() => {
      expect(chapterService.createChapters).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText(errorMsg)).toBeInTheDocument();
    });

    const okButton = screen.getByRole('button', { name: /OK/i });
    fireEvent.click(okButton);

    await waitFor(() => {
      expect(screen.queryByText(errorMsg)).not.toBeInTheDocument();
    });
  });

  // Test 7: edit mode - loads chapter details correctly
  test('edit mode: loads chapter details correctly', async () => {
    const chapterId = 'abc123';
    const novelId = '5';
    const initialData = {
      chapterNumber: 7,
      title: 'Edit Chapter',
      content: 'Edit Content',
    };
    chapterService.getChapterByChapterId.mockResolvedValue({ data: initialData });

    renderComponent(`?novelid=${novelId}&chapterid=${chapterId}`);

    await waitFor(() => {
      expect(chapterService.getChapterByChapterId).toHaveBeenCalledWith(chapterId);
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('7')).toBeInTheDocument();
    });

    const titleInput = await screen.findByDisplayValue('Edit Chapter');
    expect(titleInput).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('mock-editor')).toHaveValue('Edit Content');
    });
  });

  // Test 8: edit mode - calls editChapters and navigates back on publish
  test('edit mode: calls editChapters and navigates back on publish', async () => {
    const chapterId = 'abc123';
    const novelId = '1';
    const initialData = {
      chapterNumber: 7,
      title: 'Edit Chapter',
      content: 'Edit Content',
    };
    chapterService.getChapterByChapterId.mockResolvedValue({ data: initialData });
    chapterService.editChapters.mockResolvedValue({});

    renderComponent(`?novelid=${novelId}&chapterid=${chapterId}`);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Edit Chapter')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('mock-editor'), {
      target: { value: 'Updated Content' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter chapter name'), {
      target: { value: 'Updated Chapter Title' },
    });

    const publishButton = screen.getByRole('button', { name: /PUBLISH/i });
    fireEvent.click(publishButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm to publish?')).toBeInTheDocument();
    });

    const confirmationModal = screen.getByTestId('mock-modal');
    const publishConfirmButton = within(confirmationModal).getByRole('button', {
      name: /Publish/i,
    });
    fireEvent.click(publishConfirmButton);

    await waitFor(() => {
      expect(chapterService.editChapters).toHaveBeenCalledWith({
        title: 'Updated Chapter Title',
        content: 'Updated Content',
        uuid: chapterId,
      });
    });

    expect(mockedNavigate).toHaveBeenCalledWith(-1);
  });

  // Test 9: edit mode - shows error modal if getChapterByChapterId fails
  test('edit mode: shows error modal if getChapterByChapterId fails', async () => {
    const chapterId = 'def456';
    const novelId = '2';
    const errorMsg = 'Failed to load chapter details.';
    chapterService.getChapterByChapterId.mockRejectedValueOnce(new Error(errorMsg));

    renderComponent(`?novelid=${novelId}&chapterid=${chapterId}`);

    await waitFor(() => {
      expect(chapterService.getChapterByChapterId).toHaveBeenCalledWith(chapterId);
    });

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
      expect(screen.getByText(errorMsg)).toBeInTheDocument();
    });

    const okButton = screen.getByRole('button', { name: /OK/i });
    fireEvent.click(okButton);

    await waitFor(() => {
      expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    });
  });

  // Test 10: edit mode - shows error modal if editChapters fails
  test('edit mode: shows error modal if editChapters fails', async () => {
    const chapterId = 'ghi789';
    const novelId = '3';
    const initialData = {
      chapterNumber: 8,
      title: 'Another Chapter',
      content: 'More Content',
    };
    const errorMsg = 'Failed to save edits.';
    chapterService.getChapterByChapterId.mockResolvedValue({ data: initialData });
    chapterService.editChapters.mockRejectedValueOnce(new Error(errorMsg));

    renderComponent(`?novelid=${novelId}&chapterid=${chapterId}`);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Another Chapter')).toBeInTheDocument();
    });

    expect(screen.getByTestId('mock-editor')).toHaveValue('More Content');

    fireEvent.change(screen.getByTestId('mock-editor'), {
      target: { value: 'Failed Update Content' },
    });

    const publishButton = screen.getByRole('button', { name: /PUBLISH/i });
    fireEvent.click(publishButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm to publish?')).toBeInTheDocument();
    });

    const confirmationModal = screen.getByTestId('mock-modal');
    const publishConfirmButton = within(confirmationModal).getByRole('button', {
      name: /Publish/i,
    });
    fireEvent.click(publishConfirmButton);

    await waitFor(() => {
      expect(chapterService.editChapters).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText(errorMsg)).toBeInTheDocument();
    });

    const okButton = screen.getByRole('button', { name: /OK/i });
    fireEvent.click(okButton);

    await waitFor(() => {
      expect(screen.queryByText(errorMsg)).not.toBeInTheDocument();
    });

    expect(mockedNavigate).not.toHaveBeenCalledWith(-1);
  });

  // Test 11: cancel publish confirmation modal
  test('cancels publish confirmation modal', async () => {
    chapterService.getNextChapterNumber.mockResolvedValue({ data: 6 });
    renderComponent('?novelid=1');

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter chapter name')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Enter chapter name'), {
      target: { value: 'Test Chapter' },
    });

    const publishButton = screen.getByRole('button', { name: /PUBLISH/i });
    fireEvent.click(publishButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm to publish?')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Confirm to publish?')).not.toBeInTheDocument();
    });

    expect(chapterService.createChapters).not.toHaveBeenCalled();
  });

  // Test 12: handles chapter name with whitespace trimming
  test('trims whitespace from chapter name on publish', async () => {
    chapterService.getNextChapterNumber.mockResolvedValue({ data: 8 });
    chapterService.createChapters.mockResolvedValue({});
    renderComponent('?novelid=1');

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter chapter name')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Enter chapter name'), {
      target: { value: '  Chapter Title  ' },
    });
    fireEvent.change(screen.getByTestId('mock-editor'), {
      target: { value: 'Content' },
    });

    const publishButton = screen.getByRole('button', { name: /PUBLISH/i });
    fireEvent.click(publishButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm to publish?')).toBeInTheDocument();
    });

    const confirmationModal = screen.getByTestId('mock-modal');
    const publishConfirmButton = within(confirmationModal).getByRole('button', {
      name: /Publish/i,
    });
    fireEvent.click(publishConfirmButton);

    await waitFor(() => {
      expect(chapterService.createChapters).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Chapter Title',
        })
      );
    });
  });

  // Test 13: handles novelid parameter variations
  test('handles novelid parameter (alternative naming)', async () => {
    chapterService.getNextChapterNumber.mockResolvedValue({ data: 9 });
    renderComponent('?id=5');

    await waitFor(() => {
      expect(chapterService.getNextChapterNumber).toHaveBeenCalledWith('5');
    });
  });

  // Test 14: editor content updates correctly
  test('updates editor content on change', async () => {
    chapterService.getNextChapterNumber.mockResolvedValue({ data: 10 });
    renderComponent('?novelid=1');

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter chapter name')).toBeInTheDocument();
    });

    const editor = screen.getByTestId('mock-editor');

    fireEvent.change(editor, { target: { value: 'New content' } });
    expect(editor).toHaveValue('New content');

    fireEvent.change(editor, { target: { value: 'Updated content' } });
    expect(editor).toHaveValue('Updated content');
  });

  // Test 15: renders navbar component
  test('renders writer navbar', async () => {
    chapterService.getNextChapterNumber.mockResolvedValue({ data: 11 });
    renderComponent('?novelid=1');

    expect(screen.getByTestId('writer-navbar')).toBeInTheDocument();
  });

  // Test 16: chapter number is read-only in create mode
  test('chapter number input is read-only', async () => {
    chapterService.getNextChapterNumber.mockResolvedValue({ data: 12 });
    renderComponent('?novelid=1');

    const chapterNumberInput = await screen.findByDisplayValue('12');
    expect(chapterNumberInput).toBeDisabled();

    // Verify it has readonly attribute
    expect(chapterNumberInput).toHaveAttribute('readonly');
  });

  // Test 17: edit mode preserves chapter number
  test('edit mode: chapter number remains unchanged', async () => {
    const chapterId = 'test123';
    const initialData = {
      chapterNumber: 5,
      title: 'Test',
      content: 'Test content',
    };
    chapterService.getChapterByChapterId.mockResolvedValue({ data: initialData });

    renderComponent(`?novelid=1&chapterid=${chapterId}`);

    await waitFor(() => {
      expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    });

    const chapterNumberInput = screen.getByDisplayValue('5');
    expect(chapterNumberInput).toBeDisabled();
  });
});
