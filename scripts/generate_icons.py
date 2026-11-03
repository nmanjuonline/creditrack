import math
from PIL import Image, ImageDraw, ImageFilter

def create_icon(size=2048):
    # 1. Base image with high-depth Obsidian background
    img = Image.new("RGBA", (size, size), (8, 10, 15, 255))
    
    # Create radial gradient backdrop
    bg_gradient = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg_gradient)
    cx, cy = size // 2, size // 2
    max_r = size * 0.75
    
    # Concentric ambient glow in center
    for r in range(int(max_r), 0, -8):
        alpha = int(45 * (1.0 - (r / max_r) ** 1.5))
        # Subtle midnight indigo / gold warmth blend
        bg_draw.ellipse(
            [cx - r, cy - r, cx + r, cy + r],
            fill=(20, 26, 42, alpha)
        )
    img = Image.alpha_composite(img, bg_gradient)
    
    # 2. Card Dimensions in 2048 space
    # Target safe zone: within 675px radius circle from (1024, 1024)
    # Width 1080, Height 680 -> Aspect ratio ~1.588
    card_w = 1080
    card_h = 680
    x0 = cx - card_w // 2
    y0 = cy - card_h // 2
    x1 = x0 + card_w
    y1 = y0 + card_h
    corner_radius = 68
    
    # Ambient Gold Back-Glow (gives glowing Apple Wallet card presence)
    glow_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)
    glow_draw.rounded_rectangle(
        [x0 - 24, y0 - 16, x1 + 24, y1 + 32],
        radius=corner_radius + 20,
        fill=(245, 158, 11, 40)
    )
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(radius=40))
    img = Image.alpha_composite(img, glow_layer)
    
    # Card Drop Shadow (deep luxury elevation)
    shadow_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow_layer)
    shadow_draw.rounded_rectangle(
        [x0, y0 + 36, x1, y1 + 56],
        radius=corner_radius,
        fill=(0, 0, 0, 190)
    )
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(radius=28))
    img = Image.alpha_composite(img, shadow_layer)
    
    # 3. Card Surface (Metallic Champagne Gold brushed finish)
    card_surface = Image.new("RGBA", (card_w, card_h), (0, 0, 0, 0))
    
    # Generate diagonal luxury gold gradient
    # Color stops:
    # 0.0 -> #b45309 (deep amber)
    # 0.3 -> #d97706 (rich gold)
    # 0.55 -> #fbbf24 (radiant gold)
    # 0.75 -> #fef08a (champagne highlight)
    # 0.88 -> #f59e0b (warm amber)
    # 1.0 -> #92400e (burnished copper edge)
    stops = [
        (0.00, (180, 83, 9)),     # #b45309
        (0.25, (217, 119, 6)),    # #d97706
        (0.50, (245, 158, 11)),   # #f59e0b
        (0.68, (251, 191, 36)),   # #fbbf24
        (0.82, (254, 240, 138)),  # #fef08a specular
        (0.92, (245, 158, 11)),   # #f59e0b
        (1.00, (146, 64, 14)),    # #92400e
    ]
    
    def get_color(t):
        if t <= stops[0][0]:
            return stops[0][1]
        if t >= stops[-1][0]:
            return stops[-1][1]
        for i in range(len(stops) - 1):
            t1, c1 = stops[i]
            t2, c2 = stops[i + 1]
            if t1 <= t <= t2:
                ratio = (t - t1) / (t2 - t1)
                return (
                    int(c1[0] + (c2[0] - c1[0]) * ratio),
                    int(c1[1] + (c2[1] - c1[1]) * ratio),
                    int(c1[2] + (c2[2] - c1[2]) * ratio),
                )
        return stops[-1][1]
    
    # Render diagonal gradient into card_surface
    diag_max = card_w + card_h
    raw_gradient = Image.new("RGB", (card_w, card_h))
    grad_draw = ImageDraw.Draw(raw_gradient)
    
    for y in range(card_h):
        for x in range(card_w):
            # Diagonal light vector at 38 degrees
            pos = (x * 0.75 + y * 0.65) / (card_w * 0.75 + card_h * 0.65)
            # Add subtle metallic specular beam
            specular = math.exp(-((pos - 0.72) ** 2) / 0.015) * 0.22
            col = get_color(pos)
            final_r = min(255, int(col[0] + 255 * specular))
            final_g = min(255, int(col[1] + 255 * specular))
            final_b = min(255, int(col[2] + 255 * specular))
            raw_gradient.putpixel((x, y), (final_r, final_g, final_b))
            
    # Apply rounded rectangle mask to card surface
    mask = Image.new("L", (card_w, card_h), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, card_w, card_h], radius=corner_radius, fill=255)
    
    card_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    card_layer.paste(raw_gradient, (x0, y0), mask)
    
    # 4. Card Micro-Details:
    details = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d_draw = ImageDraw.Draw(details)
    
    # 4a. Rim border (1.5px crisp metallic highlight)
    d_draw.rounded_rectangle(
        [x0, y0, x1, y1],
        radius=corner_radius,
        outline=(255, 255, 255, 90),
        width=3
    )
    
    # 4b. EMV Chip (standard Apple luxury brass design)
    chip_w = 176
    chip_h = 138
    chip_x = x0 + 110
    chip_y = y0 + 170
    chip_rad = 22
    
    # Chip base shadow
    d_draw.rounded_rectangle(
        [chip_x - 3, chip_y - 2, chip_x + chip_w + 3, chip_y + chip_h + 3],
        radius=chip_rad + 2,
        fill=(0, 0, 0, 70)
    )
    # Chip body
    d_draw.rounded_rectangle(
        [chip_x, chip_y, chip_x + chip_w, chip_y + chip_h],
        radius=chip_rad,
        fill=(220, 160, 40, 240),
        outline=(255, 235, 170, 160),
        width=3
    )
    
    # Chip circuitry contacts (Apple Pay EMV styling)
    circuit_col = (130, 85, 15, 210)
    # Center horizontal divider
    mid_y = chip_y + chip_h // 2
    d_draw.line([(chip_x + 16, mid_y), (chip_x + chip_w - 16, mid_y)], fill=circuit_col, width=3)
    # Left vertical split
    d_draw.line([(chip_x + 55, chip_y + 16), (chip_x + 55, chip_y + chip_h - 16)], fill=circuit_col, width=3)
    # Right vertical split
    d_draw.line([(chip_x + chip_w - 55, chip_y + 16), (chip_x + chip_w - 55, chip_y + chip_h - 16)], fill=circuit_col, width=3)
    # Center pad rounded rect
    d_draw.rounded_rectangle(
        [chip_x + 68, chip_y + 36, chip_x + chip_w - 68, chip_y + chip_h - 36],
        radius=10,
        outline=circuit_col,
        width=3
    )
    
    # 4c. Contactless NFC Symbol (Next to chip)
    nfc_cx = chip_x + chip_w + 70
    nfc_cy = chip_y + chip_h // 2
    nfc_col = (115, 65, 10, 190)
    
    for arc_r in [26, 44, 62, 80]:
        # Draw curved arc (from -45 to 45 degrees)
        bbox = [nfc_cx - arc_r, nfc_cy - arc_r, nfc_cx + arc_r, nfc_cy + arc_r]
        d_draw.arc(bbox, start=-40, end=40, fill=nfc_col, width=6)
        
    # 4d. CrediTrack Luxury Emblem (Top Right)
    # Stylized minimalist interlocking rings / diamond crest
    crest_x = x1 - 130
    crest_y = y0 + 130
    crest_col = (110, 60, 5, 180)
    # Outer ring
    d_draw.ellipse([crest_x - 36, crest_y - 36, crest_x + 36, crest_y + 36], outline=crest_col, width=5)
    # Intersecting pill ring
    d_draw.ellipse([crest_x - 62, crest_y - 36, crest_x + 10, crest_y + 36], outline=crest_col, width=5)
    
    # 4e. Embossed Card Dots (Micro dots representing card number)
    dots_y = y0 + 440
    dot_col = (110, 60, 5, 175)
    
    for group in range(4):
        gx = x0 + 115 + group * 225
        for dot in range(4):
            dx = gx + dot * 32
            d_draw.ellipse([dx - 5, dots_y - 5, dx + 5, dots_y + 5], fill=dot_col)
            
    # 4f. Cardholder & Expiry subtle labels
    label_y = y0 + 560
    # Floating track line
    d_draw.rounded_rectangle([x0 + 115, label_y, x0 + 360, label_y + 14], radius=7, fill=(110, 60, 5, 140))
    d_draw.rounded_rectangle([x1 - 250, label_y, x1 - 120, label_y + 14], radius=7, fill=(110, 60, 5, 140))
    
    # Composite all layers
    img = Image.alpha_composite(img, card_layer)
    img = Image.alpha_composite(img, details)
    
    # 5. Subtle Top-Rim Glass Specular on entire App Icon
    glass_rim = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    rim_draw = ImageDraw.Draw(glass_rim)
    # Outer squircle border for platforms that use standard full-bleed
    rim_draw.rounded_rectangle(
        [1, 1, size - 2, size - 2],
        radius=size // 4,
        outline=(255, 255, 255, 20),
        width=4
    )
    img = Image.alpha_composite(img, glass_rim)
    
    return img

def main():
    print("Generating Master 2048x2048 CrediTrack Apple-Grade Icon...")
    master = create_icon(2048)
    
    # Export 512x512 PWA & Android Maskable icon
    print("Exporting public/pwa-512x512.png...")
    icon_512 = master.resize((512, 512), Image.Resampling.LANCZOS)
    icon_512.save("public/pwa-512x512.png", "PNG", optimize=True)
    
    # Export 192x192 Android icon
    print("Exporting public/pwa-192x192.png...")
    icon_192 = master.resize((192, 192), Image.Resampling.LANCZOS)
    icon_192.save("public/pwa-192x192.png", "PNG", optimize=True)
    
    # Export 180x180 iOS Apple Touch Icon
    print("Exporting public/apple-touch-icon.png...")
    icon_180 = master.resize((180, 180), Image.Resampling.LANCZOS)
    icon_180.save("public/apple-touch-icon.png", "PNG", optimize=True)
    
    print("All icons successfully generated!")

if __name__ == "__main__":
    main()

