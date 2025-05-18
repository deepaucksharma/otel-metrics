# tokens.css – style tokens

This document defines the CSS custom properties used across UI atoms. The file `tokens.css` is included globally and exposes colour tokens that keep the
visual language consistent.

## Core colour tokens

| Token | Default value | Usage |
|-------|---------------|-------|
| `--ringTrackGrey` | `#3a3a3a` | Background track for progress rings |
| `--ringOkGreen` | `#2ecc71` | Low utilisation / success state |
| `--ringWarnAmber` | `#ffb74d` | Warning state for rising utilisation |
| `--ringAlertRed` | `#ff5252` | Critical/high utilisation |
| `--metricBlue` | `#3399ff` | Default fill of miniature bars |
| `--barTrack` | `#2b2b2b` | Track/backdrop of mini bars |
| `--rarityGreen` | `#2ecc71` | Attribute value is common |
| `--rarityAmber` | `#ffb74d` | Attribute value is uncommon |
| `--rarityRed` | `#ff5252` | Attribute value is rare |
| `--iconGrey` | `#9e9e9e` | Default icon colour |
| `--iconHover` | `#e0e0e0` | Icon colour on hover |

## Typography and spacing tokens

No dedicated typography or spacing tokens are currently defined. Components set their own font sizes and margins directly. Introduce tokens here if a pattern emerges.

## Extending or overriding tokens

`tokens.css` is loaded globally. To add new tokens, append them under the `:root` selector in the file and document the intended usage in this markdown file. Consumers may override tokens by providing new values under a more specific CSS selector, e.g.,

```css
:root {
  --metricBlue: #0066cc; /* override default */
}
```

Avoid renaming existing tokens to preserve backwards compatibility.
