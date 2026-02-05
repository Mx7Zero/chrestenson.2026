import { Navigation } from './components/Navigation'
import { Hero } from './components/Hero'
import { CredibilityBar } from './components/CredibilityBar'
import { PortfolioSlider } from './components/PortfolioSlider'
import { VideoCarousel } from './components/VideoCarousel'
import { CompetencyGrid } from './components/CompetencyGrid'
import { ExpertiseAccordion } from './components/ExpertiseAccordion'
import { TechStack } from './components/TechStack'
import { Contact } from './components/Contact'
import { CustomCursor } from './components/CustomCursor'

function App() {
  return (
    <div className="relative bg-[#FAFAFA]">
      <CustomCursor />
      <Navigation />
      <Hero />
      <CredibilityBar />
      <CompetencyGrid />
      <PortfolioSlider />
      <VideoCarousel />
      <ExpertiseAccordion />
      <TechStack />
      <Contact />
    </div>
  )
}

export default App
