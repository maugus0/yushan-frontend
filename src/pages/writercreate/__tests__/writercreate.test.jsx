import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import WriterCreate from '../writercreate';
import novelService from '../../../services/novel';
import categoriesService from '../../../services/categories';
import { act } from 'react-dom/test-utils';

// --- Mocks ---

// Mock Services
jest.mock('../../../services/novel');
jest.mock('../../../services/categories');

// Mock child components
jest.mock('../../../components/writer/writernavbar/writernavbar', () => {
  const MockWriterNavbar = () => <div data-testid="writer-navbar">Navbar</div>;
  MockWriterNavbar.displayName = 'MockWriterNavbar';
  return MockWriterNavbar;
});

// Mock react-router-dom
const mockNavigate = jest.fn();
const mockUseLocation = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockUseLocation(),
}));

// Mock react-easy-crop
// We need it to call onCropComplete immediately on render to simulate "crop complete"
jest.mock('react-easy-crop', () => {
  const React = jest.requireActual('react');
  const MockCropper = ({ onCropComplete }) => {
    React.useEffect(() => {
      onCropComplete(
        { x: 0, y: 0, width: 100, height: 100 }, // croppedArea
        { x: 0, y: 0, width: 100, height: 100 } // croppedAreaPixels
      );
    }, [onCropComplete]);
    return <div data-testid="mock-cropper">Cropper</div>;
  };
  MockCropper.displayName = 'MockCropper';
  return MockCropper;
});

// Mock @ant-design/icons
jest.mock('@ant-design/icons', () => ({
  ArrowLeftOutlined: () => <span data-testid="icon-arrow-left">Back</span>,
  PlusOutlined: () => <span data-testid="icon-plus">Upload</span>,
  BookOutlined: () => <span data-testid="icon-book">Book</span>,
}));

// Mock Image.onload()
Object.defineProperty(window, 'Image', {
  value: class MockImage {
    constructor() {
      this.src = '';
      this.onload = jest.fn();

      // Asynchronously simulate image loading
      setTimeout(() => {
        if (this.onload) {
          this.onload();
        }
      }, 0);
    }
  },
});

window.FileReader = jest.fn();

// Mock Canvas
window.HTMLCanvasElement.prototype.getContext = jest.fn();
window.HTMLCanvasElement.prototype.toDataURL = jest.fn(
  () => 'data:image/jpeg;base64,mock-cropped-data'
);

