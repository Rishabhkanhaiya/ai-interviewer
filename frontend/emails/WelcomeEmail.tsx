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

export function WelcomeEmail1({ name }: { name: string }) {
  const firstName = name.split(' ')[0]
  return (
    <Html>
      <Head />
      <Preview>Welcome to InterviewAI - Let's get started</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Welcome to InterviewAI, {firstName}
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hi {firstName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              The #1 reason students fail HR rounds isn't lack of knowledge — it's hesitation and filler words. Our AI is designed to fix exactly that, in Hinglish.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Link
                href={`${baseUrl}/dashboard`}
                className="bg-[#4F46E5] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
              >
                Start your first free session 
              </Link>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              You have 3 free rounds. Don't waste them on generic practice. Set up your target company and give it your best shot.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export function WelcomeEmail2({ name }: { name: string }) {
  const firstName = name.split(' ')[0]
  return (
    <Html>
      <Head />
      <Preview>How the STAR method actually works</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Text className="text-black text-[14px] leading-[24px]">
              Hi {firstName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Have you noticed how our AI keeps mentioning the "STAR method" in your scorecard? 
              It stands for Situation, Task, Action, Result. When an interviewer asks "tell me about a challenge", they don't want a long story. They want STAR.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Our AI specifically grades if you hit these 4 points. Log in and try answering one behavioral question using exactly this framework.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Link
                href={`${baseUrl}/interview`}
                className="bg-[#4F46E5] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
              >
                Practice the STAR method
              </Link>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export function WelcomeEmail3({ name }: { name: string }) {
  const firstName = name.split(' ')[0]
  return (
    <Html>
      <Head />
      <Preview>Don't fake an American accent</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Text className="text-black text-[14px] leading-[24px]">
              Hi {firstName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              We built InterviewAI specifically with Indian audio models (Sarvam AI) because standard models fail at Indian accents. 
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              You don't need to put on a fake accent to pass a TCS or Infosys interview. Speak naturally. Use "um", "toh", and normal Hinglish. The AI will judge your logic and confidence, just like a real Indian HR would.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Link
                href={`${baseUrl}/interview`}
                className="bg-[#4F46E5] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
              >
                Take your final free round
              </Link>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
