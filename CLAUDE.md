# Royal Nectar Ventures — Claude Code Brief

## Project Overview
Royal Nectar Ventures is a Ghanaian alcohol importer and distributor.
The website should feel bold, vibrant, alive and fun — this is NOT a dark
luxury brand. Think Accra nightlife energy, colourful, loud, Ghanaian.

## Skills
This project uses taste-skill. Always read and follow the installed
SKILL.md files before writing any code.
- design-taste-frontend
- high-end-visual-design
Set DESIGN_VARIANCE to 8, MOTION_INTENSITY to 9, VISUAL_DENSITY to 4.

## Tech Stack
- Plain HTML / CSS / JS — no frameworks, no React, no Vue
- GSAP + ScrollTrigger for all animations
- Google Fonts for typography
- No build tools, no bundlers — everything runs directly in the browser

## Folder Structure
index.html              ← main entry point
src/
  styles/main.css       ← all styles
  animations/gsap.js    ← all GSAP animations
  components/           ← reusable HTML snippets
  sections/             ← individual page sections
public/
  images/
    bottles/            ← 7 product shots (2:3 portrait)
    logo/               ← logo files (PNG transparent)
    backgrounds/        ← lifestyle backgrounds
  fonts/                ← any self-hosted fonts

## Brand Identity
Name: Royal Nectar Ventures
Tagline: The best quality drinks on the market
Location: Ghana
Contact: spirits@royalnectarventures.com
Website: www.royalnectarventures.com

## Visual Direction
- Bold, vibrant, colourful — loud saturated colours, full of energy
- Ghanaian cultural references — Kente patterns, Adinkra symbols as accents
- Fun and alive — NOT dark marble, NOT gold on black luxury
- Each product has its own colour world
- Consistent lighting and feel across all product shots

## Colour Palette
Each product has its own accent colour:
- Buccaneer White Rum    → Electric Blue    #0066FF
- Buccaneer Dark Rum     → Deep Orange      #FF5500
- QE Premium Vodka       → Bold Red         #E8000D
- Georgievski Orange     → Bright Yellow    #FFD600
- Georgievski Cranberry  → Vivid Pink       #FF0080
- Georgievski Lime       → Electric Green   #00CC44
- Pink Mystique Gin      → Bold Purple      #8800FF

Global accents:
- Gold                   #C8860A
- Deep Black             #080500
- Cream                  #F5E6C8

## Typography
- Display / Headlines    → Playfair Display (Google Fonts)
- Body / UI              → Outfit (Google Fonts)
- Logo wordmark          → Pinyon Script (Google Fonts)
- Never use: Arial, Inter, Roboto, system fonts

## Products (7 total)
1. Buccaneer White Rum
   - File: public/images/bottles/buccaneer-white-rum.png
   - Colour: #0066FF
   - Type: White Rum
   - Tagline: Clean. Bold. Legendary.

2. Buccaneer Dark Rum
   - File: public/images/bottles/buccaneer-dark-rum.png
   - Colour: #FF5500
   - Type: Dark Rum
   - Tagline: Deep. Rich. Unapologetic.

3. QE Premium Vodka
   - File: public/images/bottles/qe-vodka.png
   - Colour: #E8000D
   - Type: Premium Vodka
   - Tagline: Pure. Sharp. Premium.

4. Georgievski Vodka Orange
   - File: public/images/bottles/georgievski-orange.png
   - Colour: #FFD600
   - Type: Flavoured Vodka
   - Tagline: Bright. Zesty. Alive.

5. Georgievski Vodka Cranberry
   - File: public/images/bottles/georgievski-cranberry.png
   - Colour: #FF0080
   - Type: Flavoured Vodka
   - Tagline: Bold. Fruity. Fearless.

6. Georgievski Vodka Lime
   - File: public/images/bottles/georgievski-lime.png
   - Colour: #00CC44
   - Type: Flavoured Vodka
   - Tagline: Fresh. Sharp. Electric.

7. Pink Mystique Gin
   - File: public/images/bottles/pink-mystique-gin.png
   - Colour: #8800FF
   - Type: London Dry Gin
   - Tagline: Mysterious. Botanical. Royal.

## Animations (GSAP)

### Hero Section — 7 Bottle Rotating Showcase
- Full screen hero (100vh)
- All 7 bottle PNGs cycle automatically in a loop
- Each bottle active for 3-4 seconds, transition duration 1 second
- Active bottle: large, centered, CSS rotateY slow continuous rotation
- Inactive bottles: scaled down, opacity 0, hidden
- Background colour morphs smoothly to each product's colour on transition
- GSAP animates background colour between each transition
- Text (product name + spirit type + tagline) fades out and in with each bottle
- 7 navigation dots at bottom center, active dot highlights in gold
- Manual click on dots jumps to that product instantly
- Auto-rotation pauses on hover, resumes on mouse leave
- Transition: outgoing bottle scales down + fades out simultaneously
- Transition: incoming bottle scales up + fades in simultaneously
- Kente stripe accents on left and right edges of hero
- Royal Nectar Ventures logo and nav fixed at top
- Page progress bar scrub tied to scroll position
- Hero loads with gsap.timeline() staggered entrance on first bottle
- On mobile: bottle fills 70% screen width, text stacks below bottle

