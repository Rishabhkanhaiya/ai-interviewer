import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Tailwind,
  Section,
} from '@react-email/components'
import * as React from 'react'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.in'

export function AffiliateWelcome1({ name, code, marketingKitUrl }: { name: string, code: string, marketingKitUrl: string }) {
  const firstName = name.split(' ')[0]
  return (
    <Html>
      <Head />
      <Preview>You're approved as an InterviewAI partner</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Text className="text-black text-[14px] leading-[24px]">
              Hi {firstName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Welcome to the InterviewAI affiliate program. You're approved at <strong>Freelancer Standard tier — ₹125 commission (per ₹499 sale).</strong>
            </Text>
            
            <div className="bg-[#F3F4F6] rounded-xl p-[20px] my-[20px]">
              <Text className="m-0 text-[#6B7280] text-[13px] uppercase">Your Referral Code</Text>
              <Text className="m-0 text-[28px] font-bold font-mono text-[#4F46E5]">{code}</Text>
              <Text className="mt-[8px] mb-0 text-[#374151] text-[14px]">Link: yourdomain.in?ref={code}</Text>
            </div>

            <Text className="font-bold text-[14px] mt-[16px]">Your first week checklist:</Text>
            <ul className="text-[14px] pl-[20px]">
              <li>Download your marketing kit → <Link href={marketingKitUrl}>Google Drive link</Link></li>
              <li>Try the product yourself (free access for affiliates) → <Link href={baseUrl}>yourdomain.in</Link></li>
              <li>Share your first post this week using one of the templates in the kit</li>
            </ul>

            <Text className="font-bold text-[14px]">Payouts every Sunday via UPI.</Text>
            <Text className="text-[14px]">I'm personally available on WhatsApp to help you succeed. Reply to this email if you have questions.</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export function AffiliateWelcome2({ name, code }: { name: string, code: string }) {
  const firstName = name.split(' ')[0]
  return (
    <Html>
      <Head />
      <Preview>3 messages that convert best for our top affiliates</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Text className="text-black text-[14px] leading-[24px]">
              Hi {firstName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              You've had your code ({code}) for 3 days. Here's what's actually working for our top partners:
            </Text>
            
            <ol className="text-[14px] pl-[20px]">
              <li><strong>WhatsApp groups work best.</strong> A single message in a 50-person placement group can bring 3-5 signups.</li>
              <li><strong>Specific beats generic.</strong> "Bhai TCS drive aa raha hai" converts 10x better than "try this app".</li>
              <li><strong>Your own story works.</strong> "I used this and my score went from 54 to 78" beats any template.</li>
            </ol>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Link
                href={`${baseUrl}/affiliate`}
                className="bg-[#4F46E5] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
              >
                View your affiliate dashboard
              </Link>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export function AffiliateWeek1Stats({ name, clicks, signups, earnings }: { name: string, clicks: number, signups: number, earnings: number }) {
  const firstName = name.split(' ')[0]
  return (
    <Html>
      <Head />
      <Preview>Your first week stats</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Text className="text-black text-[14px] leading-[24px]">
              Hi {firstName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Here's your first week as an InterviewAI partner:
            </Text>
            
            <div className="flex gap-[16px] my-[20px]">
              <div className="bg-[#F3F4F6] rounded-xl p-[16px] flex-1 text-center inline-block w-[30%]">
                <Text className="text-[28px] font-bold text-[#4F46E5] m-0">{clicks}</Text>
                <Text className="text-[#6B7280] text-[13px] m-0">Clicks</Text>
              </div>
              <div className="bg-[#F3F4F6] rounded-xl p-[16px] flex-1 text-center inline-block w-[30%] mx-2">
                <Text className="text-[28px] font-bold text-[#4F46E5] m-0">{signups}</Text>
                <Text className="text-[#6B7280] text-[13px] m-0">Signups</Text>
              </div>
              <div className="bg-[#ECFDF5] rounded-xl p-[16px] flex-1 text-center inline-block w-[30%]">
                <Text className="text-[28px] font-bold text-[#10B981] m-0">₹{earnings}</Text>
                <Text className="text-[#6B7280] text-[13px] m-0">Earned</Text>
              </div>
            </div>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Link
                href={`${baseUrl}/affiliate`}
                className="bg-[#4F46E5] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
              >
                View your full dashboard
              </Link>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
