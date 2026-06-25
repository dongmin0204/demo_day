# Medication Safety App UI Refactoring Brief

You are a senior product designer with 10+ years of experience designing healthcare, fintech, and enterprise SaaS products.

Your task is NOT to redesign the UX flow.

Do NOT change:

* information architecture
* navigation structure
* page flow
* user journeys
* business logic

Focus ONLY on visual design, component design, spacing, typography, color systems, and overall UI quality.

---

## Product Context

This is a mobile-first healthcare web application called "약조심".

Purpose:

* Check medication interactions
* Check medication + food interactions
* Check medication + supplement interactions
* OCR prescription analysis
* Explain risks in simple language

The product must feel:

* medically trustworthy
* calm
* premium
* modern
* investor-demo ready

Users should feel:

"I trust this result."

not

"This looks like a student project."

---

## Current Problems

The current interface looks AI-generated.

Typical symptoms:

* every card looks identical
* every section has the same visual weight
* excessive use of white cards
* generic Tailwind aesthetics
* large decorative icons
* weak visual hierarchy
* overuse of rounded containers
* template-like composition
* Figma Make appearance

The UI currently feels:

"clean but forgettable"

The goal is:

"professional healthcare startup"

---

## Visual Direction

Blend:

60% Apple Health
20% Stripe
10% Toss
10% Linear

Avoid:

* crypto aesthetics
* web3 aesthetics
* dribbble-style gradients
* startup landing page clichés
* excessive glassmorphism
* neon colors
* dashboard-style clutter
* generic Tailwind blocks

---

## Typography

Typography should be a major design element.

Use:

* Pretendard
  or
* SUIT

Hierarchy:

Display Title:

* 32~40px
* Bold
* Tight letter spacing

Section Title:

* 22~28px
* Semi Bold

Body:

* 15~16px

Caption:

* 13~14px

Use typography contrast aggressively.

Avoid pages where every text element feels the same size and weight.

---

## Card System

Do NOT make every card identical.

Create 3 visual layers.

### Primary Card

Used for:

* Hero
* Important Actions
* Key Results

Characteristics:

* larger
* stronger contrast
* visually dominant

### Secondary Card

Used for:

* Features
* Information Blocks

Characteristics:

* neutral
* supportive

### Tertiary Card

Used for:

* lightweight information

Characteristics:

* minimal borders
* almost flat

---

## Radius System

Avoid excessive rounding.

Use:

Hero:
28px

Cards:
20px

Buttons:
16px

Pills:
999px

Every component should not use the same radius.

---

## Color System

The interface should communicate trust.

Primary:
Deep Medical Blue

Success:
Calm Green

Warning:
Amber

Danger:
Red

Background:
Very Light Gray

Use color sparingly.

Most emphasis should come from:

* typography
* spacing
* hierarchy

Not color overload.

---

## Layout

Create stronger visual hierarchy.

Current issue:
Every section feels equally important.

Improve:

* Hero dominates the page
* Features become secondary
* Utility actions become tertiary

Users should immediately understand where to look first.

---

## Hero Section

The current hero feels empty.

Do NOT use a giant icon floating in empty space.

Instead create:

* meaningful visual composition
* medication-related visual elements
* subtle data visualization
* interaction illustration
* analysis flow visualization

The hero should immediately communicate:

"AI-powered medication safety analysis"

without requiring text explanation.

---

## Icons

Reduce icon dominance.

Current icons are too large and decorative.

Use:

* Lucide Icons
* Consistent stroke width
* Smaller sizes

Icons should support content, not compete with content.

---

## Motion

Use subtle motion only.

Examples:

* fade in
* slide up
* staggered appearance

Avoid:

* bounce
* pulse
* flashy transitions

Motion should feel premium and intentional.

---

## Shadows

Avoid generic Tailwind shadows.

Use:

* soft shadows
* low contrast
* premium depth

Shadows should separate layers without drawing attention.

---

## Design Goal

The final result should look like:

A funded healthcare startup preparing for a public demo day.

Not:

* Figma Make template
* AI-generated dashboard
* student side project
* generic Tailwind SaaS UI

When making design decisions, prioritize:

1. Trust
2. Clarity
3. Visual hierarchy
4. Premium execution
5. Demo-day impact
