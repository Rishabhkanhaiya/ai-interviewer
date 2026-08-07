import { Resend } from 'resend'
import { render } from '@react-email/render'
import { WelcomeEmail1, WelcomeEmail2, WelcomeEmail3 } from '@/emails/WelcomeEmail'
import { PostSession1, PostSession2, PostSession3 } from '@/emails/PostSessionEmail'
import { Reengagement1, Reengagement2 } from '@/emails/ReengagementEmail'
import { DrivePanicEmail } from '@/emails/DrivePanicEmail'
import { AffiliateWelcome1, AffiliateWelcome2, AffiliateWeek1Stats } from '@/emails/AffiliateWelcomeEmail'
import { PackExpiry1, PackExpiry2 } from '@/emails/PackExpiryEmail'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'InterviewAI <no-reply@yourdomain.in>'
const REPLY_TO = 'support@yourdomain.in'

// ==========================================
// Sequence 1 - Welcome & Onboarding
// ==========================================

export async function sendWelcomeEmail1(to: string, name: string) {
  const html = await render(<WelcomeEmail1 name={name} />)
  return resend.emails.send({
    from: FROM, replyTo: REPLY_TO, to,
    subject: `Welcome to InterviewAI, ${name.split(' ')[0]}`,
    html,
  })
}

export async function sendWelcomeEmail2(to: string, name: string) {
  const html = await render(<WelcomeEmail2 name={name} />)
  return resend.emails.send({
    from: FROM, replyTo: REPLY_TO, to,
    subject: `How the STAR method actually works`,
    html,
  })
}

export async function sendWelcomeEmail3(to: string, name: string) {
  const html = await render(<WelcomeEmail3 name={name} />)
  return resend.emails.send({
    from: FROM, replyTo: REPLY_TO, to,
    subject: `Don't fake an American accent`,
    html,
  })
}

// ==========================================
// Sequence 2 - Post-Session
// ==========================================

export async function sendPostSession1(to: string, name: string, score: number, downloadUrl: string) {
  const html = await render(<PostSession1 name={name} score={score} downloadUrl={downloadUrl} />)
  return resend.emails.send({
    from: FROM, replyTo: REPLY_TO, to,
    subject: `Your scorecard is ready - You scored ${score}/100`,
    html,
  })
}

export async function sendPostSession2(to: string, name: string, weakestArea: string) {
  const html = await render(<PostSession2 name={name} weakestArea={weakestArea} />)
  return resend.emails.send({
    from: FROM, replyTo: REPLY_TO, to,
    subject: `Your weakest area: ${weakestArea}`,
    html,
  })
}

export async function sendPostSession3(to: string, name: string, roundsLeft: number) {
  const html = await render(<PostSession3 name={name} roundsLeft={roundsLeft} />)
  return resend.emails.send({
    from: FROM, replyTo: REPLY_TO, to,
    subject: `You have ${roundsLeft} rounds left`,
    html,
  })
}

// ==========================================
// Sequence 3 - Pack Expiry / Upsell
// ==========================================

export async function sendPackExpiry1(to: string, name: string, roundsLeft: number) {
  const html = await render(<PackExpiry1 name={name} roundsLeft={roundsLeft} />)
  return resend.emails.send({
    from: FROM, replyTo: REPLY_TO, to,
    subject: `You have ${roundsLeft} practice rounds remaining`,
    html,
  })
}

export async function sendPackExpiry2(to: string, name: string, scoreImprovement: number) {
  const html = await render(<PackExpiry2 name={name} scoreImprovement={scoreImprovement} />)
  return resend.emails.send({
    from: FROM, replyTo: REPLY_TO, to,
    subject: `You improved your score by ${scoreImprovement} points!`,
    html,
  })
}

// ==========================================
// Sequence 4 - Re-engagement
// ==========================================

export async function sendReengagement1(to: string, name: string, company: string) {
  const html = await render(<Reengagement1 name={name} company={company} />)
  return resend.emails.send({
    from: FROM, replyTo: REPLY_TO, to,
    subject: `You haven't practiced in 7 days - ${company} drive is coming`,
    html,
  })
}

export async function sendReengagement2(to: string, name: string) {
  const html = await render(<Reengagement2 name={name} />)
  return resend.emails.send({
    from: FROM, replyTo: REPLY_TO, to,
    subject: `Quick question about your placement prep`,
    html,
  })
}

// ==========================================
// Sequence 5 - Drive Panic (manual trigger)
// ==========================================

export async function sendDrivePanic(to: string, name: string, company: string, college: string, daysUntilDrive: number) {
  const html = await render(<DrivePanicEmail name={name} company={company} college={college} daysUntilDrive={daysUntilDrive} />)
  return resend.emails.send({
    from: FROM, replyTo: REPLY_TO, to,
    subject: `${company} is visiting ${college} in ${daysUntilDrive} hours. Are you ready?`,
    html,
  })
}

// ==========================================
// Sequence 6 - Affiliate Welcome
// ==========================================

export async function sendAffiliateWelcome1(to: string, name: string, code: string, marketingKitUrl: string) {
  const html = await render(<AffiliateWelcome1 name={name} code={code} marketingKitUrl={marketingKitUrl} />)
  return resend.emails.send({
    from: FROM, replyTo: REPLY_TO, to,
    subject: `You're approved as an InterviewAI partner - here's everything you need`,
    html,
  })
}

export async function sendAffiliateWelcome2(to: string, name: string, code: string) {
  const html = await render(<AffiliateWelcome2 name={name} code={code} />)
  return resend.emails.send({
    from: FROM, replyTo: REPLY_TO, to,
    subject: `3 messages that convert best for our top affiliates`,
    html,
  })
}

export async function sendAffiliateWeek1Stats(to: string, name: string, clicks: number, signups: number, earnings: number) {
  const html = await render(<AffiliateWeek1Stats name={name} clicks={clicks} signups={signups} earnings={earnings} />)
  return resend.emails.send({
    from: FROM, replyTo: REPLY_TO, to,
    subject: `Your first week stats - ${clicks} clicks, ₹${earnings} earned`,
    html,
  })
}
