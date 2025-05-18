# IntelliMetric Explorer – Design Tokens
*(Centralized design system · Inspector 1.1)*

---

## 1. Purpose

This document defines the **centralized design tokens** used throughout the IntelliMetric Explorer UI. These tokens provide:

* Consistent visual language across components
* Simplified theme changes and dark/light mode support
* Accessibility compliance for all visual elements
* Single source of truth for all styling values

All UI components should reference these tokens rather than using hardcoded values.

---

## 2. Usage

Design tokens are implemented as CSS variables in a global `tokens.css` file that is imported at the application root:

```css
/* src/design/tokens.css */
:root {
  /* Colors, spacing, etc. defined here */
}

/* Optional dark/light mode variants */
@media (prefers-color-scheme: light) {
  :root {
    /* Light theme overrides */
  }
}
```

## 3. Color Tokens

### 3.1 Background Colors

```css
:root {
  /* Surface backgrounds */
  --surfaceBg: #1e1e1e;       /* Main drawer background */
  --surfaceBgHover: #252525;  /* Surface hover state */
  --surfaceBgActive: #2d2d2d; /* Surface active state */
  
  /* Card backgrounds */
  --cardBg: #252525;           /* Component card background */
  --cardBgHover: #2a2a2a;      /* Card hover state */
  --headerBg: #1a1a1a;         /* Card header background */
  
  /* Input backgrounds */
  --inputBg: #333333;          /* Form inputs */
  --inputBgFocus: #3a3a3a;     /* Input focus state */
  
  /* Highlight backgrounds */
  --highlightBg: rgba(255, 200, 0, 0.1);  /* Selection highlight */
  --focusHighlightBg: rgba(64, 156, 255, 0.1); /* Focus state */
  
  /* Overlay backgrounds */
  --modalBg: rgba(0, 0, 0, 0.7);  /* Modal overlay */
  --tooltipBg: #1a1a1a;           /* Tooltip background */
  
  /* Code & data backgrounds */
  --codeBg: #1a1a1a;              /* Code snippets background */
  --jsonBg: #161616;              /* JSON viewer background */
}
```

### 3.2 Text Colors

```css
:root {
  /* Primary text */
  --textPrimary: #e0e0e0;       /* Main text color */
  --textSecondary: #b0b0b0;     /* Secondary text */
  --textTertiary: #888888;      /* Tertiary text */
  --textDisabled: #666666;      /* Disabled text */
  
  /* Specialized text */
  --textInverse: #1e1e1e;       /* Text on light backgrounds */
  --textCode: #e2e2e2;          /* Monospace/code text */
  --textError: #ff5252;         /* Error messages */
  --textSuccess: #4caf50;       /* Success messages */
  --textWarning: #ff9800;       /* Warning messages */
  --headingText: #ffffff;       /* Heading text */
  
  /* Attribute-specific text */
  --attrKeyColor: #9cdcfe;      /* Attribute keys */
  --attrValueColor: #e0e0e0;    /* Attribute values */
}
```

### 3.3 Border Colors

```css
:root {
  /* Borders */
  --borderColor: #333333;        /* Standard borders */
  --borderColorLight: #444444;   /* Lighter borders */
  --borderColorFocus: #0078d4;   /* Focus state borders */
  
  /* Dividers */
  --dividerColor: #333333;       /* Section dividers */
  --sectionDivider: #3a3a3a;     /* Major section separation */
}
```

### 3.4 Indicator Colors

```css
:root {
  /* Status colors */
  --statusSuccess: #2ecc71;     /* Success state */
  --statusWarning: #f39c12;     /* Warning state */
  --statusError: #e74c3c;       /* Error state */
  --statusInfo: #3498db;        /* Information state */
  
  /* Series Ring (C-Ring) colors */
  --ringTrackGrey: #3a3a3a;     /* Ring track color */
  --ringOkGreen: #2ecc71;       /* 0-60% utilization */
  --ringWarnAmber: #ffb74d;     /* 60-85% utilization */
  --ringAlertRed: #ff5252;      /* >85% utilization */
  
  /* Buttons */
  --buttonPrimary: #0078d4;     /* Primary button */
  --buttonHover: #106ebe;       /* Button hover state */
  --buttonActive: #005a9e;      /* Button active state */
  --buttonDisabled: #333333;    /* Disabled button */
}
```

