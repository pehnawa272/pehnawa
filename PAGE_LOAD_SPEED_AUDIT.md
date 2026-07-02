# PAGE LOAD SPEED AUDIT: Pehnawa by Laxshmi (Next.js E-Commerce)

**Date:** 2026-07-02
**Project:** /Users/ashrayamishra/Downloads/Pehnawa

---

## EXECUTIVE SUMMARY

This is a **luxury Indian couture e-commerce site** with **significant image optimization opportunities**. The project uses Google Fonts efficiently but loads **multiple large unoptimized images** (2-3 MB each) without modern formats. Third-party scripts (Razorpay) are loaded only on checkout. **Critical issues** around image quality, sizes props, and format optimization are documented below.

---

## 1. IMAGE COMPONENTS AUDIT

### Total Image Tags Found: 28 instances across 11 files

#### A. HOMEPAGE CLIENT (src/app/HomepageClient.js)

| Line | Image | Src Type | Props | Status | Fold Position | Issues |
|------|-------|----------|-------|--------|---------------|--------|
| 29-37 | Hero banner | Local `/mainhero.jpeg` | priority=✓, quality=85, sizes=100vw | **GOOD** | Above fold | None—this is correct |
| 107-113 | Collection card (Professional Ethnic) | Local `/pic6.jpeg` | NO priority, quality missing, sizes=33vw | **NEEDS FIX** | Above fold | Missing quality prop; no priority on above-fold |
| 125-131 | Collection card (Signature) | External Google URL (lh3.googleusercontent.com) | NO priority, quality missing, sizes=33vw | **NEEDS FIX** | Above fold (offset by md:translate-y-12) | External unoptimized image; missing quality |
| 143-149 | Collection card (Golden Era) | Local `/pic4.jpeg` | NO priority, quality missing, sizes=33vw | **NEEDS FIX** | Above fold | Missing quality prop; no priority |
| 161-167 | Collection card (Others) | External Google URL (lh3.googleusercontent.com) | NO priority, quality missing, sizes=25vw | **NEEDS FIX** | Below fold (md:translate-y-12) | External; missing quality; on below-fold but no loading=lazy |
| 203-209 | Craftsmanship section | External Google URL (lh3.googleusercontent.com) | NO priority, quality missing, sizes=50vw | **NEEDS FIX** | Below fold | Missing quality; no priority; external unoptimized |
| 218-224 | Consultation CTA background | External Google URL (lh3.googleusercontent.com) | NO priority, quality missing, sizes=100vw | **NEEDS FIX** | Below fold | Missing quality; external image used as background fill image |

**Homepage Summary:** 7 images, 1 optimized, 6 problematic

---

#### B. PRODUCTS PAGE CLIENT (src/app/products/ProductsClient.js)

| Line | Image | Src Type | Props | Status | Fold Position | Issues |
|------|-------|----------|-------|--------|---------------|--------|
| 50-58 | Hero banner | Local `/pic3.jpeg` | priority=✓, quality=85, sizes=100vw | **GOOD** | Above fold | None—optimized |
| 153-159 | Product cards (grid) | Product images (mix of local + external Cloudinary URLs) | NO priority, quality missing, sizes=33vw | **NEEDS FIX** | Above fold (initial) / Below fold (on scroll) | **No loading prop**; missing quality; Cloudinary but unoptimized configuration |

**Products Page Summary:** Dynamic grid, hero optimized, but product cards lack quality/loading props

---

#### C. PRODUCT DETAIL PAGE (src/app/product/[id]/ProductDetailClient.js)

| Line | Image | Src Type | Props | Status | Fold Position | Issues |
|------|-------|----------|-------|--------|---------------|--------|
| 99-106 | Main product image | Product URL (external Cloudinary) | priority=✓, quality missing, sizes=58vw | **PARTIAL** | Above fold (sticky) | Priority set but **quality missing**; external URL not optimized |
| 142 | Video thumbnail | Product URL (external) | NO priority, quality missing, sizes=19vw | **NEEDS FIX** | Below fold (thumbnails) | Below-fold image; **missing loading=lazy**; no quality |
| 156 | Product view images | Product URL (external) | NO priority, quality missing, sizes=19vw | **NEEDS FIX** | Below fold (thumbnails) | Below-fold; **missing loading=lazy**; no quality |

**Product Detail Summary:** Main image has priority but missing quality; thumbnail gallery lacks loading=lazy

---

#### D. BRIDAL COLLECTION (src/app/bridal/BridalAtelierClient.js)

