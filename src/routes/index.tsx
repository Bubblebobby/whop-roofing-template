import { createFileRoute } from '@tanstack/react-router'
import { About, Contact, CtaBand, Faq, Financing, Hero, Pricing, Process, Reviews, ServiceArea, Services, WhyUs } from '#/components/Sections'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <WhyUs />
      <Process />
      <Pricing />
      <Financing />
      <Reviews />
      <ServiceArea />
      <Faq />
      <Contact />
      <CtaBand />
    </>
  )
}