### 3.5 Visualization-specific Colors

```css
:root {
  /* Chip colors */
  --chipBgColor: rgba(30, 30, 30, 0.7);   /* Series math chip background */
  --chipHoverBgColor: rgba(40, 40, 40, 0.8); /* Chip hover state */
  --chipOperatorColor: #888888;           /* Math operators */
  --chipCountColor: #aaaaaa;              /* Count values */
  --chipEqualsColor: #e0e0e0;             /* Equals sign color */
  
  /* Exemplar colors */
  --exemplarDotDefault: #666666;          /* Exemplar dot default */
  --exemplarDotSelected: #f39c12;         /* Selected exemplar */
  --exemplarAxisColor: #444444;           /* Timeline axis */
  
  /* MiniBar colors */
  --miniBarBg: #3a3a3a;                   /* Bar background */
  --miniBarFill: #0078d4;                 /* Bar fill color */
  
  /* Rarity Dot colors */
  --rarityLow: #2ecc71;                   /* Low cardinality (1-2 values) */
  --rarityMed: #f39c12;                   /* Medium cardinality (3-10 values) */
  --rarityHigh: #e74c3c;                  /* High cardinality (>10 values) */
  
  /* Simulation section */
  --simulationBg: rgba(0, 120, 212, 0.1); /* Simulation background */
}
```

## 4. Spacing Tokens

```css
:root {
  /* Base spacing unit: 4px */
  --spaceXS: 4px;     /* Extra small (4px) */
  --spaceS: 8px;      /* Small (8px) */
  --spaceM: 16px;     /* Medium (16px) */
  --spaceL: 24px;     /* Large (24px) */
  --spaceXL: 32px;    /* Extra large (32px) */
  --space2XL: 48px;   /* 2X Extra large (48px) */
  
  /* Component-specific spacing */
  --cardPadding: var(--spaceM);
  --headerPadding: var(--spaceM);
  --sectionGap: var(--spaceL);
  --gridGap: var(--spaceXS);
  --inputPadding: var(--spaceS);
}
```

## 5. Typography Tokens

```css
:root {
  /* Font families */
  --systemFont: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  --monoFont: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  
  /* Font sizes */
  --fontXS: 11px;    /* Extra small */
  --fontS: 12px;     /* Small */
  --fontM: 14px;     /* Medium (base) */
  --fontL: 16px;     /* Large */
  --fontXL: 18px;    /* Extra large */
  --font2XL: 24px;   /* 2X Extra large */
  
  /* Line heights */
  --lineHeightTight: 1.2;
  --lineHeightNormal: 1.5;
  --lineHeightLoose: 1.8;
  
  /* Font weights */
  --fontWeightNormal: 400;
  --fontWeightMedium: 500;
  --fontWeightSemibold: 600;
  --fontWeightBold: 700;
}
```

## 6. Layout Tokens

```css
:root {
  /* Border radius */
  --radiusXS: 2px;    /* Extra small */
  --radiusS: 4px;     /* Small */
  --radiusM: 6px;     /* Medium */
  --radiusL: 8px;     /* Large */
  --radiusXL: 12px;   /* Extra large */
  --radiusRound: 50%; /* Circular */
  
  /* Shadows */
  --shadowS: 0 1px 3px rgba(0, 0, 0, 0.12);
  --shadowM: 0 2px 6px rgba(0, 0, 0, 0.16);
  --shadowL: 0 4px 12px rgba(0, 0, 0, 0.2);
  --shadowXL: 0 8px 24px rgba(0, 0, 0, 0.24);
  
  /* Z-index layers */
  --zIndexBase: 1;
  --zIndexDropdown: 10;
  --zIndexSticky: 20;
  --zIndexDrawer: 30;
  --zIndexModal: 40;
  --zIndexTooltip: 50;
  
  /* Component sizes */
  --drawerWidth: 660px;
  --headerHeight: 64px;
  --inputHeight: 32px;
  --buttonHeight: 32px;
  --iconSize: 18px;
}
```

## 7. Animation Tokens

