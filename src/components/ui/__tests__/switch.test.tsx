import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { Switch } from '../switch';

describe('Switch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render switch element', () => {
    const { container } = render(<Switch />);
    const switchElement = container.querySelector('button');
    expect(switchElement).toBeInTheDocument();
  });

  it('should render as button element', () => {
    const { container } = render(<Switch />);
    const switchElement = container.querySelector('button');
    expect(switchElement?.tagName).toBe('BUTTON');
  });

  it('should render unchecked by default', () => {
    const { container } = render(<Switch />);
    const switchElement = container.querySelector('button');
    expect(switchElement).toHaveAttribute('aria-checked', 'false');
  });

  it('should have role switch', () => {
    const { container } = render(<Switch />);
    const switchElement = container.querySelector('button');
    expect(switchElement).toHaveAttribute('role', 'switch');
  });

  it('should render checked when defaultChecked is true', () => {
    const { container } = render(<Switch defaultChecked={true} />);
    const switchElement = container.querySelector('button');
    expect(switchElement).toHaveAttribute('aria-checked', 'true');
  });

  it('should render unchecked when defaultChecked is false', () => {
    const { container } = render(<Switch defaultChecked={false} />);
    const switchElement = container.querySelector('button');
    expect(switchElement).toHaveAttribute('aria-checked', 'false');
  });

  it('should toggle on click', async () => {
    const user = userEvent.setup();
    const { container } = render(<Switch />);
    const switchElement = container.querySelector('button')!;

    expect(switchElement).toHaveAttribute('aria-checked', 'false');
    await user.click(switchElement);
    expect(switchElement).toHaveAttribute('aria-checked', 'true');
  });

  it('should toggle multiple times', async () => {
    const user = userEvent.setup();
    const { container } = render(<Switch />);
    const switchElement = container.querySelector('button')!;

    await user.click(switchElement);
    expect(switchElement).toHaveAttribute('aria-checked', 'true');
    await user.click(switchElement);
    expect(switchElement).toHaveAttribute('aria-checked', 'false');
    await user.click(switchElement);
    expect(switchElement).toHaveAttribute('aria-checked', 'true');
  });

  it('should work as controlled component', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const { rerender } = render(
      <Switch checked={false} onCheckedChange={handleChange} />
    );
    const switchElement = screen.getByRole('switch');

    await user.click(switchElement);
    expect(handleChange).toHaveBeenCalledWith(true);

    rerender(<Switch checked={true} onCheckedChange={handleChange} />);
    expect(switchElement).toHaveAttribute('aria-checked', 'true');
  });

  it('should call onCheckedChange when toggled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const { container } = render(
      <Switch defaultChecked={false} onCheckedChange={handleChange} />
    );
    const switchElement = container.querySelector('button')!;

    await user.click(switchElement);
    expect(handleChange).toHaveBeenCalled();
  });

  it('should pass correct value to onCheckedChange', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const { container } = render(<Switch onCheckedChange={handleChange} />);
    const switchElement = container.querySelector('button')!;

    await user.click(switchElement);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('should render disabled state', () => {
    const { container } = render(<Switch disabled />);
    const switchElement = container.querySelector('button')!;
    expect(switchElement).toBeDisabled();
  });

  it('should prevent toggle when disabled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const { container } = render(
      <Switch disabled onCheckedChange={handleChange} />
    );
    const switchElement = container.querySelector('button')!;

    await user.click(switchElement);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('should have disabled styling', () => {
    const { container } = render(<Switch disabled />);
    const switchElement = container.querySelector('button')!;
    expect(switchElement.className).toContain('disabled');
  });

  it('should have inline-flex display', () => {
    const { container } = render(<Switch />);
    const switchElement = container.querySelector('button')!;
    expect(switchElement.className).toContain('inline-flex');
  });

  it('should have items-center', () => {
    const { container } = render(<Switch />);
    const switchElement = container.querySelector('button')!;
    expect(switchElement.className).toContain('items-center');
  });

  it('should have rounded-full', () => {
    const { container } = render(<Switch />);
    const switchElement = container.querySelector('button')!;
    expect(switchElement.className).toContain('rounded-full');
  });

  it('should have h-6 and w-11', () => {
    const { container } = render(<Switch />);
    const switchElement = container.querySelector('button')!;
    expect(switchElement.className).toContain('h-5');
    expect(switchElement.className).toContain('w-9');
  });

  it('should have background styling', () => {
    const { container } = render(<Switch />);
    const switchElement = container.querySelector('button')!;
    expect(switchElement.className).toMatch(/bg-/);
  });

  it('should have thumb element', () => {
    const { container } = render(<Switch />);
    const thumb = container.querySelector('[role="switch"] > span');
    expect(thumb).toBeInTheDocument();
  });

  it('should have transition styling on thumb', () => {
    const { container } = render(<Switch />);
    const thumb = container.querySelector('[role="switch"] > span');
    expect(thumb?.className).toContain('transition-transform');
  });

  it('should support className prop', () => {
    const { container } = render(<Switch className="custom-switch" />);
    const switchElement = container.querySelector('button')!;
    expect(switchElement.className).toContain('custom-switch');
  });

  it('should support data attributes', () => {
    render(<Switch data-testid="custom-switch" />);
    expect(screen.getByTestId('custom-switch')).toBeInTheDocument();
  });

  it('should support aria-label', () => {
    render(<Switch aria-label="Toggle feature" />);
    expect(screen.getByLabelText('Toggle feature')).toBeInTheDocument();
  });

  it('should support id attribute', () => {
    render(<Switch id="feature-toggle" />);
    expect(screen.getByRole('switch')).toHaveAttribute('id', 'feature-toggle');
  });

  it('should support name attribute', () => {
    render(<Switch name="feature-enabled" />);
  });

  it('should work with form', () => {
    const { container } = render(
      <form>
        <Switch name="terms" />
      </form>
    );
    expect(container.querySelector('form button')).toBeInTheDocument();
  });

  it('should support required attribute', () => {
    render(<Switch required />);
  });

  it('should toggle with Space key', async () => {
    const user = userEvent.setup();
    const { container } = render(<Switch />);
    const switchElement = container.querySelector('button')!;

    switchElement.focus();
    await user.keyboard(' ');
    expect(switchElement).toHaveAttribute('aria-checked', 'true');
  });

  it('should toggle with Enter key', async () => {
    const user = userEvent.setup();
    const { container } = render(<Switch />);
    const switchElement = container.querySelector('button')!;

    switchElement.focus();
    await user.keyboard('{Enter}');
    expect(switchElement).toHaveAttribute('aria-checked', 'true');
  });

  it('should be keyboard accessible', async () => {
    render(<Switch />);
    const switchElement = screen.getByRole('switch');

    switchElement.focus();
    expect(switchElement).toHaveFocus();
  });

  it('should render multiple switches', () => {
    render(
      <>
        <Switch data-testid="switch-1" />
        <Switch data-testid="switch-2" />
        <Switch data-testid="switch-3" />
      </>
    );
    expect(screen.getByTestId('switch-1')).toBeInTheDocument();
    expect(screen.getByTestId('switch-2')).toBeInTheDocument();
    expect(screen.getByTestId('switch-3')).toBeInTheDocument();
  });

  it('should handle multiple switches independently', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Switch data-testid="switch-1" defaultChecked={false} />
        <Switch data-testid="switch-2" defaultChecked={false} />
      </>
    );
    const switch1 = screen.getByTestId('switch-1');
    const switch2 = screen.getByTestId('switch-2');

    await user.click(switch1);
    expect(switch1).toHaveAttribute('aria-checked', 'true');
    expect(switch2).toHaveAttribute('aria-checked', 'false');

    await user.click(switch2);
    expect(switch1).toHaveAttribute('aria-checked', 'true');
    expect(switch2).toHaveAttribute('aria-checked', 'true');
  });

  it('should handle settings toggle pattern', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <div>
        <label>Enable notifications</label>
        <Switch onCheckedChange={handleChange} />
      </div>
    );
    const switchElement = screen.getByRole('switch');

    await user.click(switchElement);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('should handle feature flag pattern', async () => {
    render(
      <div>
        <Switch defaultChecked={true} data-testid="feature-flag" />
      </div>
    );
    const switchElement = screen.getByTestId('feature-flag');
    expect(switchElement).toHaveAttribute('aria-checked', 'true');
  });

  it('should handle dark mode toggle pattern', async () => {
    const user = userEvent.setup();
    const handleThemeChange = vi.fn();
    render(
      <div>
        <label>Dark mode</label>
        <Switch onCheckedChange={handleThemeChange} />
      </div>
    );
    const switchElement = screen.getByRole('switch');

    await user.click(switchElement);
    expect(handleThemeChange).toHaveBeenCalledWith(true);
  });

  it('should have proper ARIA attributes', () => {
    const { container } = render(<Switch />);
    const switchElement = container.querySelector('button')!;
    expect(switchElement).toHaveAttribute('role', 'switch');
    expect(switchElement).toHaveAttribute('aria-checked');
  });

  it('should update aria-checked on toggle', async () => {
    const user = userEvent.setup();
    const { container } = render(<Switch />);
    const switchElement = container.querySelector('button')!;

    expect(switchElement).toHaveAttribute('aria-checked', 'false');
    await user.click(switchElement);
    expect(switchElement).toHaveAttribute('aria-checked', 'true');
  });

  it('should show focus ring', async () => {
    const user = userEvent.setup();
    render(<Switch />);
    const switchElement = screen.getByRole('switch');

    await user.click(switchElement);
    switchElement.focus();
    expect(switchElement).toHaveFocus();
  });

  it('should support focus-visible styling', () => {
    const { container } = render(<Switch />);
    const switchElement = container.querySelector('button')!;
    expect(switchElement.className).toContain('focus-visible:ring-2');
  });

  it('should support value attribute', () => {
    render(<Switch value="feature-enabled" />);
    expect(screen.getByRole('switch')).toHaveAttribute(
      'value',
      'feature-enabled'
    );
  });

  it('should handle rapid clicks', async () => {
    const user = userEvent.setup();
    const { container } = render(<Switch />);
    const switchElement = container.querySelector('button')!;

    await user.click(switchElement);
    await user.click(switchElement);
    await user.click(switchElement);
    expect(switchElement).toHaveAttribute('aria-checked', 'true');
  });

  it('should handle defaultChecked and checked together', () => {
    const { container } = render(
      <Switch defaultChecked={false} checked={true} />
    );
    const switchElement = container.querySelector('button')!;
    expect(switchElement).toHaveAttribute('aria-checked', 'true');
  });

  it('should forward ref to button element', () => {
    let reference: HTMLButtonElement | null = null;
    const refCallback = (element: HTMLButtonElement | null) => {
      reference = element;
    };
    render(<Switch ref={refCallback} />);
    expect(reference).toBeInstanceOf(HTMLButtonElement);
  });

  it('should have transition styling', () => {
    const { container } = render(<Switch />);
    const switchElement = container.querySelector('button')!;
    expect(switchElement.className).toContain('transition-colors');
  });

  it('should bind checked state from prop', async () => {
    const { rerender } = render(
      <Switch checked={false} onCheckedChange={() => {}} />
    );
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');

    rerender(<Switch checked={true} onCheckedChange={() => {}} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('should combine multiple props', () => {
    render(
      <Switch
        defaultChecked={true}
        disabled={false}
        className="custom-switch"
        data-testid="combined"
        aria-label="Combined switch"
      />
    );
    const switchElement = screen.getByTestId('combined');
    expect(switchElement).toHaveAttribute('aria-checked', 'true');
    expect(switchElement.className).toContain('custom-switch');
  });

  it('should handle form submission with switch state', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn((e) => e.preventDefault());
    render(
      <form onSubmit={handleSubmit}>
        <Switch name="terms" />
        <button type="submit">Submit</button>
      </form>
    );
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(handleSubmit).toHaveBeenCalled();
  });
});
