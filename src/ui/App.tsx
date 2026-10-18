import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useSettings } from '@/db/hooks'
import { SpeechFeedback } from '@/ui/components/SpeechFeedback'
import { AppShell } from '@/ui/layout/AppShell'
import { BookDetailPage } from '@/ui/pages/BookDetailPage'
import { BooksPage } from '@/ui/pages/BooksPage'
import { HangulIndexPage } from '@/ui/pages/HangulIndexPage'
import { HangulLessonPage } from '@/ui/pages/HangulLessonPage'
import { HomePage } from '@/ui/pages/HomePage'
import { OnboardingPage } from '@/ui/pages/OnboardingPage'
import { SettingsPage } from '@/ui/pages/SettingsPage'
import { StatsPage } from '@/ui/pages/StatsPage'
import { StudyPage } from '@/ui/pages/StudyPage'
import { WrongBookPage } from '@/ui/pages/WrongBookPage'

function Splash() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <div className="text-center">
        <div className="sticker-card relative mx-auto grid h-20 w-20 rotate-3 place-items-center">
          <span className="tape tape-coral" style={{ top: -9, left: '50%', marginLeft: -34, width: 68, height: 16, rotate: '-3deg' }} />
          <span className="font-kr text-4xl text-coral">한</span>
        </div>
        <div className="font-display mt-4 text-lg">韩语单词</div>
      </div>
    </div>
  )
}

export default function App() {
  const settings = useSettings()
  const [onboardingUnlocked, setOnboardingUnlocked] = useState(false)
  if (settings === undefined) return <Splash />
  const onboardingDone = settings.onboardingDone || onboardingUnlocked

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <SpeechFeedback enabled={settings.ttsEnabled} />
      <Routes>
        <Route
          path="/welcome"
          element={
            onboardingDone && !onboardingUnlocked ? (
              <Navigate to="/" replace />
            ) : (
              <OnboardingPage onDone={() => setOnboardingUnlocked(true)} />
            )
          }
        />
        <Route path="/study" element={onboardingDone ? <StudyPage /> : <Navigate to="/welcome" replace />} />
        <Route element={onboardingDone ? <AppShell /> : <Navigate to="/welcome" replace />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/hangul" element={<HangulIndexPage />} />
          <Route path="/hangul/:lessonId" element={<HangulLessonPage />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/books/:bookId" element={<BookDetailPage />} />
          <Route path="/wrong" element={<WrongBookPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to={onboardingDone ? '/' : '/welcome'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
