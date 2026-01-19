import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SingleImageDropzone } from '@/components/single-image-dropzone'
import { vi, describe, it, expect } from 'vitest'

// Mock icons
vi.mock('lucide-react', () => ({
    UploadCloudIcon: () => <div data-testid="upload-icon" />,
    X: () => <div data-testid="remove-icon" />,
}))

// Mock dropzone
// Dropzone is hard to fully simulate in JSDOM because of DataTransfer API support issues in older jsdom versions or specific setup.
// We will focus on rendering logic based on 'value' prop.
// For interactions, we can try to fire change event on input.

describe('SingleImageDropzone', () => {
    it('renders upload icon when no value provided', () => {
        render(<SingleImageDropzone />)
        expect(screen.getByTestId('upload-icon')).toBeInTheDocument()
        expect(screen.getByText('Click or drag file to this area to upload')).toBeInTheDocument()
    })

    it('renders image preview when value is file URL', () => {
        const url = 'https://example.com/image.png'
        render(<SingleImageDropzone value={url} />)
        const img = screen.getByRole('img')
        expect(img).toHaveAttribute('src', url)
    })

    it('renders upload input', () => {
        const { container } = render(<SingleImageDropzone />)
        const input = container.querySelector('input[type="file"]')
        expect(input).toBeInTheDocument()
    })

    it('calls onChange when file selected (via input)', async () => {
        const onChange = vi.fn()
        const { container } = render(<SingleImageDropzone onChange={onChange} />)
        const input = container.querySelector('input[type="file"]')

        // Create a dummy file
        const file = new File(['hello'], 'hello.png', { type: 'image/png' })

        // In React Dropzone, handling 'change' on input works
        if (input) {
            fireEvent.change(input, { target: { files: [file] } })
        }

        // Wait for async dropzone processing
        await waitFor(() => {
            expect(onChange).toHaveBeenCalled()
        })
    })
})
