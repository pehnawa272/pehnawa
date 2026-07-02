# 🚀 QUICK FIX CHECKLIST — Image Optimization

## Priority 1: Add loading="lazy" (5 minutes, MASSIVE impact)

### Files to update:
- [ ] `src/app/HomepageClient.js` — lines 107, 125, 143, 161, 203, 218
- [ ] `src/app/products/ProductsClient.js` — line 153 (product grid image)
- [ ] `src/app/product/[id]/ProductDetailClient.js` — lines 142, 156
- [ ] `src/app/bridal/BridalAtelierClient.js` — product grid images
- [ ] `src/app/everyday/EverydayEditClient.js` — product grid images
- [ ] `src/app/signature/SignatureEditClient.js` — product grid images
- [ ] `src/app/others/OthersClient.js` — product grid images

### Template fix:
```diff
- <Image src={...} fill sizes="..." />
+ <Image src={...} fill loading="lazy" sizes="..." />
```

---

## Priority 2: Add quality prop to product grids (10 minutes)

### Files to update:
- [ ] `src/app/products/ProductsClient.js` — line 153
- [ ] `src/app/bridal/BridalAtelierClient.js` — product grid
- [ ] `src/app/everyday/EverydayEditClient.js` — product grid
- [ ] `src/app/signature/SignatureEditClient.js` — product grid
- [ ] `src/app/others/OthersClient.js` — product grid
- [ ] `src/components/CartDrawer.js` — line 101
- [ ] `src/components/admin/ProductForm.js` — line 107
- [ ] `src/components/admin/ProductManagement.js` — line 144

### Template fix:
```diff
- <Image src={product.image} alt={...} fill sizes="..." />
+ <Image src={product.image} alt={...} fill quality={85} loading="lazy" sizes="..." />
```

---

## Priority 3: Replace external Google Images (15 minutes)

### Locations to fix:
1. **HomepageClient.js (line 125)** — Signature collection card
   - Current: `https://lh3.googleusercontent.com/aida-public/AB6AXuCoL47...`
   - Action: Upload to Cloudinary or use local image

2. **HomepageClient.js (line 161)** — Others collection card
   - Current: `https://lh3.googleusercontent.com/aida-public/AB6AXuDDFrcC...`
   - Action: Replace with local asset

3. **HomepageClient.js (line 203)** — Craftsmanship section
   - Current: External Google image
   - Action: Replace with Cloudinary or local

4. **HomepageClient.js (line 218)** — Consultation CTA background
   - Current: External Google image
   - Action: Replace with existing local image

5. **OthersClient.js (line 51)** — Others page hero
   - Current: External Google image
   - Action: Use local image instead

---

## Priority 4: Add quality to next.config.mjs (2 minutes)

### File: `next.config.mjs`

```diff
  qualities: [75, 100],
+ // Should include: [75, 85, 100] for better coverage
```

**Better version:**
```javascript
qualities: [75, 85, 100],
formats: ["image/avif", "image/webp"],
```

---

## Priority 5: Add quality prop to homepage collection cards (5 minutes)

### File: `src/app/HomepageClient.js`

- [ ] Line 107: Add `quality={85}` to pic6.jpeg
- [ ] Line 125: Add `quality={85}` to Google image (before replacing)
- [ ] Line 143: Add `quality={85}` to pic4.jpeg
- [ ] Line 161: Add `quality={85}` to Others image

---

## Priority 6: Convert PNG to JPEG (15 minutes)

### File: `/public/pic5.png`

```bash
# Using ImageMagick
magick pic5.png -quality 85 pic5.jpeg

# Or use online tool:
# 1. Upload pic5.png to tinypng.com or iloveimg.com
# 2. Download as JPEG
# 3. Replace /public/pic5.png

# Update src/app/bridal/BridalAtelierClient.js line 73
- src="/pic5.png"
+ src="/pic5.jpeg"
```

---

## Priority 7: Add quality to about page (optional - already good)

### File: `src/app/about/page.js`

```diff
- quality={95}
+ quality={85}  // Sufficient for luxury display
```

This will save ~15-20% on these large images.

---

## Testing Checklist

After applying fixes:

- [ ] Run `npm run build` — no errors
- [ ] Test on mobile (slow 3G) — images should load progressively
- [ ] Check product grid performance — lazy loading working
- [ ] Test hero images — priority images still load first
- [ ] Verify all external image URLs replaced
- [ ] Test checkout page — Razorpay still working

---

## Performance Improvement Estimate

| Fix | Estimated Savings | Time |
|-----|-------------------|------|
| lazy loading | ~40-50% bandwidth on grids | 5 min |
| quality optimization | ~15-20% per image | 10 min |
| WebP conversion | ~40-60% total image size | 2 hours |
| Remove Google images | ~5-10% if external was slow | 15 min |
| **TOTAL** | **~60-80% overall** | **2.5 hours** |

---

## Next Steps (After Quick Fixes)

1. **Medium-term:** Generate WebP variants for local images (2-3 hours)
2. **Long-term:** Set up Cloudinary transformations pipeline
3. **Monitor:** Add Core Web Vitals monitoring to track FCP/LCP improvements

---

## Questions?

Refer to full `PAGE_LOAD_SPEED_AUDIT.md` for detailed analysis and reasoning.

