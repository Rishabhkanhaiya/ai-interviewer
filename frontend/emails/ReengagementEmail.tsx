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

export function Reengagement1({ name, company }: { name: string, company: string }) {
  const firstName = name.split(' ')[0]
  return (
    <Html>
      <Head />
      <Preview>You haven't practiced in 7 days - {company} drive is coming</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Text className="text-black text-[14px] leading-[24px]">
              Hi {firstName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              You haven't done a practice session in a week. {company} placement drives are actively running in colleges right now.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              A 15-minute session today is worth more than 2 hours of textbook reading before an interview.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Link
                href={`${baseUrl}/interview`}
                className="bg-[#4F46E5] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
              >
                Practice for {company} now 
              </Link>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export function Reengagement2({ name }: { name: string }) {
  const firstName = name.split(' ')[0]
  return (
    <Html>
      <Head />
      <Preview>Quick question about your placement prep</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Text className="text-black text-[14px] leading-[24px]">
              Hi {firstName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              You haven't practiced in 2 weeks. I wanted to check in personally.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Did anything go wrong with your account? Is there something the product isn't doing well? Reply to this email and I'll respond personally.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              If you just got busy — no worries. Your rounds are still there. Come back whenever you're ready.
            </Text>
            <Text className="text-black text-[14px] leading-[24px] mt-[24px]">
              — Founder, InterviewAI
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
