import { Navigation } from './components/Navigation'
import { Hero } from './components/Hero'
import { CredibilityBar } from './components/CredibilityBar'
import { About } from './components/About'
import { CompetencyGrid } from './components/CompetencyGrid'
import { ExpertiseAccordion } from './components/ExpertiseAccordion'
import { TechStack } from './components/TechStack'
import { Achievements } from './components/Achievements'
import { Principles } from './components/Principles'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'

function App() {
  return (
    <div className="relative">
      <Navigation />
      <Hero />
      <CredibilityBar />
      <About />
      <CompetencyGrid />
      <ExpertiseAccordion />
      <TechStack />
      <Achievements />
      <Principles />
      <Contact />
      <Footer />
    </div>
  )
}

export default App
