import { VoiceAssistant } from '@/components/voice-assistant'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <VoiceAssistant />
    </>
  )
}
