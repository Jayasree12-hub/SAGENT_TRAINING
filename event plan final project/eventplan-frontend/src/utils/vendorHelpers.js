export function formatVendorCurrency(value) {
  if (value == null || value === '') return 'Not set'
  return `INR ${Number(value).toLocaleString('en-IN')}`
}

export function formatVendorDate(value) {
  if (!value) return 'Date not set'
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function vendorDisplayName(vendor) {
  if (!vendor) return 'Vendor'
  return vendor.businessName || vendor.user?.name || vendor.user?.email || 'Vendor'
}

export function vendorSummary(vendor) {
  if (vendor?.aboutBusiness?.trim()) return vendor.aboutBusiness.trim()
  if (vendor?.businessDetails?.trim()) return vendor.businessDetails.trim()
  const businessName = vendorDisplayName(vendor)
  const serviceType = vendor?.serviceType || 'event'
  return `${businessName} offers ${serviceType.toLowerCase()} support for planners who need a reliable vendor partner.`
}

export function vendorDetailSummary(vendor) {
  if (vendor?.businessDetails?.trim()) return vendor.businessDetails.trim()
  return 'Share package details, service process, event coverage, and what makes this business stand out.'
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function accentPalette(serviceType = '') {
  const normalized = serviceType.trim().toLowerCase()
  if (normalized.includes('photo') || normalized.includes('video')) {
    return { primary: '#1e3a8a', secondary: '#dbeafe', glow: '#93c5fd' }
  }
  if (normalized.includes('music') || normalized.includes('dj')) {
    return { primary: '#7c2d12', secondary: '#ffedd5', glow: '#fdba74' }
  }
  if (normalized.includes('decor') || normalized.includes('flor')) {
    return { primary: '#166534', secondary: '#dcfce7', glow: '#86efac' }
  }
  if (normalized.includes('venue')) {
    return { primary: '#5b21b6', secondary: '#ede9fe', glow: '#c4b5fd' }
  }
  return { primary: '#924f16', secondary: '#f7e6c4', glow: '#f0c987' }
}

export function vendorImageSrc(vendor) {
  if (vendor?.photoUrl?.trim()) return vendor.photoUrl.trim()

  const title = escapeXml(vendorDisplayName(vendor))
  const service = escapeXml(vendor?.serviceType || 'Vendor partner')
  const initials = title
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('') || 'VN'
  const palette = accentPalette(service)

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette.secondary}" />
          <stop offset="100%" stop-color="#f8f4ea" />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#bg)" />
      <circle cx="930" cy="180" r="170" fill="${palette.glow}" fill-opacity="0.55" />
      <circle cx="220" cy="740" r="220" fill="${palette.glow}" fill-opacity="0.28" />
      <rect x="92" y="88" width="1016" height="724" rx="48" fill="#ffffff" fill-opacity="0.72" />
      <rect x="120" y="116" width="960" height="668" rx="34" fill="#ffffff" fill-opacity="0.84" />
      <rect x="152" y="148" width="356" height="520" rx="36" fill="${palette.primary}" fill-opacity="0.94" />
      <text x="330" y="430" text-anchor="middle" fill="#ffffff" font-size="118" font-family="Georgia, serif">${escapeXml(initials)}</text>
      <text x="566" y="290" fill="#2b2118" font-size="74" font-family="Georgia, serif">${title}</text>
      <text x="566" y="368" fill="${palette.primary}" font-size="34" font-family="Arial, sans-serif" letter-spacing="4">${service.toUpperCase()}</text>
      <rect x="566" y="430" width="360" height="16" rx="8" fill="#dcc7a1" />
      <rect x="566" y="474" width="298" height="14" rx="7" fill="#efe3cd" />
      <rect x="566" y="520" width="332" height="14" rx="7" fill="#efe3cd" />
      <rect x="566" y="566" width="252" height="14" rx="7" fill="#efe3cd" />
      <rect x="566" y="640" width="182" height="54" rx="27" fill="${palette.primary}" />
      <text x="657" y="675" text-anchor="middle" fill="#ffffff" font-size="24" font-family="Arial, sans-serif">BUSINESS PHOTO</text>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}
