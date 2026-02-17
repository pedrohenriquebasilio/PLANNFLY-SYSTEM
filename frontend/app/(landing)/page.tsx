import { Navbar } from '../components/landing/Navbar'
import { Hero } from '../components/landing/Hero'
import { Proof } from '../components/landing/Proof'
import { Promise } from '../components/landing/Promise'
import { HowItWorks } from '../components/landing/HowItWorks'
import { Benefits } from '../components/landing/Benefits'
import { Differentiation } from '../components/landing/Differentiation'
import { Qualification } from '../components/landing/Qualification'
import { CtaFinal } from '../components/landing/CtaFinal'
import { Pricing } from '../components/landing/pricing'

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Proof />
      <Promise />
      <HowItWorks />
      <Benefits />
      <Differentiation />
      <Qualification />
      <Pricing />
      <CtaFinal />

      {/* Footer */}
      <footer className="bg-foreground text-muted-foreground py-16 text-center border-t border-white/5 relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="container px-4 flex flex-col items-center gap-6">
          <div className="text-2xl font-heading font-bold text-white tracking-tighter">
            Plann<span className="text-primary">fly</span>
          </div>
          <p className="text-white/40 text-sm">&copy; {new Date().getFullYear()} Plannfly. Todos os direitos reservados.</p>
        </div>
      </footer>
    </>
  )
}
