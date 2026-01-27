import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { Checkbox } from '../checkbox';

describe('Checkbox', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render checkbox element', () => {
    render(<Checkbox />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('should render unchecked by default', () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('should render checked when defaultChecked is true', () => {
    render(<Checkbox defaultChecked />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('should handle controlled checked state', () => {
    render(<Checkbox checked onChange={() => {}} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('should toggle checked state on click', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<Checkbox onCheckedChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(handleChange).toHaveBeenCalled();
  });

  it('should support disabled prop', () => {
    render(<Checkbox disabled />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('should not toggle when disabled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<Checkbox disabled onCheckedChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('should support required prop', () => {
    render(<Checkbox required />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-required', 'true');
  });

  it('should support className prop', () => {
    const { container } = render(<Checkbox className="custom-class" />);
    const checkbox = container.querySelector('[role="checkbox"]');
    expect(checkbox?.className).toContain('custom-class');
  });

  it.skip('should support name attribute', () => {
    const { container } = render(<Checkbox name="agree" />);
    const input = container.querySelector('input[type="checkbox"]')!;
    expect(input).toBeInTheDocument();
    expect(input.name).toBe('agree');
  });

  it('should support value attribute', () => {
    render(<Checkbox value="option-1" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.value).toBe('option-1');
  });

  it('should handle controlled and uncontrolled states', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<Checkbox defaultChecked onCheckedChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(handleChange).toHaveBeenCalled();
  });

  it('should handle rapid clicks', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<Checkbox onCheckedChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    await user.click(checkbox);
    await user.click(checkbox);
    await user.click(checkbox);

    expect(handleChange).toHaveBeenCalledTimes(4);
  });
});
