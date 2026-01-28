import { Navigation } from './components/Navigation'
import { Hero } from './components/Hero'
import { CredibilityBar } from './components/CredibilityBar'
import { CompetencyGrid } from './components/CompetencyGrid'
import { ExpertiseAccordion } from './components/ExpertiseAccordion'
import { TechStack } from './components/TechStack'
import { Contact } from './components/Contact'

function App() {
  return (
    <div className="relative bg-[#FAFAFA]">
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
