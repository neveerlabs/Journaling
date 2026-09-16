'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ReCAPTCHA from 'react-google-recaptcha'
import {
  Button,
  Card,
  Field,
  Input,
  Title1,
  Body1,
  Caption1,
  Divider,
  MessageBar,
  MessageBarBody,
  Spinner,
  makeStyles,
  tokens,
} from '@fluentui/react-components'
import { getSupabase } from '@/lib/supabase/client'

const useStyles = makeStyles({
  page: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    backgroundColor: tokens.colorNeutralBackground2,
    padding: tokens.spacingHorizontalL,
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    padding: tokens.spacingHorizontalXXL,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  captchaWrap: {
    display: 'flex',
    justifyContent: 'center',
    minHeight: '78px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
})

export function LoginForm() {
  const styles = useStyles()
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = getSupabase()

  const [mode, setMode] = React.useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [name, setName] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [captchaToken, setCaptchaToken] = React.useState<string | null>(null)
  const captchaRef = React.useRef<ReCAPTCHA>(null)
  const [message, setMessage] = React.useState<{
    intent: 'success' | 'error' | 'info'
    text: string
  } | null>(null)

  React.useEffect(() => {
    const err = searchParams.get('error')
    if (err)
      setMessage({
        intent: 'error',
        text: 'Authentication failed. Please try again.',
      })
  }, [searchParams])

  const handleGoogle = async () => {
    setLoading(true)
    setMessage(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setMessage({ intent: 'error', text: error.message })
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!captchaToken) {
      setMessage({ intent: 'error', text: 'Please complete the reCAPTCHA.' })
      return
    }
    setLoading(true)
    setMessage(null)

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) setMessage({ intent: 'error', text: error.message })
      else {
        router.push('/')
        router.refresh()
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name || email.split('@')[0] },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) setMessage({ intent: 'error', text: error.message })
      else
        setMessage({
          intent: 'success',
          text: 'Check your email to confirm your account.',
        })
    }

    captchaRef.current?.reset()
    setCaptchaToken(null)
    setLoading(false)
  }

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <Title1>{mode === 'signin' ? 'Welcome back' : 'Create account'}</Title1>
          <Body1>Sign in to access Work Journal.</Body1>
        </div>

        {message && (
          <MessageBar intent={message.intent}>
            <MessageBarBody>{message.text}</MessageBarBody>
          </MessageBar>
        )}

        <Button
          appearance="secondary"
          onClick={handleGoogle}
          disabled={loading}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
              />
            </svg>
          }
        >
          Continue with Google
        </Button>

        <Divider>or</Divider>

        <form className={styles.form} onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <Field label="Name">
              <Input value={name} onChange={(_, d) => setName(d.value)} />
            </Field>
          )}
          <Field label="Email" required>
            <Input
              type="email"
              required
              value={email}
              onChange={(_, d) => setEmail(d.value)}
            />
          </Field>
          <Field label="Password" required>
            <Input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(_, d) => setPassword(d.value)}
            />
          </Field>

          <div className={styles.captchaWrap}>
            <ReCAPTCHA
              ref={captchaRef}
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
              onChange={(t) => setCaptchaToken(t)}
              onExpired={() => setCaptchaToken(null)}
            />
          </div>

          <Button
            appearance="primary"
            type="submit"
            disabled={loading || !captchaToken}
          >
            {loading ? (
              <Spinner size="tiny" />
            ) : mode === 'signin' ? (
              'Sign in'
            ) : (
              'Sign up'
            )}
          </Button>
        </form>

        <div className={styles.footer}>
          <Caption1>
            {mode === 'signin'
              ? "Don't have an account?"
              : 'Already have an account?'}
          </Caption1>
          <Button
            appearance="transparent"
            size="small"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
