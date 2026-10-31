# Design Audit: DuoPlay

**Date:** October 31, 2026
**Reviewer:** UI/UX Design System
**Version:** 2.0 (Premium Intimacy Theme)

---

## Executive Summary

The DuoPlay interface has been redesigned with a premium, elegant aesthetic suited for private couple experiences. The new palette (Prune, Bordeaux, Warm Cream, Powder Rose, Midnight Blue) creates a cohesive visual identity. However, several accessibility and consistency issues require attention.

---

## 🔴 Blocking Issues

| # | Element | Issue | Fix |
|---|---------|-------|-----|
| 1 | All interactive buttons | Missing `aria-label` for icon-only buttons | Add `aria-label` with descriptive text |
| 2 | Focus states | Inconsistent ring colors across components | Standardize to `--ring: var(--color-bordeaux-500)` |
| 3 | Mobile nav items | Touch targets vary below 44px minimum | Ensure all nav items use `min-h-[44px]` |

---

## 🟡 Important Issues

| # | Element | Issue | Fix |
|---|---------|-------|-----|
| 1 | Card components | Some cards use hardcoded colors | Use semantic tokens (`bg-card`, `bg-surface`) |
| 2 | Animations | Framer Motion used inconsistently | Apply `AnimatedCard` to all interactive cards |
| 3 | Sidebar (tablet) | No visible indicator when active | Add `border-bordeaux-500/30` on active state |
| 4 | Typography | Cormorant font size varies | Standardize headings: h1=2rem, h2=1.5rem, h3=1.25rem |
| 5 | Color contrast | Some text on dark backgrounds < 4.5:1 | Use `--color-cream-100` for body text |

---

## 🟢 Polish Items

| # | Element | Issue | Fix |
|---|---------|-------|-----|
| 1 | Card shadows | Slight inconsistency in elevation | Use `--shadow-md` standard for all cards |
| 2 | Hover states | Some transitions too fast | Standardize to `duration-200` |
| 3 | Spacing | Some paddings vary (p-4 vs p-5) | Use consistent `p-4` or `p-5` per component |
| 4 | Mobile gestures | No swipe-to-dismiss on modals | Add swipe gesture handlers |
| 5 | Loading states | Skeleton screens not consistent | Create `Skeleton` component with `shimmer` animation |

---

## ✅ Completed Improvements

| # | Element | Change Made |
|---|---------|-------------|
| 1 | Global color system | Implemented Prune/Bordeaux/Cream/Rose/Midnight palette |
| 2 | Shadow hierarchy | Defined `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-glow` |
| 3 | Sidebar | Updated with new colors, focus states, and active indicators |
| 4 | BottomNav | Improved mobile navigation with better touch targets |
| 5 | Cards | Standardized with new token system and improved shadows |
| 6 | Animations | Created `motion.tsx` utilities for consistent interactions |
| 7 | Accessibility | Added skip-link, proper `:focus-visible`, and reduced-motion support |

---

## Recommendations

1. **Implement consistent motion patterns**: Use `staggerContainer` for list items
2. **Add comprehensive skeleton states**: Create loading placeholders for all data views
3. **Standardize touch targets**: Every interactive element should be min 44×44px
4. **Document design tokens**: Create `docs/design-tokens.md` for team reference
5. **Test with screen readers**: Verify all `aria-label` usage and heading hierarchy

---

**Next Review Date:** After implementing blocking and important issues