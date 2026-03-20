/**
 * Ant Design Theme Configuration
 * Design system chung cho EduPath
 */
const theme = {
  token: {
    // Brand Colors
    colorPrimary: '#4F46E5',       // Indigo-600
    colorSuccess: '#10B981',       // Emerald-500
    colorWarning: '#F59E0B',       // Amber-500
    colorError: '#EF4444',         // Red-500
    colorInfo: '#3B82F6',          // Blue-500

    // Typography
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 14,
    fontSizeHeading1: 32,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,

    // Border Radius
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,

    // Spacing
    paddingLG: 24,
    paddingMD: 16,

    // Shadows
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    boxShadowSecondary: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',

    // Layout
    colorBgLayout: '#F8FAFC',
    colorBgContainer: '#FFFFFF',
    controlHeight: 40,
  },
  components: {
    Layout: {
      siderBg: '#111827',
      headerBg: '#FFFFFF',
      bodyBg: '#F8FAFC',
    },
    Menu: {
      darkItemBg: '#111827',
      darkItemSelectedBg: '#4F46E5',
      darkSubMenuItemBg: '#1F2937',
      darkItemColor: '#9CA3AF',
      darkItemHoverColor: '#FFFFFF',
      darkItemSelectedColor: '#FFFFFF',
      itemBorderRadius: 8,
    },
    Button: {
      primaryShadow: '0 2px 4px rgba(79, 70, 229, 0.3)',
      controlHeight: 40,
      controlHeightLG: 48,
    },
    Card: {
      borderRadiusLG: 12,
    },
    Table: {
      headerBg: '#F1F5F9',
      headerColor: '#475569',
    },
    Input: {
      controlHeight: 40,
    },
  },
};

export default theme;
