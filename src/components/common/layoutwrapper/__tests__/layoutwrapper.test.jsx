import { render, screen } from '@testing-library/react';
import { act } from '@testing-library/react';
import LayoutWrapper from '../layout-wrapper';

// Mock child components to keep test lightweight and deterministic
jest.mock('../../navbar/navbar', () => {
  function MockNavbar() {
    return <div data-testid="mock-navbar">Navbar</div>;
  }
  return MockNavbar;
});
jest.mock('../../footer/footer', () => {
  function MockFooter() {
    return <div data-testid="mock-footer">Footer</div>;
  }
  return MockFooter;
});

const renderLayout = async (ui) => {
  let utils;
  await act(async () => {
    utils = render(ui);
    await Promise.resolve();
  });
  return utils;
};

describe('LayoutWrapper', () => {
  it('renders Navbar, Footer and children', async () => {
    await renderLayout(
      <LayoutWrapper>
        <div data-testid="child">Hello</div>
      </LayoutWrapper>
    );

    // Navbar and Footer from mocks
    expect(screen.getByTestId('mock-navbar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();

    // Children appear within content container
    const child = screen.getByTestId('child');
    expect(child).toBeInTheDocument();

    // Structure classes present
    const main = document.querySelector('.main-content');
    const container = document.querySelector('.content-container');
    expect(main).toBeTruthy();
    expect(container).toBeTruthy();
    expect(container).toContainElement(child);
  });

  it('applies custom className on root layout', async () => {
    await renderLayout(
      <LayoutWrapper className="extra-class">
        <span>content</span>
      </LayoutWrapper>
    );

    const root = document.querySelector('.layout-wrapper');
    expect(root).toBeTruthy();
    expect(root.className).toContain('layout-wrapper');
    expect(root.className).toContain('extra-class');
  });

  it('renders multiple children correctly', async () => {
    await renderLayout(
      <LayoutWrapper>
        <p data-testid="p1">First</p>
        <p data-testid="p2">Second</p>
      </LayoutWrapper>
    );

    const container = document.querySelector('.content-container');
    expect(container).toContainElement(screen.getByTestId('p1'));
    expect(container).toContainElement(screen.getByTestId('p2'));
  });
});