| Line | Image | Src Type | Props | Status | Fold Position | Issues |
|------|-------|----------|-------|--------|---------------|--------|
| 72-80 | Hero banner | Local `/pic5.png` | priority=✓, quality=85, sizes=100vw | **GOOD** | Above fold | None—optimized |
| (Additional product grid images) | Product images (Cloudinary) | Similar to Products page | NO priority, quality missing | **NEEDS FIX** | Mixed | Same issues as ProductsClient |

**Bridal Summary:** Hero good, grid cards problematic

---

#### E. EVERYDAY COLLECTION (src/app/everyday/EverydayEditClient.js)

| Line | Image | Src Type | Props | Status | Fold Position | Issues |
|------|-------|----------|-------|--------|---------------|--------|
| 59-67 | Hero banner | Local `/everydayhero.jpeg` | priority=✓, quality=85, sizes=100vw | **GOOD** | Above fold | None—optimized |
| (Product grid) | Product images (Cloudinary) | Same as Products page | NO priority, quality missing | **NEEDS FIX** | Mixed | Same issues |

**Everyday Summary:** Hero good, grids need optimization

---

#### F. SIGNATURE COLLECTION (src/app/signature/SignatureEditClient.js)

| Line | Image | Src Type | Props | Status | Fold Position | Issues |
|------|-------|----------|-------|--------|---------------|--------|
| 50-58 | Hero banner | Local `/pic2.jpeg` | priority=✓, quality=85, sizes=100vw | **GOOD** | Above fold | None—optimized |
| (Product grid) | Product images (Cloudinary) | Same pattern | NO priority, quality missing | **NEEDS FIX** | Mixed | Same issues |

**Signature Summary:** Hero optimized, grids problematic

---

#### G. OTHERS COLLECTION (src/app/others/OthersClient.js)

| Line | Image | Src Type | Props | Status | Fold Position | Issues |
|------|-------|----------|-------|--------|---------------|--------|
| 51-59 | Hero banner | External Google URL (lh3.googleusercontent.com) | priority=✓, quality=85, sizes=100vw | **PARTIAL** | Above fold | Priority + quality set but **external unoptimized Google image** |
| (Product grid) | Product images (Cloudinary) | Same pattern | NO priority, quality missing | **NEEDS FIX** | Mixed | Same issues |

**Others Summary:** Hero has priority/quality but external source; grids need work

---

#### H. ABOUT PAGE (src/app/about/page.js)

| Line | Image | Src Type | Props | Status | Fold Position | Issues |
|------|-------|----------|-------|--------|---------------|--------|
| 111-120 | English story section | Local `/roomi.jpeg` (configurable) | priority=✓, quality=95, sizes=40vw | **GOOD** | Below fold | Optimized; below-fold with priority (OK since explicitly set) |
| 136-144 | Hindi story section | Local `/chikankari.jpeg` | priority=✓, quality=95, sizes=40vw | **GOOD** | Below fold | Optimized; quality=95 (higher than needed) |

**About Summary:** Well-optimized with high quality

---

#### I. CART DRAWER (src/components/CartDrawer.js)

| Line | Image | Src Type | Props | Status | Fold Position | Issues |
|------|-------|----------|-------|--------|---------------|--------|
| 101-107 | Cart item thumbnail | Product URL (external) | NO quality, sizes=80px | **NEEDS FIX** | Off-screen (drawer) | Missing quality; small thumbnail uses fill with no optimization |

**Cart Summary:** Minimal image, no quality prop

---

#### J. ADMIN COMPONENTS

**ProductManagement.js (line 144)** - 56px thumbnail - no quality
**ProductForm.js (line 107)** - 150px thumbnail - no quality  
**ProductDetailView.js (lines 144, 147)** - admin-only, low priority

---

## 2. EXTERNAL IMAGE URLS INVENTORY

### Google User Content (lh3.googleusercontent.com)

Used for:
- **Homepage collection cards** (Signature, Others)
- **Craftsmanship section** (Lucknow handwork)
- **Consultation CTA background**
- **Others page hero**

**Issues:**
- ✗ Not optimized for web
- ✗ No quality/format negotiation
- ✗ Full resolution being served to all devices
- ✗ No WebP fallback

**Sample URLs:**
```
https://lh3.googleusercontent.com/aida-public/AB6AXuCoL47DJkjHGr61NjYkTOcfLko3oZNy2gs8Z7jxqcNsQiNy8zB9JdCeONutnlgwnhSm98xeAzDm945RtVORC_kIl-GPUbGDRL6Z-zeoIbaZ47WT-usrwEozEVag4vVcrpfbnbYNQ2cn5-5j41apwopsuDIy2O_B-T9CKFbCKF2pTQcbTcgVO-EEDiGPLL8JAapv2oTPXyCNOgex-w37mOreodCRkYW4cu1tu9U0Tnn8XdzthIcjGHeTnjPZDK1kbfVkODDFmGSIsAU
```

