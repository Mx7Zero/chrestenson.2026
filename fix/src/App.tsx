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
import { AsteroidScene } from './components/AsteroidScene'

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
        <AsteroidScene
          modelPath="/models/hummingbird.glb"
          label="HUMMINGBIRD"
          animated
          autoRotate={false}
          targetSize={5}
          attribution={{
            title: 'Animated Hovering Flying Hummingbird Loop',
            author: 'LasquetiSpice',
            workUrl: 'https://skfb.ly/o9rHy',
            licenseName: 'CC BY 4.0',
            licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
          }}
        />
        <PortfolioSlider />
        <VideoCarousel />
        <ExpertiseAccordion />
        <AsteroidScene
          modelPath="/models/asteroid.glb"
          label="ASTEROID"
          attribution={{
            title: 'Asteroid low poly',
            author: 'pasquill',
            workUrl: 'https://skfb.ly/oz7ZN',
            licenseName: 'CC BY 4.0',
            licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
          }}
        />
        <TechStack />
        <Contact />
      </div>
    </>
  )
}

export default App
