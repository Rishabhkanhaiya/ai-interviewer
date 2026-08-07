import posthog from 'posthog-js'

// ─── Typed event helpers ──────────────────────────────────────────────────────

export const track = {
  pageViewed: (page: string) =>
    posthog.capture('page_viewed', { page }),

  interviewSetupStarted: (company: string, role: string, language: string) =>
    posthog.capture('interview_setup_started', { company, role, language }),

  interviewSessionStarted: (sessionId: string, company: string, role: string) =>
    posthog.capture('interview_session_started', { session_id: sessionId, company, role }),

  interviewSessionCompleted: (sessionId: string, durationSecs: number, score: number) =>
    posthog.capture('interview_session_completed', { session_id: sessionId, duration_secs: durationSecs, score }),

  interviewSessionAbandoned: (sessionId: string, questionNum: number) =>
    posthog.capture('interview_session_abandoned', { session_id: sessionId, question_num: questionNum }),

  scorecardViewed: (sessionId: string, score: number) =>
    posthog.capture('scorecard_viewed', { session_id: sessionId, score }),

  scorecardPdfDownloaded: (sessionId: string) =>
    posthog.capture('scorecard_pdf_downloaded', { session_id: sessionId }),

  scorecardLinkedinShared: (sessionId: string) =>
    posthog.capture('scorecard_linkedin_shared', { session_id: sessionId }),

  scorecardWhatsappShared: (sessionId: string) =>
    posthog.capture('scorecard_whatsapp_shared', { session_id: sessionId }),

  paymentPageViewed: (packType: string) =>
    posthog.capture('payment_page_viewed', { pack_type: packType }),

  paymentInitiated: (amount: number, hasAffiliateCode: boolean) =>
    posthog.capture('payment_initiated', { amount, has_affiliate_code: hasAffiliateCode }),

  paymentCompleted: (amount: number, affiliateCode: string | null) =>
    posthog.capture('payment_completed', { amount, affiliate_code: affiliateCode }),

  affiliateCodeApplied: (code: string) =>
    posthog.capture('affiliate_code_applied', { code }),

  referralLinkClicked: (location: string) =>
    posthog.capture('referral_link_clicked', { location }),

  npsSubmitted: (score: number, comment?: string) =>
    posthog.capture('nps_submitted', { score, comment }),

  linkedinShareClicked: (sessionId: string) =>
    posthog.capture('linkedin_share_clicked', { session_id: sessionId }),
}

export default posthog