```css
:root {
  /* Durations */
  --durationXS: 100ms;   /* Extra fast */
  --durationS: 150ms;    /* Fast */
  --durationM: 250ms;    /* Medium */
  --durationL: 350ms;    /* Slow */
  --durationXL: 500ms;   /* Extra slow */
  
  /* Easing curves */
  --easingStandard: cubic-bezier(0.4, 0.0, 0.2, 1);
  --easingAccelerate: cubic-bezier(0.4, 0.0, 1, 1);
  --easingDecelerate: cubic-bezier(0.0, 0.0, 0.2, 1);
  
  /* Common animations */
  --transitionDefault: all var(--durationS) var(--easingStandard);
  --transitionExpand: all var(--durationM) var(--easingDecelerate);
  --transitionFade: opacity var(--durationS) var(--easingStandard);
}
```

## 8. Component-specific Token Groups

### 8.1 Inspector Header

```css
:root {
  --inspectorHeaderBg: var(--headerBg);
  --inspectorHeaderHeight: var(--headerHeight);
  --inspectorHeaderTitleColor: var(--headingText);
  --inspectorHeaderDescColor: var(--textSecondary);
  --closeButtonColor: var(--textTertiary);
  --closeButtonHoverColor: var(--textPrimary);
  --closeButtonHoverBg: rgba(255, 255, 255, 0.1);
}
```

### 8.2 Attribute Zone

```css
:root {
  --attrZoneBg: var(--cardBg);
  --attrZoneTitleColor: var(--textPrimary);
  --attrZoneSectionTitleColor: var(--textSecondary);
  --attrRowBg: transparent;
  --attrRowHoverBg: var(--surfaceBgHover);
  --attrRowFocusBg: var(--highlightBg);
  --attrRowBorderFocus: rgba(255, 200, 0, 0.5);
}
```

### 8.3 Cardinality Capsule

```css
:root {
  --cardinalityCapsuleBg: var(--cardBg);
  --cardinalityHeaderColor: var(--textPrimary);
  --miniBarRowHoverBg: var(--surfaceBgHover);
  --miniBarRowFocusBg: var(--focusHighlightBg);
  --simulationSectionBg: var(--simulationBg);
  --checkboxLabelColor: var(--textPrimary);
  --focusedAttrColor: var(--statusSuccess);
}
```

### 8.4 Raw JSON Zone

```css
:root {
  --rawJsonHeaderBg: var(--headerBg);
  --rawJsonContentBg: var(--codeBg);
  --rawJsonSyntaxKeyColor: #9cdcfe;    /* Key color */
  --rawJsonSyntaxStringColor: #ce9178; /* String value */
  --rawJsonSyntaxNumberColor: #b5cea8; /* Number value */
  --rawJsonSyntaxBooleanColor: #569cd6; /* Boolean value */
  --rawJsonSyntaxNullColor: #569cd6;    /* Null value */
  --jsonExpandButtonColor: var(--textSecondary);
  --jsonExpandButtonHoverColor: var(--textPrimary);
}
```

## 9. Accessibility Requirements

All color combinations must meet the following minimum contrast ratios:

| Element Type | Minimum Contrast |
|--------------|------------------|
| Normal text (14px+) | 4.5:1 |
| Large text (18px+) | 3:1 |
| UI components/graphical objects | 3:1 |
| Focus indicators | 3:1 |

The current token set has been verified to meet WCAG AA standards for text and interactive elements on the dark theme background.

## 10. Implementation Consistency

Components must use tokens for all visual styling:

```tsx
// INCORRECT - hardcoded value
<div style={{ backgroundColor: '#252525' }}>

// CORRECT - uses token
<div style={{ backgroundColor: 'var(--cardBg)' }}>

// BEST - uses CSS module with token
// Component.module.css
.container {
  background-color: var(--cardBg);
}

// Component.tsx
<div className={styles.container}>
```

## 11. Maintenance & Updates

When adding a new component:
1. First check if existing tokens cover your needs
2. If a new token is required, add it to this document
3. If adding component-specific tokens, add them to Section 8
4. Update tokens.css with the new value

The design token system should evolve with the application but maintain backward compatibility whenever possible.