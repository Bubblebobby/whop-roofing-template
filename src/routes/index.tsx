import { createFileRoute } from '@tanstack/react-router'
import { Contact, Faq, Financing, Hero, Pricing, Reviews, ServiceArea, Services, TrustStrip } from '#/components/Sections'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <Services />
      <Pricing />
      <Financing />
      <Reviews />
      <ServiceArea />
      <Faq />
      <Contact />
    </>
  )
}
