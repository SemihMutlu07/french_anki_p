# FR TUTOR — Proje Planı v2
# Bu dosyayı repo'nun root'una koy: PROJECT_PLAN.md
# Claude Code bu dosyayı okuyarak projeyi anlayacak.

## Ürün Vizyonu

25 kişilik Boğaziçi FR101 sınıfı için mobil-öncelikli Fransızca öğrenme platformu.
Anki değil — hocanın derste işlediklerini pekiştiren, telaffuz ve dinleme odaklı bir araç.

## Temel Prensipler

1. **Motivasyon her şeyden önce.** İnsanlar tekrar girmek istemeli. Gamification değil, "ilerlediğimi görüyorum" hissi.
2. **Ses birinci sınıf vatandaş.** Sınıfın en büyük sorunu: duyunca anlayamamak + telaffuz. Audio her yerde olmalı.
3. **Mobil mükemmel çalışmalı.** %90 kullanıcı telefonda. Zoom/pinch bozmamalı, touch target'lar büyük, animasyonlar 60fps.
4. **Şişmemeli.** Lighthouse performance > 90. Bundle size minimum. Lazy loading.
5. **Duolingo'nun hatalarını yapma.** Gereksiz streak anxiety yok, ceza yok, "can" sistemi yok. Öğrenme pozitif olmalı.

## İki Ana Modül

### Modül 1: Kelime Öğrenme (Flashcards + FSRS)
- Mevcut FSRS sistemi üzerine inşa
- Kart göster → ses çal → biliyorum/bilmiyorum
- **Feminen/Maskülen göstergesi** her kartta belirgin (renk kodu: mavi=m, pembe/kırmızı=f)
- Progress: Eyfel Kulesi milestone (öğrenilen mature kart sayısı)

