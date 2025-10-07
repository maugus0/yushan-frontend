import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WriterCreateChapters from '../writercreatechapters';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock WriterNavbar to avoid unrelated rendering
jest.mock('../../../components/writer/writernavbar/writernavbar', () => () => <div data-testid="mock-navbar" />);

jest.mock('@tinymce/tinymce-react', () => ({
  Editor: (props) => (
    <textarea
      data-testid="mock-editor"
      value={props.value}
      onChange={e => props.onEditorChange(e.target.value)}
    />
  ),
}));

describe('WriterCreateChapters', () => {
  it('renders editor and publish button', () => {
    render(
      <BrowserRouter>
        <WriterCreateChapters />
      </BrowserRouter>
    );
    expect(screen.getByTestId('mock-navbar')).toBeInTheDocument();
    expect(screen.getByText(/PUBLISH/i)).toBeInTheDocument();
    expect(screen.getByTestId('mock-editor')).toBeInTheDocument();
  });

  it('shows publish modal when clicking publish', () => {
    render(
      <BrowserRouter>
        <WriterCreateChapters />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByText(/PUBLISH/i));
    expect(screen.getByText(/Confirm to publish/i)).toBeInTheDocument();
    expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
    expect(screen.getAllByText(/^Publish$/i).length).toBeGreaterThanOrEqual(1);
  });

  it('can cancel publish modal', async () => {
    render(
      <BrowserRouter>
        <WriterCreateChapters />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByText(/PUBLISH/i));
    fireEvent.click(screen.getByText(/Cancel/i));
    await waitFor(() => {
      expect(screen.getByText(/Confirm to publish/i)).not.toBeVisible();
    });
  });

  it('can input content in editor', () => {
    render(
      <BrowserRouter>
        <WriterCreateChapters />
      </BrowserRouter>
    );
    const editor = screen.getByTestId('mock-editor');
    fireEvent.change(editor, { target: { value: 'test content' } });
    expect(editor.value).toBe('test content');
  });

  it('can click back button', () => {
    render(
      <BrowserRouter>
        <WriterCreateChapters />
      </BrowserRouter>
    );
    const backBtn = screen.getByRole('button', { name: /arrow-left/i });
    fireEvent.click(backBtn);
  });

  it('can confirm publish modal', async () => {
    render(
      <BrowserRouter>
        <WriterCreateChapters />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByText(/PUBLISH/i));
    fireEvent.click(screen.getAllByText(/^Publish$/i)[1]);
    await waitFor(() => {
      expect(screen.getByText(/Confirm to publish/i)).not.toBeVisible();
    });
  });
});
