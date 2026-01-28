import { CustomCursor } from './components/CustomCursor'
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
    <div className="relative bg-black">
      <CustomCursor />
      <Navigation />
      <Hero />
      <CredibilityBar />
      <CompetencyGrid />
      <ExpertiseAccordion />
      <TechStack />
      <Contact />
    </div>
  )
}

export default App
