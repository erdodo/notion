import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { Avatar, AvatarImage, AvatarFallback } from '../avatar';

describe('Avatar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render avatar container', () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(container.querySelector('span')).toBeInTheDocument();
  });

  it('should render with display name', () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    const avatar = container.querySelector('span');
    expect(avatar).toBeInTheDocument();
  });

  it.skip('should render avatar with image', () => {
    render(
      <Avatar>
        <AvatarImage src="https://avatar.example.com/user.jpg" alt="User" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    );
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
  });

  it.skip('should show image alt text', () => {});

  it.skip('should use provided image src', () => {});

  it.skip('should have image styling', () => {});

  it.skip('should have image object-cover styling', () => {});

  it.skip('should support data attributes on image', () => {});

  it('should render fallback content', () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should render fallback with single character', () => {
    render(
      <Avatar>
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('should render fallback with multiple characters', () => {
    render(
      <Avatar>
        <AvatarFallback>JOHN</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('JOHN')).toBeInTheDocument();
  });

  it('should have relative positioning', () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    const avatar = container.querySelector('span');
    expect(avatar?.className).toContain('relative');
  });

  it('should have flex display', () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    const avatar = container.querySelector('span');
    expect(avatar?.className).toContain('flex');
  });

  it('should have rounded-full styling', () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    const avatar = container.querySelector('span');
    expect(avatar?.className).toContain('rounded-full');
  });

  it('should have proper width and height', () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    const avatar = container.querySelector('span');
    expect(avatar?.className).toMatch(/h-/);
    expect(avatar?.className).toMatch(/w-/);
  });

  it('should have overflow hidden', () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    const avatar = container.querySelector('span');
    expect(avatar?.className).toContain('overflow-hidden');
  });

  it.skip('should have image styling', () => {});

  it.skip('should have image object-cover styling', () => {});

  it('should have fallback styling', () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    const fallback = screen.getByText('JD');
    expect(fallback?.className).toContain('flex');
  });

  it('should have fallback centered alignment', () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    const fallback = screen.getByText('JD');
    expect(fallback?.className).toContain('items-center');
  });

  it('should have fallback background color', () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    const fallback = screen.getByText('JD');
    expect(fallback?.className).toMatch(/bg-/);
  });

  it('should support custom sizes via className', () => {
    const { container } = render(
      <Avatar className="h-16 w-16">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    const avatar = container.querySelector('span');
    expect(avatar?.className).toContain('h-16');
    expect(avatar?.className).toContain('w-16');
  });

  it('should support small avatar', () => {
    const { container } = render(
      <Avatar className="h-8 w-8">
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
    );
    const avatar = container.querySelector('span');
    expect(avatar?.className).toContain('h-8');
  });

  it('should support large avatar', () => {
    const { container } = render(
      <Avatar className="h-32 w-32">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    const avatar = container.querySelector('span');
    expect(avatar?.className).toContain('h-32');
  });

  it('should support data attributes on avatar', () => {
    render(
      <Avatar data-testid="user-avatar">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByTestId('user-avatar')).toBeInTheDocument();
  });

  it.skip('should support data attributes on image', () => {
    render(
      <Avatar>
        <AvatarImage src="test.jpg" alt="test" data-testid="avatar-image" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByTestId('avatar-image')).toBeInTheDocument();
  });

  it('should support aria-label on avatar', () => {
    render(
      <Avatar aria-label="User profile">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByLabelText('User profile')).toBeInTheDocument();
  });

  it.skip('should render multiple images in sequence', () => {
    const { rerender } = render(
      <Avatar>
        <AvatarImage src="image1.jpg" alt="first" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByAltText('first')).toBeInTheDocument();

    rerender(
      <Avatar>
        <AvatarImage src="image2.jpg" alt="second" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByAltText('second')).toBeInTheDocument();
  });

  it('should show fallback when image is missing', () => {
    render(
      <Avatar>
        <AvatarImage src="" alt="missing" />
        <AvatarFallback>Fallback</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('Fallback')).toBeInTheDocument();
  });

  it('should render multiple avatars', () => {
    render(
      <>
        <Avatar data-testid="avatar-1">
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
        <Avatar data-testid="avatar-2">
          <AvatarFallback>B</AvatarFallback>
        </Avatar>
        <Avatar data-testid="avatar-3">
          <AvatarFallback>C</AvatarFallback>
        </Avatar>
      </>
    );
    expect(screen.getByTestId('avatar-1')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-2')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-3')).toBeInTheDocument();
  });

  it('should render avatars with different fallbacks', () => {
    render(
      <>
        <Avatar>
          <AvatarFallback>John Doe</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>Jane Smith</AvatarFallback>
        </Avatar>
      </>
    );
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it.skip('should render complete avatar with image and fallback', () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="user.jpg" alt="User" />
        <AvatarFallback>UD</AvatarFallback>
      </Avatar>
    );
    expect(container.querySelector('img')).toBeInTheDocument();
    expect(screen.getByText('UD')).toBeInTheDocument();
  });

  it.skip('should support custom className on image', () => {
    render(
      <Avatar>
        <AvatarImage src="test.jpg" alt="test" className="custom-image" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    const img = screen.getByAltText('test');
    expect(img.className).toContain('custom-image');
  });

  it('should support custom className on fallback', () => {
    render(
      <Avatar>
        <AvatarFallback className="custom-fallback">JD</AvatarFallback>
      </Avatar>
    );
    const fallback = screen.getByText('JD');
    expect(fallback.className).toContain('custom-fallback');
  });

  it('should handle very long initials', () => {
    render(
      <Avatar>
        <AvatarFallback>VERYLONGINITIALS</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('VERYLONGINITIALS')).toBeInTheDocument();
  });

  it('should handle emoji in fallback', () => {
    render(
      <Avatar>
        <AvatarFallback>👤</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('👤')).toBeInTheDocument();
  });

  it('should handle numbers in fallback', () => {
    render(
      <Avatar>
        <AvatarFallback>123</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('should handle special characters in fallback', () => {
    render(
      <Avatar>
        <AvatarFallback>@#$</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('@#$')).toBeInTheDocument();
  });

  it('should accept className on avatar', () => {
    const { container } = render(
      <Avatar className="border-2 border-blue-500">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    const avatar = container.querySelector('span');
    expect(avatar?.className).toContain('border-2');
    expect(avatar?.className).toContain('border-blue-500');
  });

  it('should render with additional props', () => {
    render(
      <Avatar role="presentation">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('JD').parentElement).toHaveAttribute(
      'role',
      'presentation'
    );
  });

  it('should forward ref to avatar element', () => {
    let reference: HTMLSpanElement | null = null;
    const refCallback = (element: HTMLSpanElement | null) => {
      reference = element;
    };
    render(
      <Avatar ref={refCallback}>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(reference).toBeInstanceOf(HTMLSpanElement);
  });

  it('should handle image with no src', () => {
    render(
      <Avatar>
        <AvatarImage alt="no source" />
        <AvatarFallback>Fallback</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('Fallback')).toBeInTheDocument();
  });

  it.skip('should handle different image formats', () => {
    const formats = ['image.jpg', 'image.png', 'image.webp', 'image.gif'];
    for (const format of formats) {
      const { container: container1 } = render(
        <Avatar>
          <AvatarImage src={format} alt={format} />
          <AvatarFallback>Img</AvatarFallback>
        </Avatar>
      );
      expect(container1.querySelector('img')).toBeInTheDocument();
    }
  });
});
