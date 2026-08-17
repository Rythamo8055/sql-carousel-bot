import './globals.css'

export const metadata = {
  title: 'Carousel Viewer',
  description: 'View all carousel designs',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
