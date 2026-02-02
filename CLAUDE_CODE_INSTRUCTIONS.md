# Ovulation Calculator - Claude Code Build Instructions

## Project: calculateovulation.org

### ✅ COMPLETED FILES
- `/index.html` - Main calculator with 3-month calendar
- `/assets/css/styles.css` - Complete stylesheet (coral theme #fb7185)
- `/assets/js/calculator.js` - Calculator with fertility chart & calendar
- `/about/index.html` - About page
- `/contact/index.html` - Contact page (needs Formspree ID)
- `/privacy/index.html` - Privacy policy
- `/terms/index.html` - Terms of service  
- `/blog/index.html` - Blog listing page
- `/sitemap.xml` - Complete sitemap (16 pages)
- `/robots.txt` - Robots file
- `/assets/images/favicon/favicon.svg` - SVG favicon

### ⏳ NEEDS COMPLETION BY CLAUDE CODE

1. **Generate 10 blog articles (2000+ words each)**
2. **Generate PNG favicons from SVG**
3. **Generate OG image**

---

## STEP 1: Generate Blog Articles

Create these 10 articles in `/blog/[slug]/index.html`:

| # | Slug | Title | Target Keyword | Min Words |
|---|------|-------|----------------|-----------|
| 1 | how-many-days-after-period-do-you-ovulate | How Many Days After Your Period Do You Ovulate? | how many days after period ovulate | 2200 |
| 2 | menstrual-cycle-and-ovulation-explained | Understanding Your Menstrual Cycle and Ovulation | menstrual cycle calculator | 2400 |
| 3 | fertile-window-when-to-conceive | Fertile Window: When Are You Most Likely to Conceive? | fertile window, conceive calculator | 2200 |
| 4 | due-date-calculator-from-ovulation | Due Date Calculator Based on Ovulation Date | due date from ovulation | 2000 |
| 5 | ovulation-with-irregular-periods | Ovulation With Irregular Periods: How to Calculate | irregular periods ovulation | 2000 |
| 6 | basal-body-temperature-ovulation | Basal Body Temperature and Ovulation Tracking | basal body temperature ovulation | 2200 |
| 7 | signs-of-ovulation | Signs of Ovulation: How to Know When You're Fertile | signs of ovulation | 2000 |
| 8 | how-long-after-ovulation-is-period | How Long After Ovulation Does Your Period Start? | how long after ovulation period | 2000 |
| 9 | best-fertility-tracker-apps | Best Fertility Tracker Apps Compared | fertility tracker apps | 2000 |
| 10 | clearblue-ovulation-calculator-guide | Clearblue Ovulation Calculator Guide | clearblue ovulation calculator | 1800 |

### Article Requirements:
- Use same HTML template as voltage drop calculator
- Include: intro paragraph, TOC, 6-8 H2 sections, tables, FAQ (5 questions), CTA box, sources
- Medical disclaimer on each page
- Warm, supportive tone (not clinical)
- Link back to homepage calculator

---

## STEP 2: Generate Favicons

```bash
apt-get update && apt-get install -y imagemagick
cd assets/images/favicon
convert -background none favicon.svg -resize 16x16 favicon-16x16.png
convert -background none favicon.svg -resize 32x32 favicon-32x32.png
convert -background none favicon.svg -resize 180x180 apple-touch-icon.png
convert favicon-16x16.png favicon-32x32.png favicon.ico
```

---

## STEP 3: Generate OG Image

```bash
cd assets/images
convert -size 1200x630 xc:'#fb7185' \
  -font Helvetica-Bold -pointsize 64 -fill white \
  -gravity center -annotate +0-50 'Ovulation Calculator' \
  -font Helvetica -pointsize 32 \
  -annotate +0+50 'Find Your Fertile Window & Best Days to Conceive' \
  og-image.png
```

---

## STEP 4: Update Contact Form

Replace `YOUR_FORM_ID` in `/contact/index.html` with actual Formspree form ID.

---

## STEP 5: Test Locally

```bash
cd /path/to/calculateovulation
python3 -m http.server 8000
# Visit http://localhost:8000
```

Test:
- [ ] Date picker works
- [ ] Sliders update values
- [ ] Calculate button shows results
- [ ] 3-month calendar renders correctly
- [ ] Fertility chart shows percentages
- [ ] Mobile responsive
- [ ] All links work

---

## STEP 6: Deploy to Vercel

```bash
git init
git add .
git commit -m "Initial commit: Ovulation Calculator"
gh repo create calculateovulation --public --source=. --push
vercel --prod
```

---

## Technical Specs

| Item | Value |
|------|-------|
| **Domain** | calculateovulation.org |
| **Primary Color** | #fb7185 (warm coral) |
| **Category** | Health/Fertility |
| **Tone** | Warm, supportive, hopeful |
| **Formula** | Ovulation = LMP + (Cycle Length - 14) |
| **Calendar** | 3-month view |
| **Contact** | info@calculateovulation.org |

---

## File Structure

```
calculateovulation/
├── index.html                    ✅ Done
├── sitemap.xml                   ✅ Done
├── robots.txt                    ✅ Done
├── about/index.html              ✅ Done
├── contact/index.html            ✅ Done (needs Formspree)
├── privacy/index.html            ✅ Done
├── terms/index.html              ✅ Done
├── blog/
│   ├── index.html                ✅ Done
│   ├── how-many-days-after-period-do-you-ovulate/    ⏳ Generate
│   ├── menstrual-cycle-and-ovulation-explained/      ⏳ Generate
│   ├── fertile-window-when-to-conceive/              ⏳ Generate
│   ├── due-date-calculator-from-ovulation/           ⏳ Generate
│   ├── ovulation-with-irregular-periods/             ⏳ Generate
│   ├── basal-body-temperature-ovulation/             ⏳ Generate
│   ├── signs-of-ovulation/                           ⏳ Generate
│   ├── how-long-after-ovulation-is-period/           ⏳ Generate
│   ├── best-fertility-tracker-apps/                  ⏳ Generate
│   └── clearblue-ovulation-calculator-guide/         ⏳ Generate
├── assets/
│   ├── css/styles.css            ✅ Done
│   ├── js/calculator.js          ✅ Done
│   └── images/
│       ├── favicon/favicon.svg   ✅ Done
│       └── og-image.png          ⏳ Generate
```