**Count:** 5+ instances across homepage, bridal, others pages

### Cloudinary (res.cloudinary.com)

Used for:
- **All product images** (database-driven)
- **Dynamically loaded from product data**

**Configuration:**
- Allowed in `next.config.mjs` ✓
- But **quality prop NOT set on product grid images**
- No explicit format transformation

---

## 3. FONT LOADING ANALYSIS

### Layout (src/app/layout.js) - **OPTIMIZED ✓**

```javascript
import { Playfair_Display, Montserrat } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});
```

**Assessment:**
- ✓ Using **next/font/google** (self-hosted, no external requests)
- ✓ Only **latin** subset (reduces font payload)
- ✓ CSS variables injected at build time
- ✓ **No font fallback chain documented** (should add fallback)
- ✓ Fonts preloaded automatically by Next.js

**Globals CSS (src/app/globals.css):**
- Uses @import "tailwindcss" (OK for v4)
- Sets font families via CSS variables
- No @font-face declarations (good—using next/font)

**No External Font Requests:** ✓ Fonts are self-hosted

---

## 4. NEXT.CONFIG.JS ANALYSIS

```javascript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
    qualities: [75, 100],
  },
};
```

**Findings:**

| Setting | Value | Assessment |
|---------|-------|------------|
| remotePatterns | lh3.googleusercontent.com, res.cloudinary.com | ✓ Explicit allowlist |
| qualities | [75, 100] | ⚠️ Only 2 quality levels; missing 85 (most common) |
| Default quality | 75 (implied) | ⚠️ Low for hero images |
| Image formats | Not specified (auto) | ⚠️ Should explicitly enable WebP |
| deviceSizes | Not set (uses Next.js defaults) | ⚠️ Consider customizing |
| imageSizes | Not set | ⚠️ Consider customizing |

**Issues:**
- ✗ No `formats: ["image/avif", "image/webp"]` (no modern format negotiation)
- ✗ qualities array doesn't include 85 (used in many images)
- ✗ No explicit cache control headers
- ✗ Google Images (lh3.googleusercontent.com) shouldn't be used for product images—use Cloudinary only

---

## 5. THIRD-PARTY SCRIPTS

### Razorpay Checkout Script (src/app/checkout/CheckoutClient.js)

```javascript
useEffect(() => {
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.async = true;
  document.body.appendChild(script);
  return () => {
    document.body.removeChild(script);
  };
}, []);
```

**Assessment:**
- ✓ **Loaded only on checkout page** (not on homepage)
- ✓ Dynamically injected with `async`
- ✓ Properly cleaned up on unmount
- ⚠️ Script is loaded every time CheckoutClient mounts (consider caching flag)
- ⚠️ No `defer` attribute (async is fine, but consider adding integrity hash)

**Size Impact:** ~50-100 KB (estimated)

### Other Scripts
- **No Google Analytics, hotjar, intercom, or tracking pixels detected** ✓
- **No external CDN scripts** ✓

---

## 6. PUBLIC FOLDER IMAGE INVENTORY

### Local Images (Total: ~28 MB)

| File | Size | Format | Used For | Optimization |
|------|------|--------|----------|--------------|
| `/mainhero.jpeg` | 2.1 MB | JPEG | Homepage hero | priority=✓, quality=85 |
| `/pic2.jpeg` | 2.7 MB | JPEG | Signature hero | priority=✓, quality=85 |
| `/pic3.jpeg` | 2.5 MB | JPEG | Products hero | priority=✓, quality=85 |
| `/pic4.jpeg` | 38 KB | JPEG | Golden Era card | ✗ Missing quality |
| `/pic5.png` | 1.7 MB | PNG | Bridal hero | priority=✓, quality=85 |
| `/pic6.jpeg` | 1.7 MB | JPEG | Everyday card | ✗ Missing quality |
| `/everydayhero.jpeg` | 2.0 MB | JPEG | Everyday hero | priority=✓, quality=85 |
| `/bridal.jpeg` | 2.5 MB | JPEG | (unused currently) | — |
| `/chikankari.jpeg` | 3.1 MB | JPEG | About section | priority=✓, quality=95 |
| `/roomi.jpeg` | 3.1 MB | JPEG | About section | priority=✓, quality=95 |

