'use client'
import React from 'react'

type Props = { children: React.ReactNode }

export default class ErrorBoundary extends React.Component<Props, { hasError: boolean }> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: any, info: any) {
    // TODO: send to logging service
    console.error('Unhandled error in component tree', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-rose-900 text-white rounded">
          <h3 className="text-lg font-semibold">Произошла ошибка</h3>
          <p className="text-sm">Пожалуйста, обновите страницу или обратитесь к администратору.</p>
        </div>
      )
    }
    return this.props.children
  }
}
