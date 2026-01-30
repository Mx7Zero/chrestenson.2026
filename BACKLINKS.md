# Backlink Strategy for chrestenson.com

## Overview
This document outlines the backlink strategy for Matthew Chrestenson's portfolio website to improve SEO, credibility, and online visibility.

## What Are Backlinks?
Backlinks (also called inbound links) are links from other websites pointing to your site. They are crucial for:
- **SEO ranking**: Search engines use backlinks as votes of confidence
- **Referral traffic**: Quality backlinks drive targeted visitors
- **Brand authority**: Links from reputable sites boost credibility
- **AI search visibility**: AI engines value entity associations and citations

## Current Implementation

### 1. Outbound Links to Credibility Markers (✅ Implemented)
The site now includes clickable links to organizations in the CredibilityBar component:
- **Disney** - https://www.disney.com
- **National Geographic** - https://www.nationalgeographic.com
- **Ridley Scott Associates** - https://www.rsa-films.com

These outbound links help establish entity associations that AI search engines recognize.

### 2. Social Media Links (✅ Existing)
- LinkedIn profile with backlink to portfolio
- Email contact for direct outreach
- Phone number for business inquiries

### 3. Structured Data (✅ Implemented in /fix/)
JSON-LD schema includes Organization markup linking to:
- Disney Interactive
- National Geographic
- Ridley Scott Associates

## Backlink Building Strategy

### High Priority Actions

#### 1. LinkedIn Company Pages
**Action Required:**
- Request to be added to the "Alumni" or "Past Employees" section on LinkedIn company pages
- Links from LinkedIn company pages are high-authority backlinks
- Target companies:
  - Disney Interactive (now Disney Digital)
  - National Geographic
  - Ridley Scott Associates (RSA Films)

**Implementation:**
1. Update LinkedIn profile to include detailed work history
2. Contact HR or alumni relations at each company
3. Request alumni directory listings

#### 2. Industry Publications & Guest Articles
**Content Ideas:**
- "AI-Augmented Brand Strategy: Lessons from 30 Years in Creative Leadership"
- "From Disney to Hospitality: Scaling Creative Excellence"
- "The Future of AI-Native Strategic Advisory"

**Target Publications:**
- Fast Company
- Harvard Business Review
- AdAge
- Strategy+Business
- LinkedIn Articles (with high visibility)

**Expected Result:** Each guest article includes author bio with link to chrestenson.com

#### 3. Case Studies (Future Content)
**Recommended Structure:**
Create detailed case studies for:
- Brand strategy transformations
- Patent portfolio development
- Financial modeling for investor presentations
- Full-stack product launches

**SEO Benefits:**
- Long-form content (2000+ words) ranks well
- Shareable by clients and partners
- Natural backlink magnet for industry sites

**Location:** Create `/case-studies` route or subdomain

#### 4. Portfolio & Directory Listings
Submit to:
- **Clutch.co** - Top-rated consultants directory
- **Expertise.com** - Local expert listings
- **The Manifest** - B2B service providers
- **GoodFirms** - Service provider directory
- **Upwork** or **Toptal** (if accepting contract work)

### Medium Priority Actions

#### 5. Speaking Engagements & Conferences
**Benefits:**
- Conference speaker pages link to personal sites
- Video recordings on YouTube with description links
- Slideshare presentations with backlinks

**Target Events:**
- SXSW (brand strategy track)
- Adobe MAX (creative leadership)
- Web Summit (AI and strategy)
- Local Denver tech meetups

#### 6. Podcast Appearances
**Strategy:**
- Appear on marketing, strategy, and AI podcasts
- Show notes always include guest website links
- Repost on own site for reciprocal links

**Target Podcasts:**
- Marketing Over Coffee
- The Strategy Show
- AI in Business
- Creative BTS

#### 7. Awards & Recognition
**Opportunities:**
- Webby Awards (for portfolio site design)
- Awwwards (web design excellence)
- SaaS Awards (if applicable to current projects)

**Benefit:** Award winner listings include permanent backlinks

### Lower Priority (Long-term)

#### 8. Academic & Research Citations
- Contribute to industry research papers
- Write for academic journals
- Get cited in university coursework

#### 9. Local Business Directories
- Google Business Profile
- Yelp (if applicable)
- Denver Chamber of Commerce
- Colorado creative agencies directory

#### 10. Forum & Community Participation
**High-quality forums:**
- Designer News (Hacker News for designers)
- Indiehackers
- Product Hunt discussions
- Reddit (r/marketing, r/strategy) - use profile links

**Warning:** Only participate authentically, not for link spam

## Monitoring & Analytics

### Tools to Track Backlinks
1. **Google Search Console**
   - Monitor "Links" section
   - See which sites link to you
   - Track link growth over time

2. **Ahrefs or SEMrush**
   - Comprehensive backlink analysis
   - Competitor backlink research
   - Domain authority tracking

