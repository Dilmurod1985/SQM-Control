import React from 'react'
import '../styles/globals.css'

export const metadata = {
  title: 'SQM Control',
  description: 'Sammix Quality Management — MVP',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head />
      <body className="min-h-screen bg-slate-900 text-slate-100">
        {children}
      </body>
    </html>
  )
}
