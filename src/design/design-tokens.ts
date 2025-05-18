/**
 * IntelliMetric Explorer – Design Tokens
 *
 * Centralized constants mirroring the CSS variables in `tokens.css`.
 * Use these values for consistent theming across the UI.
 */
/** Background color tokens used for surfaces, cards and overlays. */
export const backgroundColorsTokens = {
  surfaceBg: "#1e1e1e",
  surfaceBgHover: "#252525",
  surfaceBgActive: "#2d2d2d",
  cardBg: "#252525",
  cardBgHover: "#2a2a2a",
  headerBg: "#1a1a1a",
  inputBg: "#333333",
  inputBgFocus: "#3a3a3a",
  highlightBg: "rgba(255, 200, 0, 0.1)",
  focusHighlightBg: "rgba(64, 156, 255, 0.1)",
  modalBg: "rgba(0, 0, 0, 0.7)",
  tooltipBg: "#1a1a1a",
  codeBg: "#1a1a1a",
  jsonBg: "#161616",
} as const;

/** Text color tokens for body text, headings and status messages. */
export const textColorsTokens = {
  textPrimary: "#e0e0e0",
  textSecondary: "#b0b0b0",
  textTertiary: "#888888",
  textDisabled: "#666666",
  textInverse: "#1e1e1e",
  textCode: "#e2e2e2",
  textError: "#ff5252",
  textSuccess: "#4caf50",
  textWarning: "#ff9800",
  headingText: "#ffffff",
  attrKeyColor: "#9cdcfe",
  attrValueColor: "#e0e0e0",
} as const;

/** Border color tokens for dividers and focus rings. */
export const borderColorsTokens = {
  borderColor: "#333333",
  borderColorLight: "#444444",
  borderColorFocus: "#0078d4",
  dividerColor: "#333333",
  sectionDivider: "#3a3a3a",
} as const;

/** Status and interaction indicator colors. */
export const indicatorColorsTokens = {
  statusSuccess: "#2ecc71",
  statusWarning: "#f39c12",
  statusError: "#e74c3c",
  statusInfo: "#3498db",
  ringTrackGrey: "#3a3a3a",
  ringOkGreen: "#2ecc71",
  ringWarnAmber: "#ffb74d",
  ringAlertRed: "#ff5252",
  buttonPrimary: "#0078d4",
  buttonHover: "#106ebe",
  buttonActive: "#005a9e",
  buttonDisabled: "#333333",
} as const;

/** Visualization tokens for charts and data displays. */
export const visualizationSpecificColorsTokens = {
  chipBgColor: "rgba(30, 30, 30, 0.7)",
  chipHoverBgColor: "rgba(40, 40, 40, 0.8)",
  chipOperatorColor: "#888888",
  chipCountColor: "#aaaaaa",
  chipEqualsColor: "#e0e0e0",
  exemplarDotDefault: "#666666",
  exemplarDotSelected: "#f39c12",
  exemplarAxisColor: "#444444",
  miniBarBg: "#3a3a3a",
  miniBarFill: "#0078d4",
  rarityLow: "#2ecc71",
  rarityMed: "#f39c12",
  rarityHigh: "#e74c3c",
  simulationBg: "rgba(0, 120, 212, 0.1)",
} as const;

/** Spacing scale and component padding values. */
export const spacingTokens = {
  spaceXS: "4px",
  spaceS: "8px",
  spaceM: "16px",
  spaceL: "24px",
  spaceXL: "32px",
  space2XL: "48px",
  cardPadding: "var(--spaceM)",
  headerPadding: "var(--spaceM)",
  sectionGap: "var(--spaceL)",
  gridGap: "var(--spaceXS)",
  inputPadding: "var(--spaceS)",
} as const;

/** Font families, sizes and weights. */
export const typographyTokens = {
  systemFont: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
  monoFont: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
  fontXS: "11px",
  fontS: "12px",
  fontM: "14px",
  fontL: "16px",
  fontXL: "18px",
  font2XL: "24px",
  lineHeightTight: "1.2",
  lineHeightNormal: "1.5",
  lineHeightLoose: "1.8",
  fontWeightNormal: "400",
  fontWeightMedium: "500",
  fontWeightSemibold: "600",
  fontWeightBold: "700",
} as const;

