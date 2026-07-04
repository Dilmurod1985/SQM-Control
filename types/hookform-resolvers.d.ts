declare module '@hookform/resolvers/zod' {
  import type { Resolver } from 'react-hook-form'
  // Minimal typing for zodResolver used in this project
  export function zodResolver<TFieldValues = any>(schema: any, options?: any): Resolver<TFieldValues>
  export default zodResolver
}
