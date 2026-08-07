import { NextResponse } from 'next/server'
import {
  sendWelcomeEmail1, sendWelcomeEmail2, sendWelcomeEmail3,
  sendPostSession1, sendPostSession2, sendPostSession3,
  sendPackExpiry1, sendPackExpiry2,
  sendReengagement1, sendReengagement2,
  sendDrivePanic,
  sendAffiliateWelcome1, sendAffiliateWelcome2, sendAffiliateWeek1Stats,
} from '@/lib/email'

// POST /api/email/trigger
// Body: { event, to, name, ...data }
// Called from the FastAPI backend via internal HTTP (not public)
export async function POST(req: Request) {
  // Simple secret check — backend must pass X-Internal-Secret header
  const secret = req.headers.get('x-internal-secret')
  if (secret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { event, to, name, ...data } = body

  try {
    switch (event) {
      // Welcome series
      case 'welcome_1': await sendWelcomeEmail1(to, name); break
      case 'welcome_2': await sendWelcomeEmail2(to, name); break
      case 'welcome_3': await sendWelcomeEmail3(to, name); break

      // Post-session
      case 'post_session_1': await sendPostSession1(to, name, data.score, data.download_url); break
      case 'post_session_2': await sendPostSession2(to, name, data.weakest_area); break
      case 'post_session_3': await sendPostSession3(to, name, data.rounds_left); break

      // Pack expiry
      case 'pack_expiry_1': await sendPackExpiry1(to, name, data.rounds_left); break
      case 'pack_expiry_2': await sendPackExpiry2(to, name, data.score_improvement); break

      // Re-engagement
      case 'reengagement_1': await sendReengagement1(to, name, data.company); break
      case 'reengagement_2': await sendReengagement2(to, name); break

      // Drive panic (manual)
      case 'drive_panic': await sendDrivePanic(to, name, data.company, data.college, data.days_until_drive); break

      // Affiliate
      case 'affiliate_welcome_1': await sendAffiliateWelcome1(to, name, data.code, data.marketing_kit_url); break
      case 'affiliate_welcome_2': await sendAffiliateWelcome2(to, name, data.code); break
      case 'affiliate_week1_stats': await sendAffiliateWeek1Stats(to, name, data.clicks, data.signups, data.earnings); break

      default:
        return NextResponse.json({ error: `Unknown event: ${event}` }, { status: 400 })
    }

    return NextResponse.json({ ok: true, event })
  } catch (err) {
    console.error('Email send error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