// Mock antd (Comprehensive Mock)
jest.mock('antd', () => {
  const React = jest.requireActual('react');
  const antd = jest.requireActual('antd');
  const RealForm = jest.requireActual('antd').Form;

  const createMockComponent = (displayName) => {
    const Mock = (props) => <div {...props} />;
    Mock.displayName = displayName;
    return Mock;
  };

  const MockFormContext = React.createContext(null);

  // Mock Form.Item
  const MockFormItem = ({ children, label, name, ...props }) => {
    const form = React.useContext(MockFormContext);

    const values = form ? form.getFieldsValue() : {};
    const value = name ? values[name] : undefined;

    const handleChange = (e) => {
      const newValue = e && e.target ? e.target.value : e;
      if (form && name) {
        form.setFieldsValue({ [name]: newValue });
      }
    };

    return (
      <div {...props}>
        <label>{label}</label>
        {React.Children.map(children, (child) =>
          React.cloneElement(child, {
            ...child.props,
            'aria-label': label,
            name: name,
            value: value,
            onChange: handleChange,
          })
        )}
      </div>
    );
  };

  // Mock Form
  const MockForm = ({ children, form, onFinish, initialValues = {}, ...props }) => {
    // Set initial values on mount
    React.useEffect(() => {
      if (form && initialValues && Object.keys(initialValues).length > 0) {
        form.setFieldsValue(initialValues);
      }
    }, [form, initialValues]);
    // Patch children with initialValues for inputs
    const patchChildren = (children) => {
      return React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        // For Form.Item, patch its children
        if (child.type && child.type.displayName === 'MockFormItem') {
          return React.cloneElement(child, {
            children: patchChildren(child.props.children),
          });
        }
        // For input/textarea/select, patch value from initialValues if not set
        if (
          (child.type === 'input' || child.type === 'textarea' || child.type === 'select') &&
          child.props.name &&
          initialValues[child.props.name] !== undefined &&
          (child.props.value === undefined || child.props.value === '')
        ) {
          return React.cloneElement(child, {
            value: initialValues[child.props.name],
          });
        }
        return child;
      });
    };
    return (
      <MockFormContext.Provider value={form}>
        <form
          {...props}
          onSubmit={(e) => {
            e.preventDefault();
            onFinish(form.getFieldsValue());
          }}
        >
          {patchChildren(children)}
        </form>
      </MockFormContext.Provider>
    );
  };

  MockForm.Item = MockFormItem;
  MockForm.useForm = RealForm.useForm;

  // Button
  const MockButton = ({ children, onClick, htmlType, icon, ...props }) => (
    <button type={htmlType || 'button'} onClick={onClick} {...props}>
      {icon}
      {children}
    </button>
  );
  MockButton.displayName = 'MockButton';

  // Input and Input.TextArea
  const MockInput = (props) => <input {...props} />;
  MockInput.displayName = 'MockInput';
  MockInput.TextArea = (props) => <textarea {...props} />;
  MockInput.TextArea.displayName = 'MockTextArea';

  // Upload
  const MockUpload = ({ children, onChange, ...props }) => (
    <button
      data-testid="mock-upload"
      {...props}
      onClick={() => {
        const mockFile = new File(['mock-cover-content'], 'cover.png', { type: 'image/png' });
        onChange({ file: { originFileObj: mockFile } });
      }}
    >
      {children}
    </button>
  );
  MockUpload.displayName = 'MockUpload';

  // Select
  const MockSelect = ({ value, onChange, options, placeholder, ...props }) => (
    <select {...props} value={value || ''} onChange={(e) => onChange(e.target.value)}>
      {placeholder && <option value="">{placeholder}</option>}
      {options?.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
  MockSelect.displayName = 'MockSelect';

  // Modal
  const MockModal = ({
    children,
    open,
    title,
    onCancel,
    onOk,
    okText,
    cancelText,
    footer,
    ...props
  }) => {
    if (!open) return null;
    return (
      <div data-testid="mock-modal" {...props}>
        {title && <h2>{title}</h2>}
        <div>{children}</div>
        {footer === null ? null : (
          <div>
            <button onClick={onCancel}>{cancelText || 'Cancel'}</button>
            <button onClick={onOk}>{okText || 'OK'}</button>
            {footer}
          </div>
        )}
      </div>
    );
  };
  MockModal.displayName = 'MockModal';

  // Spin
  const MockSpin = ({ children, spinning, tip, ...props }) => {
    const isSpinning = spinning !== false;
    return isSpinning ? (
      <div data-testid="spinner" {...props}>
        {tip || 'Loading...'}
      </div>
    ) : (
      <>{children}</>
    );
  };
  MockSpin.displayName = 'MockSpin';

  return {
    ...antd,
    Button: MockButton,
    Input: MockInput,
    Upload: MockUpload,
    Select: MockSelect,
    Form: MockForm,
    Modal: MockModal,
    Slider: createMockComponent('MockSlider'),
    Spin: MockSpin,
  };
});

