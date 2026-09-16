import { Suspense } from 'react'
import { LoginForm } from './login-form'

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
