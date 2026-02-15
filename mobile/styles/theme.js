import { StyleSheet } from 'react-native';

// Neobrutalist color scheme - minimal and bold
export const colors = {
  bg: '#fafafa',
  text: '#000000',
  border: '#000000',
  primary: '#8d6e63',
  accent: '#f5f5f5',
  danger: '#ef4444',
  success: '#22c55e',
  cardBg: '#ffffff',
  inputBg: '#ffffff',
};

export const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Extra space to clear bottom nav
  },

  // Header - Neobrutalist
  header: {
    backgroundColor: colors.cardBg,
    borderBottomWidth: 3,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    marginRight: 10,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
  },

  // Bottom Nav - Neobrutalist
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.cardBg,
    borderTopWidth: 3,
    borderTopColor: colors.border,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  navButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 0,
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  navButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.border,
    shadowColor: colors.border,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  navButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  navButtonTextActive: {
    color: '#fff',
  },

  // Typography - Minimal
  h1: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 20,
  },
  muted: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
    opacity: 0.6,
  },
  tiny: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Card - Neobrutalist with hard shadow
  card: {
    backgroundColor: colors.cardBg,
    borderWidth: 3,
    borderColor: colors.border,
    borderRadius: 0,
    padding: 14,
    marginBottom: 10,
    shadowColor: colors.border,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Button - Neobrutalist
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: colors.border,
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: colors.border,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
  },
  btnOutlineText: {
    color: colors.text,
  },
  btnDisabled: {
    opacity: 0.5,
  },

  // Input - Neobrutalist
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 3,
    borderColor: colors.border,
    borderRadius: 0,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Progress Bar - Neobrutalist
  progressBar: {
    height: 20,
    backgroundColor: colors.accent,
    borderWidth: 3,
    borderColor: colors.border,
    borderRadius: 0,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
  },
  progressFillDanger: {
    backgroundColor: colors.danger,
  },

  // Castle - Minimal
  castleContainer: {
    padding: 16,
    backgroundColor: colors.accent,
    borderWidth: 3,
    borderColor: colors.border,
    borderRadius: 0,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: colors.border,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  castleEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },

  // Alert - Neobrutalist
  alert: {
    padding: 12,
    borderRadius: 0,
    borderWidth: 3,
    marginBottom: 10,
  },
  alertSuccess: {
    backgroundColor: '#e8f5e9',
    borderColor: colors.success,
  },
  alertError: {
    backgroundColor: '#ffebee',
    borderColor: colors.danger,
  },
  alertText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },


  // Member - Neobrutalist
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 0,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 3,
    borderColor: colors.border,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fff',
  },

  // Badges & Small Buttons
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: colors.border,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#fff',
  },
  btnGhostSmall: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: '#fff',
  },
  btnGhostSmallText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.text,
  },
});