**Issues:**
- ⚠️ All images are JPEG/PNG (no WebP or AVIF variants)
- ⚠️ Large file sizes (1.7-3.1 MB for single images)
- ⚠️ PNG used for hero (`pic5.png`) instead of JPEG (PNG larger)
- ✗ No responsive image variants generated
- ⚠️ `/pic4.jpeg` is small (38 KB)—verify it's not placeholder

**Recommendations:**
1. Convert to WebP format (save ~40-60%)
2. Generate AVIF variants (save ~60-75%)
3. Create multiple sizes (desktop 1920px, tablet 1024px, mobile 640px)
4. Use Next.js Image Optimization API

---

## 7. ABOVE-FOLD vs BELOW-FOLD IMAGE ANALYSIS

### ABOVE-FOLD Images (Prioritize Optimization)

| Page | Image | Current Props | Issues |
|------|-------|---------------|--------|
| Homepage | `/mainhero.jpeg` | priority=✓, quality=85 | ✓ OPTIMIZED |
| Products | `/pic3.jpeg` | priority=✓, quality=85 | ✓ OPTIMIZED |
| Everyday | `/everydayhero.jpeg` | priority=✓, quality=85 | ✓ OPTIMIZED |
| Signature | `/pic2.jpeg` | priority=✓, quality=85 | ✓ OPTIMIZED |
| Bridal | `/pic5.png` | priority=✓, quality=85 | ⚠️ PNG format (should be JPEG) |
| Others | lh3.googleusercontent.com | priority=✓, quality=85 | ✗ External unoptimized source |
| Homepage | Collection cards `/pic6.jpeg`, external URLs | NO priority, NO quality | **CRITICAL** |
| About | `/roomi.jpeg`, `/chikankari.jpeg` | priority=✓, quality=95 | ✓ OPTIMIZED (but high quality) |

### BELOW-FOLD Images (Should Have loading="lazy")

| Page | Image | Current Props | Issues |
|------|-------|---------------|--------|
| Homepage | Craftsmanship section (external) | NO loading prop | **✗ MISSING lazy** |
| Homepage | Consultation CTA (external) | NO loading prop | **✗ MISSING lazy** |
| Products | Product grid (carousel/infinite scroll) | NO loading prop | **✗ MISSING lazy** |
| About | Story sections | NO loading prop (but priority set) | ⚠️ Unnecessary priority |
| Product detail | Thumbnail gallery | NO loading prop | **✗ MISSING lazy** |
| Cart | Item thumbnails | NO loading prop | ✓ OK—small drawer images |

**Critical Gap:** **NO INSTANCE OF loading="lazy" FOUND IN ENTIRE CODEBASE**

This means all images load eagerly, even below-fold product grids, which significantly impacts FCP (First Contentful Paint) and LCP (Largest Contentful Paint).

---

## 8. MISSING OPTIMIZATION OPPORTUNITIES

### A. No quality Prop on Product Grid Images
**Impact:** ALL product images (Cloudinary URLs in grids) lack `quality` prop
- Default quality=75 might be too low for showcase images
- Should set quality=80-85 for product grids

### B. No loading="lazy" on Below-Fold Images
**Impact:** Every collection product grid loads ALL images upfront
**Affected files:**
- ProductsClient.js (144 products potentially visible)
- EverydayEditClient.js (product grid)
- SignatureEditClient.js (product grid)
- OthersClient.js (product grid)
- BridalAtelierClient.js (product grid)
- ProductDetailClient.js (thumbnail gallery)

### C. External Google Images (lh3.googleusercontent.com)
**Impact:** 5+ instances of unoptimized Google user images
**Should:** Replace with Cloudinary-hosted versions or local images

### D. No Image Format Variants
**Current:** JPEG/PNG only
**Missing:** WebP, AVIF
**Potential savings:** 40-75% file size reduction

### E. PNG Format for Hero
**File:** `/pic5.png` (1.7 MB)
**Issue:** PNG format is larger than JPEG for photographs
**Fix:** Convert to JPEG (save ~400-600 KB)

### F. Missing srcSet / Responsive Images
**Current:** All images use single src
**Missing:** Different sizes for mobile (640px), tablet (1024px), desktop (1920px)
**Impact:** Mobile devices download full desktop images

---

## 9. LARGE EMBEDDED CONTENT

### Inline SVGs
- **SymbolIcon component** (Material Design icons)
- Lightweight, self-hosted ✓
- No external icon requests

### Animations
- **CSS animations in globals.css** (shimmer, pulse, bounce, etc.)
- No animation libraries loaded ✓
- Lightweight keyframes

