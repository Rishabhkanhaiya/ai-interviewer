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

export function PackExpiry1({ name, roundsLeft }: { name: string, roundsLeft: number }) {
  const firstName = name.split(' ')[0]
  return (
    <Html>
      <Head />
      <Preview>Your interview practice pack is running low - {String(roundsLeft)} left</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Text className="text-black text-[14px] leading-[24px]">
              Hi {firstName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              You have {String(roundsLeft)} practice rounds remaining in your current pack.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Top up now to ensure you're fully prepared for your next actual interview.
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

export function PackExpiry2({ name, scoreImprovement }: { name: string, scoreImprovement: number }) {
  const firstName = name.split(' ')[0]
  return (
    <Html>
      <Head />
      <Preview>You improved your score by {String(scoreImprovement)} points!</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Text className="text-black text-[14px] leading-[24px]">
              Hi {firstName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Congratulations! Your interview score has improved by {String(scoreImprovement)} points since you started.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              You're currently out of practice rounds. Let's keep that momentum going!
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Link
                href={`${baseUrl}/buy`}
                className="bg-[#4F46E5] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
              >
                Get more rounds
              </Link>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
