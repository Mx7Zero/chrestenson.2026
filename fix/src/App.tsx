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
import { GrassBallScene } from './components/GrassBallScene'

function App() {
  return (
    <>
      <GrassBallScene />
      <div className="relative" style={{ zIndex: 1 }}>
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
    </>
  )
}

export default App