### Products Showcase — Full Bleed Scroll
- 7 full viewport sections (100vh each), one per product
- Each section has its own bold background colour (see colour palette)
- Layout alternates: bottle right on odd sections, bottle left on even
- Bottle image large, CSS rotateY slow rotation animation
- Product name in Playfair Display, large and bold
- Short 1-2 line description, spirit type, CTA button per section
- Sections transition via GSAP ScrollTrigger scrub on background colour
- Outgoing bottle scales down + fades, incoming scales up + fades in
- Subtle Kente pattern strip at bottom of each section
- Adinkra symbol watermark behind each bottle, matching colour family
- On mobile: bottle stacks above text, full width, same colour backgrounds

## Tetra Pak Range (6 products)
1. Express Deluxe Rum
   - File: public/images/bottles/express-rum-nobg.png
   - Colour: #CC0000

2. Famous Blue Whisky
   - File: public/images/bottles/famous-blue-whisky-nobg.png
   - Colour: #0055CC

3. HEH's Western London Dry Gin
   - File: public/images/bottles/western-gin-nobg.png
   - Colour: #7AAB8A

4. Starling Napoleon Brandy
   - File: public/images/bottles/starling-brandy-nobg.png
   - Colour: #FFD600

5. Bob's Premium Vodka
   - File: public/images/bottles/bobs-vodka-nobg.png
   - Colour: #00AAEE

6. Express Coffee Rum
   - File: public/images/bottles/express-coffee-rum-nobg.png
   - Colour: #4A1A00

## Tetra Pak Section
- Position: after orbital carousel, before manifesto
- Hero image: public/images/backgrounds/tetra-pak-hero.png
- Eyebrow: "TETRA PAK RANGE"
- Heading: "The Simple Choice"
- Subheading: "Premium spirits. Accessible format. Built for Ghana."
- 6 product cards in 3 column grid desktop, 2 column mobile
- Card background: #080500, border: 1px solid #C8860A
- Card hover: gold glow, slight scale up
- Section background: #080500

### General Animations
- Pinned manifesto → ScrollTrigger pin + scrub
- Nav links → fade in on load via gsap.timeline()
- Big statements → word-by-word reveal, stagger 0.1, ease back.out(1.4)
- Page progress bar → scrub tied to scroll position
- All scroll animations → start: top 75% to trigger early
- All animations must feel energetic, not slow or sleepy
- Respect prefers-reduced-motion on mobile

## Navigation
- Fixed at top, full width
- Logo on the left: antler mark + "Royal Nectar Ventures" in Pinyon Script
- Nav links on the right: Our Story, Products, Contact
- Background: transparent on hero, dark #080500 on scroll
- On mobile: hamburger menu, full screen overlay when open
- Nav transition: background fades in when scrolling past hero

## Logo
- Geometric gold stag antler mark + script wordmark
- File: public/images/logo/rnv-logo.png
- Antler mark colour: #C8860A gold
- Wordmark: Royal Nectar Ventures in Pinyon Script
- On dark/coloured backgrounds: gold version
- On light backgrounds: dark version
- In nav: antler mark on left, wordmark text to the right

## Footer
- Dark background #080500
- Logo centered at top of footer
- Contact details: spirits@royalnectarventures.com
- Phone: (+233) 542 190 308 / (+233) 532 941 034
- Website: www.royalnectarventures.com
- Kente pattern strip at very bottom
- Copyright: © 2025 Royal Nectar Ventures Ghana

## Mobile First
- Build mobile first — style for 375px then scale up
- All layouts must work on 375px, 768px and 1440px
- Touch targets minimum 48x48px
- Product bottle images stack single column on mobile
- Navigation collapses to hamburger menu on mobile
- Font sizes use clamp() for fluid scaling
- No hover-only interactions — everything must work on touch
- GSAP animations lighter on mobile
- Respect prefers-reduced-motion
- Test every section at 375px before considering it done

## Do Not
- Use dark marble or black luxury aesthetics
- Use Inter, Roboto or Arial
- Use placeholder comments or skip code blocks
- Build generic cookie-cutter layouts
- Use any frontend framework
- Use any build tools or bundlers
- Add coconuts, coffee beans or misleading flavour props
- Leave any section unfinished or use placeholder content

## File Writing Rules
- Always write changes to disk immediately after 
  making them — never hold changes in memory
- After every edit confirm the file was written 
  by showing the file size
- Never end a session without writing all changes 
  to their correct files