describe('WriterCreate Component', () => {
  // --- Mock Data ---
  const mockCategories = [
    { id: 1, name: 'Fantasy' },
    { id: 2, name: 'Sci-Fi' },
  ];

  const mockNovel = {
    id: 'novel-123',
    title: 'Existing Novel',
    synopsis: 'Old synopsis',
    categoryId: 1,
    coverImgUrl: 'data:image/png;base64,existing-cover-data',
  };

  const mockCreatedNovel = {
    id: 'new-novel-456',
  };

  // --- Helper Functions ---
  const renderComponent = (id = null) => {
    // Mock the return value of useLocation based on the id
    const search = id ? `?id=${id}` : '';
    mockUseLocation.mockReturnValue({ search });

    return render(
      <MemoryRouter>
        <WriterCreate />
      </MemoryRouter>
    );
  };

  // Helper function: fill the form
  const fillTheForm = async () => {
    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getByLabelText('CATEGORY')).toHaveValue('');
    });

    fireEvent.change(screen.getByLabelText('BOOK NAME'), {
      target: { value: 'My New Novel' },
    });
    fireEvent.change(screen.getByLabelText('SYNOPSIS'), {
      target: { value: 'A great story.' },
    });
    fireEvent.change(screen.getByLabelText('CATEGORY'), {
      target: { value: '1' },
    });
  };

  beforeEach(() => {
    jest.resetAllMocks();

    // Mock FileReader with setImmediate for immediate async execution
    window.FileReader.mockImplementation(function () {
      return {
        onload: null,
        onerror: null,
        readAsDataURL: function () {
          // Use setImmediate to simulate async but execute immediately after current event loop
          if (this.onload) {
            this.onload({
              target: {
                result: 'data:image/png;base64,mock-image-data',
              },
            });
          }
        },
      };
    });

    window.HTMLCanvasElement.prototype.getContext.mockReturnValue({
      drawImage: jest.fn(),
    });
    window.HTMLCanvasElement.prototype.toDataURL.mockReturnValue(
      'data:image/jpeg;base64,mock-cropped-data'
    );

    // Default successful service Mocks
    categoriesService.getCategories.mockResolvedValue(mockCategories);
    novelService.createNovel.mockResolvedValue(mockCreatedNovel);
    novelService.changeNovelDetailById.mockResolvedValue(mockNovel);
    novelService.getNovelById.mockResolvedValue(mockNovel);
    novelService.submitNovelForReview.mockResolvedValue({});

    // Default (Create Mode)
    mockUseLocation.mockReturnValue({ search: '' });
  });

  // --- Test Cases ---

  // Test 1: renders loading spinner initially while fetching categories
  test('renders loading spinner initially while fetching categories', () => {
    // Prevent the categories service from resolving immediately
    categoriesService.getCategories.mockImplementation(() => new Promise(() => {}));
    renderComponent();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  // Test 2: renders the form in create mode after categories load
  test('renders the form in create mode after categories load', async () => {
    renderComponent();

    // Wait for the spinner to disappear
    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    // Check for form elements
    expect(screen.getByText('Create Story')).toBeInTheDocument();
    expect(screen.getByLabelText('BOOK NAME')).toBeInTheDocument();
    expect(screen.getByLabelText('BOOK COVER')).toBeInTheDocument();
    expect(screen.getByLabelText('CATEGORY')).toBeInTheDocument();
    expect(screen.getByLabelText('SYNOPSIS')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'UPLOAD FOR REVIEW' })).toBeInTheDocument();

    // Check if categories are populated
    expect(screen.getByText('Fantasy')).toBeInTheDocument();
    expect(screen.getByText('Sci-Fi')).toBeInTheDocument();
  });

  // Test 3: navigates back when back button is clicked
  test('navigates back when back button is clicked', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    // antd Button icon={...} places the icon inside the button
    fireEvent.click(screen.getByTestId('icon-arrow-left').parentElement);
    expect(mockNavigate).toHaveBeenCalledWith('/writerworkspace');
  });

  // Test 4: shows error modal if fetching categories fails
  test('shows error modal if fetching categories fails', async () => {
    categoriesService.getCategories.mockRejectedValue(new Error('Failed to load'));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });

    // Our Error Modal implementation is custom, so we check this way
    expect(screen.getByText('Failed to load categories.')).toBeInTheDocument();

    // Close the Modal
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    await waitFor(() => {
      expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    });
  });

  // Test 6: shows error modal if submitting without a cover
  test('shows error modal if submitting without a cover', async () => {
    renderComponent();
    await fillTheForm(); // Fill the form, but don't upload a cover

    fireEvent.click(screen.getByRole('button', { name: 'UPLOAD FOR REVIEW' }));

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });
    expect(screen.getByText('Please upload a book cover before submitting.')).toBeInTheDocument();
    expect(novelService.createNovel).not.toHaveBeenCalled();
  });

  // Test 10: submits updated novel successfully in edit mode
  test('submits updated novel successfully in edit mode', async () => {
    renderComponent(mockNovel.id);

    // Wait for spinner to disappear
    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    // Change form data
    await act(async () => {
      fireEvent.change(screen.getByLabelText('BOOK NAME'), {
        target: { value: 'My Updated Title' },
      });
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText('CATEGORY'), {
        target: { value: '2' },
      });
    });

    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'UPLOAD FOR REVIEW' }));
    });

    expect(novelService.createNovel).not.toHaveBeenCalled();
    expect(novelService.submitNovelForReview).toHaveBeenCalledWith(mockNovel.id);

    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(mockNavigate).toHaveBeenCalledWith('/writerworkspace');
  });

  // Test 11: shows error modal if fetching novel details fails in edit mode
  test('shows error modal if fetching novel details fails in edit mode', async () => {
    novelService.getNovelById.mockRejectedValue(new Error('Failed to load novel'));
    renderComponent(mockNovel.id);

    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getByLabelText('CATEGORY')).toHaveValue('');
    });

    // At this point, getNovelById fails
    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to load novel details.')).toBeInTheDocument();
  });

  // Test 12: shows error modal if changeNovelDetailById API fails in edit mode
  test('shows error modal if changeNovelDetailById API fails in edit mode', async () => {
    const apiError = new Error('Failed to update novel');
    novelService.changeNovelDetailById.mockRejectedValue(apiError);

    renderComponent(mockNovel.id);

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'UPLOAD FOR REVIEW' }));
    });

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });
    expect(screen.queryByText('Success!')).not.toBeInTheDocument();
  });

  // Test 13: shows error modal if submitNovelForReview API fails
  test('shows error modal if submitNovelForReview API fails', async () => {
    const apiError = new Error('Failed to submit for review');
    novelService.submitNovelForReview.mockRejectedValue(apiError);

    renderComponent(mockNovel.id);

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'UPLOAD FOR REVIEW' }));
    });

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });
    expect(screen.queryByText('Success!')).not.toBeInTheDocument();
  });
});