3. **Moz Link Explorer**
   - Domain Authority score
   - Backlink quality metrics

### Key Metrics to Monitor
- Total number of backlinks
- Number of unique referring domains
- Domain Authority (DA) of linking sites
- Anchor text distribution
- Referral traffic from backlinks

## Technical SEO for Backlinks

### Already Implemented
✅ robots.txt allows all crawlers
✅ sitemap.xml for easy indexing
✅ Structured data (JSON-LD) for entity recognition
✅ Canonical URLs to prevent duplicate content
✅ Mobile-friendly responsive design
✅ Fast page load times (Vite build)

### Recommended Additions
- [ ] Add blog section for content marketing
- [ ] Create shareable infographics
- [ ] Add social share buttons
- [ ] Implement Open Graph images for better social sharing
- [ ] Create downloadable resources (PDFs, templates)

## Social Sharing Features

### Current Implementation
- Open Graph tags for social previews
- Twitter Cards for better Twitter sharing
- Professional og-image (visual preview)

### Recommended Enhancements
```tsx
// Add social share buttons component
<SocialShare 
  url="https://chrestenson.com"
  title="Matthew Chrestenson - Executive Strategist"
  description="AI-augmented strategist with 30+ years of creative leadership"
/>
```

Platforms to enable:
- LinkedIn (most relevant for B2B)
- Twitter/X
- Email share
- Copy link button

## Content That Attracts Backlinks

### High-Value Content Types
1. **Original Research** - Statistics and data that others cite
2. **Comprehensive Guides** - "Ultimate Guide to..." articles
3. **Free Tools & Resources** - Calculators, templates, frameworks
4. **Industry Reports** - Annual state-of-the-industry
5. **Infographics** - Visual content that gets shared
6. **Expert Opinions** - Thought leadership pieces
7. **Case Studies** - Detailed project breakdowns

### Content Calendar (Suggested)
- **Q1 2026:** Publish 2 case studies
- **Q2 2026:** Write 3 guest articles
- **Q3 2026:** Launch blog with weekly posts
- **Q4 2026:** Create downloadable resources library

## Legal & Ethical Considerations

### Best Practices
✅ Always use `rel="noopener noreferrer"` for external links
✅ Don't buy backlinks (Google penalty risk)
✅ Avoid link farms and PBNs
✅ Focus on quality over quantity
✅ Build relationships, not just links
✅ Disclose sponsored content if applicable

### FTC Guidelines
If accepting payment for content with backlinks:
- Clearly disclose sponsored relationships
- Use `rel="sponsored"` on paid links
- Maintain editorial integrity

## Success Metrics (6-Month Goals)

### Baseline (Current)
- Referring domains: ~5 (LinkedIn, social profiles)
- Domain Authority: ~10-15 (new site)
- Monthly organic traffic: ~50 visitors

### 6-Month Targets
- Referring domains: 25+
- Domain Authority: 25-30
- Monthly organic traffic: 500+ visitors
- Page 1 Google ranking for "Matthew Chrestenson"
- Top 3 for "brand strategist Denver"

### 12-Month Targets
- Referring domains: 50+
- Domain Authority: 35-40
- Monthly organic traffic: 2,000+ visitors
- Multiple page 1 rankings for key terms
- Featured in 3+ industry publications

## Action Items Summary

### Immediate (Week 1)
- [x] Add clickable links to credibility companies
- [x] Document backlink strategy (this file)
- [ ] Update LinkedIn with detailed work history
- [ ] Set up Google Search Console

### Short-term (Month 1)
- [ ] Submit to portfolio directories (Clutch, etc.)
- [ ] Pitch 3 guest article ideas to publications
- [ ] Create first case study outline
- [ ] Set up backlink monitoring tools

### Medium-term (Months 2-3)
- [ ] Publish first guest article
- [ ] Complete 2 detailed case studies
- [ ] Submit to design awards
- [ ] Reach out to podcast hosts

### Long-term (Months 4-6)
- [ ] Launch blog section
- [ ] Create downloadable resource library
- [ ] Publish quarterly industry report
- [ ] Secure 3+ speaking engagements

## Resources

### Tools
- [Ahrefs](https://ahrefs.com) - Backlink analysis
- [Google Search Console](https://search.google.com/search-console) - Free monitoring
- [Moz Link Explorer](https://moz.com/link-explorer) - DA tracking
- [SEMrush](https://semrush.com) - Comprehensive SEO

### Learning
- [Backlinko's Link Building Guide](https://backlinko.com/link-building)
- [Moz's Beginner's Guide to SEO](https://moz.com/beginners-guide-to-seo)
- [Google's SEO Starter Guide](https://developers.google.com/search/docs)

---

**Last Updated:** January 30, 2026  
**Owner:** Matthew Chrestenson  
**Review Cycle:** Monthly
