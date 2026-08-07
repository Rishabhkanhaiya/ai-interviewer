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

export function PostSession1({ name, score, downloadUrl }: { name: string, score: number, downloadUrl: string }) {
  const firstName = name.split(' ')[0]
  return (
    <Html>
      <Head />
      <Preview>You scored {String(score)}/100 on your mock interview</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Score: {score}/100
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hi {firstName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Your detailed scorecard for your recent mock interview is ready. We've analyzed your WPM, pauses, and STAR method usage.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Link
                href={downloadUrl}
                className="bg-[#4F46E5] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
              >
                Download PDF Scorecard
              </Link>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              Review the transcript and try again to improve your score.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export function PostSession2({ name, weakestArea }: { name: string, weakestArea: string }) {
  const firstName = name.split(' ')[0]
  return (
    <Html>
      <Head />
      <Preview>Your weakest area: {weakestArea}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Text className="text-black text-[14px] leading-[24px]">
              Hi {firstName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Looking at your recent sessions, your weakest area right now is <strong>{weakestArea}</strong>.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              The good news? It's completely fixable. Focus entirely on {weakestArea} in your next practice round.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Link
                href={`${baseUrl}/interview`}
                className="bg-[#4F46E5] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
              >
                Start a targeted practice round
              </Link>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export function PostSession3({ name, roundsLeft }: { name: string, roundsLeft: number }) {
  const firstName = name.split(' ')[0]
  return (
    <Html>
      <Head />
      <Preview>You have {String(roundsLeft)} rounds left</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Text className="text-black text-[14px] leading-[24px]">
              Hi {firstName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              You have {String(roundsLeft)} practice rounds remaining. 
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              To guarantee your placement, most students do at least 10 sessions before the real drive.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Link
                href={`${baseUrl}/buy`}
                className="bg-[#4F46E5] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
              >
                Top up your rounds
              </Link>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