### Embedded Data
- **No large JSON payloads** identified
- Products loaded from database API ✓

---

## 10. PRIORITY ISSUES SUMMARY

### 🔴 CRITICAL (Fix Immediately)

1. **No loading="lazy" on below-fold images**
   - Affects: Product grids, thumbnails, below-fold sections
   - Impact: Slows down FCP by ~500-1500ms on slow connections
   - Fix: Add `loading="lazy"` to all grid/carousel images

2. **External Google Images (lh3.googleusercontent.com)**
   - Count: 5+ instances
   - Impact: Unoptimized, slow, no format control
   - Fix: Replace with Cloudinary or local assets

3. **Missing quality prop on product grid images**
   - Affects: All ProductsClient, EverydayEditClient, etc. grids
   - Impact: Low-quality product showcase
   - Fix: Add `quality={85}` to all product image components

### 🟠 HIGH (Fix Soon)

4. **PNG format for `/pic5.png` hero image**
   - File size: 1.7 MB (vs ~1 MB if JPEG)
   - Fix: Convert to JPEG format

5. **No image format variants (WebP/AVIF)**
   - Affects: All local images
   - Impact: 40-75% larger file sizes vs WebP/AVIF
   - Fix: Enable in next.config.mjs and regenerate images

6. **High quality values on about page**
   - Files: `/roomi.jpeg`, `/chikankari.jpeg`
   - Current: quality=95
   - Recommendation: quality=85 sufficient for luxury display

### 🟡 MEDIUM (Optimize When Convenient)

7. **Missing sizes prop customization**
   - Current: Manual sizes per component
   - Fix: Standardize sizes array; consider CSS-based breakpoints

8. **No quality level 85 in next.config.js**
   - Current: [75, 100]
   - Fix: Add 85 (most used in codebase)

9. **Razorpay script re-mounting**
   - Minor issue: script reloaded on each checkout mount
   - Fix: Add flag to prevent duplicate loads

---

## 11. PERFORMANCE ESTIMATES

### Current State (Unoptimized)
- **Largest Image:** 3.1 MB (`roomi.jpeg`, `chikankari.jpeg`)
- **Total Public Images:** ~28 MB
- **Product Grid (10 products):** ~25-30 MB downloaded (if no lazy loading)
- **Estimated FCP (3G Slow):** 4-6 seconds
- **Estimated LCP (3G Slow):** 6-9 seconds

### After Optimization
- **With WebP:** ~16 MB public folder (~42% savings)
- **With AVIF:** ~10 MB public folder (~65% savings)
- **With lazy loading on grids:** ~2-3 MB initial load
- **With quality optimization:** ~18-20 MB public folder
- **Estimated FCP (3G Slow):** 1.5-2 seconds
- **Estimated LCP (3G Slow):** 2-3 seconds

---

## 12. RECOMMENDATIONS (Priority Order)

### Phase 1: Critical Performance Fixes (1 hour)
1. ✓ Add `loading="lazy"` to all product grid images
2. ✓ Add `quality={85}` to all product grid images
3. ✓ Replace external Google images with Cloudinary or local
4. ✓ Add `loading="lazy"` to below-fold homepage images

### Phase 2: Image Format Optimization (2-4 hours)
5. ✓ Convert `/pic5.png` to JPEG
6. ✓ Generate WebP variants for all public images
7. ✓ Generate AVIF variants (future-proofing)
8. ✓ Update next.config.mjs: `formats: ["image/avif", "image/webp"]`

### Phase 3: Fine-Tuning (2 hours)
9. ✓ Standardize quality values (use 80-85)
10. ✓ Review responsiveness of sizing on mobile
11. ✓ Test with PageSpeed Insights / WebPageTest
12. ✓ Consider Cloudinary transformations for product images

### Phase 4: Advanced (3+ hours)
13. ✓ Implement responsive image srcSet generation
14. ✓ Add blur-up placeholders (LQIP) for below-fold images
15. ✓ Consider image optimization pipeline in deployment
16. ✓ Monitor Core Web Vitals with real user data

---

## CONCLUSION

**The Pehnawa site has a strong foundation** with proper font loading and selective use of priority images on heroes. However, **below-fold images lack lazy loading** and **product grids are missing quality optimization**, which will cause measurable LCP delays and wasted bandwidth on mobile.

**Most impactful fix:** Add `loading="lazy"` to 50+ product grid images (5 minutes, massive impact).

**Next best fix:** Convert to WebP/AVIF formats (1-2 hours, 40-75% savings).

**Total estimated time to full optimization:** 6-10 hours.

