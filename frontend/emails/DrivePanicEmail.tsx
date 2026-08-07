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

export function DrivePanicEmail({ name, company, college, daysUntilDrive }: { name: string, company: string, college: string, daysUntilDrive: number }) {
  const firstName = name.split(' ')[0]
  return (
    <Html>
      <Head />
      <Preview>{company} is visiting {college} in {String(daysUntilDrive)} hours. Are you ready?</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Text className="text-black text-[14px] leading-[24px]">
              Hi {firstName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              <strong>{company}</strong> is visiting <strong>{college}</strong> in <strong>{String(daysUntilDrive)} hours.</strong>
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Do one practice session right now. You'll be more confident in the actual interview just by having done it once today.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Link
                href={`${baseUrl}/interview?company=${encodeURIComponent(company)}`}
                className="bg-[#EF4444] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
              >
                Practice {company} interview now 
              </Link>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
