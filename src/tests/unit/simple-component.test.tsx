import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

const Simple = ({ text }: { text: string }) => <div>{text}</div>

describe('Simple Component', () => {
    it('renders text', () => {
        render(<Simple text="Hello World" />)
        expect(screen.getByText('Hello World')).toBeInTheDocument()
    })
})