/** Border radii, shadows and component sizing. */
export const layoutTokens = {
  radiusXS: "2px",
  radiusS: "4px",
  radiusM: "6px",
  radiusL: "8px",
  radiusXL: "12px",
  radiusRound: "50%",
  shadowS: "0 1px 3px rgba(0, 0, 0, 0.12)",
  shadowM: "0 2px 6px rgba(0, 0, 0, 0.16)",
  shadowL: "0 4px 12px rgba(0, 0, 0, 0.2)",
  shadowXL: "0 8px 24px rgba(0, 0, 0, 0.24)",
  zIndexBase: "1",
  zIndexDropdown: "10",
  zIndexSticky: "20",
  zIndexDrawer: "30",
  zIndexModal: "40",
  zIndexTooltip: "50",
  drawerWidth: "660px",
  headerHeight: "64px",
  inputHeight: "32px",
  buttonHeight: "32px",
  iconSize: "18px",
} as const;

/** Timing and easing values for motion. */
export const animationTokens = {
  durationXS: "100ms",
  durationS: "150ms",
  durationM: "250ms",
  durationL: "350ms",
  durationXL: "500ms",
  easingStandard: "cubic-bezier(0.4, 0.0, 0.2, 1)",
  easingAccelerate: "cubic-bezier(0.4, 0.0, 1, 1)",
  easingDecelerate: "cubic-bezier(0.0, 0.0, 0.2, 1)",
  transitionDefault: "all var(--durationS) var(--easingStandard)",
  transitionExpand: "all var(--durationM) var(--easingDecelerate)",
  transitionFade: "opacity var(--durationS) var(--easingStandard)",
} as const;

/** Styling for the inspector drawer header. */
export const inspectorHeaderTokens = {
  inspectorHeaderBg: "var(--headerBg)",
  inspectorHeaderHeight: "var(--headerHeight)",
  inspectorHeaderTitleColor: "var(--headingText)",
  inspectorHeaderDescColor: "var(--textSecondary)",
  closeButtonColor: "var(--textTertiary)",
  closeButtonHoverColor: "var(--textPrimary)",
  closeButtonHoverBg: "rgba(255, 255, 255, 0.1)",
} as const;

/** Tokens for attribute list styling. */
export const attributeZoneTokens = {
  attrZoneBg: "var(--cardBg)",
  attrZoneTitleColor: "var(--textPrimary)",
  attrZoneSectionTitleColor: "var(--textSecondary)",
  attrRowBg: "transparent",
  attrRowHoverBg: "var(--surfaceBgHover)",
  attrRowFocusBg: "var(--highlightBg)",
  attrRowBorderFocus: "rgba(255, 200, 0, 0.5)",
} as const;

/** Capsule component and mini bar tokens. */
export const cardinalityCapsuleTokens = {
  cardinalityCapsuleBg: "var(--cardBg)",
  cardinalityHeaderColor: "var(--textPrimary)",
  miniBarRowHoverBg: "var(--surfaceBgHover)",
  miniBarRowFocusBg: "var(--focusHighlightBg)",
  simulationSectionBg: "var(--simulationBg)",
  checkboxLabelColor: "var(--textPrimary)",
  focusedAttrColor: "var(--statusSuccess)",
} as const;

/** Formatting tokens for the raw JSON viewer. */
export const rawJSONZoneTokens = {
  rawJsonHeaderBg: "var(--headerBg)",
  rawJsonContentBg: "var(--codeBg)",
  rawJsonSyntaxKeyColor: "#9cdcfe",
  rawJsonSyntaxStringColor: "#ce9178",
  rawJsonSyntaxNumberColor: "#b5cea8",
  rawJsonSyntaxBooleanColor: "#569cd6",
  rawJsonSyntaxNullColor: "#569cd6",
  jsonExpandButtonColor: "var(--textSecondary)",
  jsonExpandButtonHoverColor: "var(--textPrimary)",
} as const;
