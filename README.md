# FR Tutor

Fransızca kelime öğrenmek için kart tabanlı tekrar uygulaması. Next.js 14 App Router, Supabase auth ve spaced repetition algoritması ile çalışır.

## Özellikler

- 10 ünite, 150+ kelime kartı
- Kartı çevirme mekaniği (Space / tıkla)
- Klavye kısayolları: Space = çevir, 1 = bilmiyorum, 2 = biliyorum
- Mobil swipe desteği
- Spaced repetition kuyruğu (mastery threshold: 2)
- Supabase magic link ile kimlik doğrulama
- İlerleme Supabase'e ve localStorage'a kaydedilir

## Kurulum

```bash
npm install
```

`.env.local` dosyası oluştur:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Supabase dashboard → SQL Editor'da çalıştır:

```sql
create table if not exists progress (
  id             uuid default gen_random_uuid() primary key,
  user_id        uuid not null references auth.users(id) on delete cascade,
  card_id        text not null,
  course         text not null,
  unit           int  not null,
  known          boolean not null,
  review_count   int  not null default 1,
  next_review_at timestamptz not null,
  last_seen_at   timestamptz not null,
  unique (user_id, card_id)
);

alter table progress enable row level security;

create policy "Users can manage own progress"
  on progress for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

Supabase dashboard → Authentication → URL Configuration → Redirect URLs'e ekle:

```
http://localhost:3000/auth/callback
```

## Geliştirme

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) adresini aç.

## Proje Yapısı

```
app/
  page.tsx              # Ana sayfa — ünite listesi
  login/page.tsx        # Magic link giriş sayfası
  auth/callback/        # Supabase auth callback
  lesson/[id]/page.tsx  # Server component — ünite yükler
components/
  LessonClient.tsx      # Client — oturum mantığı, klavye, swipe
  LessonCard.tsx        # Kart görünümü (çevrilmez/çevrilmiş)
lib/
  types.ts              # CardItem arayüzü
  curriculum.ts         # Server-side JSON yükleyici
  supabase.ts           # Browser client
  supabase-server.ts    # Server client
  progress.ts           # Supabase progress okuma/yazma
middleware.ts           # /lesson/* rotalarını korur
curriculum/101/         # Kelime JSON dosyaları (unit1–unit10)
```

## Derleme

```bash
npm run build
npm run lint
```
