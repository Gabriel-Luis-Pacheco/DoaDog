# DoaDog Project Instructions

## Product identity

DoaDog is a Brazilian Portuguese mobile app for responsible dog adoption, monitoring dogs in street situations, and creating donation/crowdfunding requests for dogs, NGOs, protectors, and volunteers.

The app must feel modern, calm, trustworthy, clean, and emotionally human. It must not feel childish, chaotic, generic, or AI-generated.

## UI rules

- Do not overuse emojis.
- Do not use emojis as decoration.
- Prefer clean icons from the existing icon library or Expo-compatible icons.
- Keep screens visually simple.
- Reduce information density.
- Use whitespace, hierarchy, and progressive disclosure.
- Each screen should have one clear primary action.
- Avoid too many cards, badges, chips, colors, shadows, and text blocks on the same screen.
- Avoid generic gradients and random colorful UI.
- Do not add fake/default dogs.
- Do not add fake/default donation campaigns unless they are clearly marked as sample/demo and easy to remove.
- Keep all visible text in pt-BR.

## Design direction

Use a professional pet-tech visual identity:
- Deep navy as the main brand color.
- White/off-white surfaces.
- Blue as the main accent.
- Soft orange/coral only for important CTAs or donation highlights.
- Rounded cards with clean spacing.
- Minimal icons.
- Calm typography.
- Premium but simple layout.

## Theme system

The app must support light and dark mode.
The theme toggle must be visible in the Profile/Settings screen.
The theme choice must be persisted locally.
All colors must come from the centralized theme file, not hardcoded inside screens.

## Donation feature

The Donations tab is not a generic donation information page.
It must work like a small crowdfunding/Vakinha-style area.

Users should be able to:
- View donation requests/campaigns.
- Create a new donation request.
- See campaign title, image, description, goal amount, collected amount, progress bar, urgency, location, beneficiary, and donation method.
- Tap a Donate button.

For now, payment processing can be placeholder only.
Do not implement real payment unless explicitly requested.
Use placeholders for Pix/payment fields.

## Code quality

- Keep Expo Go compatibility.
- Do not break navigation.
- Prefer reusable components.
- Keep code readable for a beginner/intermediate React Native developer.
- Explain changed files after finishing.

## Visual quality bar

DoaDog must not look like a generic dark blue template.

The UI should feel like a premium pet-tech/social-impact app:
- clean like Apple
- structured like Material 3
- polished like a fintech
- warm like a pet app
- technological like a modern startup product

Avoid:
- huge typography everywhere
- excessive borders
- bulky cards
- emoji decoration
- generic gradients
- fake content
- static screens with no interaction
- bottom tabs using text as icons

Required:
- subtle animations
- clear hierarchy
- premium onboarding
- functional forms
- working submit buttons
- reusable design system components

## Final DoaDog Product Rules

DoaDog must be treated as a near-final mobile product, not a basic school prototype.

The product must focus on:
- centralizing information
- reducing volunteer workload
- registering dogs with photo, location and description
- supporting responsible adoption
- creating donation/crowdfunding requests
- making the experience simple, beautiful and trustworthy

The app must feel:
- premium
- technological
- fluid
- modern
- emotionally credible
- pet-focused without being childish

Never:
- use excessive emojis
- create fake default dogs
- create fake default campaigns unless clearly marked as demo
- leave primary buttons broken
- expose raw Pix/contact data in ugly cards
- scatter hardcoded colors through screens
- make screens visually heavy or confusing

Always:
- use centralized theme tokens
- keep Expo Go compatibility
- use reusable components
- use subtle animation
- use clear validation
- keep onboarding polished
- keep forms functional
- keep light/dark mode working