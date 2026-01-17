export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold">404 - Page Not Found</h2>
        <p className="text-muted-foreground mt-2">
          The page you're looking for doesn't exist.
        </p>
      </div>
    </div>
  )
}
