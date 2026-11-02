# Štullers Ponuky

**Appka:** https://peterstuller90-oss.github.io/cenove_ponuky/

Webová appka na cenové ponuky Štullers Creative (React + TypeScript + Vite, dáta v Supabase, beží na GitHub Pages).

- **Ponuky:** nová ponuka, klient, položky, zľava, záloha, autosave. Stav: koncept → odoslaná → prijatá / zamietnutá.
- **Pridať službu:** ilustrácia (tematická / voľná) a logo s aplikáciou na produkty, mural (šírka × výška × zložitosť + doplnky), workshop (typ × počet ľudí), čokoľvek z cenníka, vlastný riadok.
- **Výstup:** náhľad A4 → „Uložiť PDF / tlačiť“, a odkaz pre klienta (`?p=<token>`), kde si ponuku pozrie, stiahne PDF a môže ju prijať.
- **Cenník a nastavenia** sa menia priamo v appke. Ceny označené „over cenu“ sú zatiaľ odhad.

## Bez Supabase = demo režim
Keď chýba `.env`, appka beží v demo režime a dáta sú iba v danom prehliadači.

## Nastavenie Supabase
1. V Supabase → SQL Editor spusti `supabase/schema.sql` (tabuľky s predponou `quote_`, pravidlá RLS, funkcie pre odkaz klienta).
2. Povoľ účty, ktoré môžu ponuky vidieť:
   `insert into public.quote_admins (email) values ('tvoj@email.sk');`
3. Ak účet ešte neexistuje: Authentication → Users → Add user (Auto Confirm).
4. Skopíruj `.env.example` na `.env` a doplň URL a publishable kľúč.

## Vývoj a nasadenie
```
npm install
npm run dev
npm run deploy   # zostaví dist/ pre GitHub Pages; obsah dist patrí do vetvy gh-pages
```
Publishable kľúč je v zostavenej stránke viditeľný, to je v poriadku: dáta chránia pravidlá RLS. Service role kľúč nikdy nepatrí do appky ani do repozitára.