### Modül 2: Ders Pekiştirme (Hocanın İşledikleri)
- Cümle bazlı: "Hocan bunu sordu, sen ne cevap verirdin?"
- Soru-cevap kartları (Q: "Vous habitez quelle ville?" → A: "J'habite à Istanbul.")
- **Dinleme egzersizi:** Ses çalınır → kullanıcı doğru cümleyi seçer (4 seçenekli)
- **Telaffuz ipucu:** Her cümlede IPA + basitleştirilmiş Türkçe telaffuz
- Grammar highlight: tuzak kartları özel işaretli ("piège" tag'i)

### Mini Modüller (Sidebar/Quick Access)
- **Derste kurtaran cümleler:** "Je ne comprends pas", "Pouvez-vous répéter?" vb. — tek dokunuşla erişim
- **Sleeping beauty & sınıf inside joke'ları** — küçük easter egg'ler (motivasyon)

## Progress Sistemi

### Kelime Progress: Eyfel Kulesi
- 0-25 kart: temel (gri)
- 25-50: 1. kat (bronz)
- 50-100: 2. kat (gümüş)
- 100-150: tam kule (altın)
- Her milestone'da küçük animasyon (confetti değil, tatlı bir geçiş)

### Genel Progress: Fransa Haritası
- Her unit = bir şehir (Paris, Lyon, Marseille, Nice, Bordeaux, Strasbourg...)
- Unit tamamlandıkça şehir "açılır" (renkli olur)
- Harita renk paleti ile uyumlu, minimal, SVG tabanlı
- Dokunulduğunda şehir hakkında 1 cümle Fransızca fun fact

## Dinleme/Telaffuz Sistemi

### Dinleme Egzersizi
- Ses çalınır (TTS veya Forvo)
- 4 seçenek gösterilir (biri doğru, 3'ü confusable)
- Doğru seçince yeşil + doğru yazım gösterilir
- Yanlış seçince kırmızı + doğru ses tekrar çalınır

### Feminen/Maskülen Quiz
- Kelime gösterilir (article'sız): "maison"
- Kullanıcı seçer: le / la
- Doğru: "la maison" + kısa kural ipucu ("-ion ile bitenler genellikle feminen")

## Teknik Gereksinimler

### Auth
- Supabase magic link (email)
- 25 kullanıcı için yeterli (free tier)
- Session persistence (tekrar giriş gerektirmesin)

### Mobile/Responsive
- Mobile-first CSS (min-width breakpoint'ler)
- Touch target minimum 44x44px
- viewport meta: width=device-width, initial-scale=1, maximum-scale=1 (zoom bug'larını önler)
- Safe area insets (notch'lu telefonlar)
- No horizontal scroll EVER
- Test: iPhone SE (küçük), iPhone 15 (normal), iPad (tablet)

### PWA
- manifest.json + service worker
- Offline: son kullanılan curriculum JSON + audio cache
- Install prompt: ilk 3 ziyaretten sonra nazik hatırlatma
- Push notification: ileride (şimdilik yok)

### Performance
- Lighthouse > 90 (mobile)
- First Contentful Paint < 1.5s
- Bundle: lazy load heavy components (harita, animasyonlar)
- Image: next/image ile optimize, SVG tercih et
- Audio: preload="none", kullanıcı isteyince yükle

### Class Dashboard (Anonim)
- /class route'u
- Auth gerektirsin ama kimlik göstermesin
- Metrikler: toplam aktif kullanıcı (son 7 gün), en çok çalışılan unit, en zor kartlar (en çok "bilmiyorum"), sınıf ortalaması (mature kart %)
- Haftalık güncelleme yeterli

## Veritabanı (Supabase)

### Mevcut tablolar (kontrol et, yoksa oluştur)
- users (auth.users'dan)
- card_progress (user_id, card_id, fsrs_state, next_review, updated_at)

### Eklenecek tablolar
- listening_attempts (user_id, card_id, correct, timestamp)
- gender_quiz_attempts (user_id, card_id, correct, timestamp)
- unit_progress (user_id, unit_id, cards_total, cards_mature, updated_at)

## Dosya Yapısı (Hedef)

```
french_anki_p/
├── app/
│   ├── page.tsx                 # Landing / ana sayfa
│   ├── learn/
│   │   ├── page.tsx             # Flashcard session
│   │   └── [unit]/page.tsx      # Unit-specific session
│   ├── practice/
│   │   ├── page.tsx             # Ders pekiştirme hub
│   │   ├── listening/page.tsx   # Dinleme egzersizi
│   │   └── gender/page.tsx      # Feminen/maskülen quiz
│   ├── progress/
│   │   ├── page.tsx             # Eyfel + Harita
│   │   └── map/page.tsx         # Fransa haritası detay
│   ├── class/page.tsx           # Anonim sınıf dashboard
│   ├── phrases/page.tsx         # Derste kurtaran cümleler
│   └── auth/
│       ├── login/page.tsx
│       └── callback/page.tsx
├── components/
│   ├── FlashCard.tsx
│   ├── ListeningQuiz.tsx
│   ├── GenderQuiz.tsx
│   ├── EiffelProgress.tsx
│   ├── FranceMap.tsx
│   ├── AudioPlayer.tsx
│   ├── PhraseSheet.tsx          # Bottom sheet: kurtaran cümleler
│   └── ui/                      # Shared UI components
├── curriculum/
│   ├── 101/
│   │   ├── unit1.json ... unit12.json
│   │   └── sentences/           # Cümle bazlı kartlar (Modül 2)
│   │       ├── unit11_qa.json
│   │       └── unit12_qa.json
│   ├── courseGroups.ts
│   └── phrases.json             # Derste kurtaran cümleler
├── hooks/
│   ├── useFSRS.ts
│   ├── useAudio.ts
│   └── useProgress.ts
├── lib/
│   ├── supabase.ts
│   ├── fsrs.ts
│   └── audio.ts
├── public/
│   ├── manifest.json
│   ├── sw.js
│   └── icons/
├── PROJECT_PLAN.md              # Bu dosya
├── CLAUDE.md                    # Claude Code instructions
└── fr101.md                     # Ders notları referans
```

## Sprint Planı

### Sprint 1: Temel Düzeltme (1-2 gün)
- [ ] Auth fix (Supabase magic link çalışır hale)
- [ ] Mobile responsive audit + fix
- [ ] Mevcut flashcard flow'u mobile'da test et
- [ ] viewport meta + safe area + touch target düzeltmeleri

### Sprint 2: Ses + Dinleme (2-3 gün)
- [ ] AudioPlayer component (single ref, play rejection handling)
- [ ] Her flashcard'a ses butonu ekle
- [ ] Listening quiz sayfası (/practice/listening)
- [ ] Gender quiz sayfası (/practice/gender)

### Sprint 3: Modül 2 — Ders Pekiştirme (2 gün)
- [ ] Cümle kartları JSON schema + ilk veri (bu chat'ten)
- [ ] Soru-cevap practice sayfası
- [ ] Derste kurtaran cümleler sayfası (/phrases)

### Sprint 4: Progress + Harita (2-3 gün)
- [ ] Eyfel Kulesi SVG progress component
- [ ] Fransa haritası SVG component
- [ ] unit_progress hesaplama logic
- [ ] Milestone animasyonları

### Sprint 5: PWA + Dashboard (1-2 gün)
- [ ] manifest.json + service worker
- [ ] Offline fallback
- [ ] /class anonim dashboard
- [ ] Install prompt logic

### Sprint 6: Polish + Deploy (1-2 gün)
- [ ] Lighthouse audit
- [ ] 3 farklı cihazda test
- [ ] 25 kişiye dağıt
- [ ] Feedback topla