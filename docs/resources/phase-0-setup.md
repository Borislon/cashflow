# Фаза 0 — setup бележки

## 1. Supabase migration

В Supabase Dashboard → SQL Editor изпълни:

`supabase/migrations/202603280001_profiles.sql`

Това създава `profiles`, RLS и trigger при регистрация.

## 2. Локално стартиране (web)

```bash
npm install
npm run dev
```

## 3. Capacitor / Android

```bash
npm run build
npx cap sync android
npx cap open android
```

Изисква Android Studio + SDK. За бърз тест на UI може и `npm run dev` от телефон в същата мрежа (с IP на компютъра).

## Verify критерии (Фаза 0)

- [ ] Регистрация с име + имейл + парола
- [ ] Вход и изход
- [ ] Профил показва имейл; името се записва в `profiles`
- [ ] Bottom nav: Начало / Разходи / Анализ / Семейство / Профил
- [ ] App shell се отваря в браузър и/или Android чрез Capacitor
