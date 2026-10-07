# Sistema Informasaun Jestaun Eskola Sekundaria Bazeia ba PWA
## Escola Secundaria Catolica Nossa Senhora de Fatima Railaco (NOSSEF Railaco)

> **Status:** Production-Ready • PWA Offline • Full-Stack Monolith  
> **Eskola:** Escola Secundaria Catolica Nossa Senhora de Fatima Railaco  
> **Lokalizasaun:** Vila de Railaco, Posto Administrativo Railaco, Munisípiu Ermera, Timor-Leste  
> **Padroeira & Lema:** Nossa Senhora de Fátima — *Fé, Siénsia no Karidade ba Futuru Timor-Leste*  
> **Diretór Eskola:** Pe. Guilhermino da Silva, SJ  
> **Lian Ofisiál Sistema:** 100% Lian Tetun Murni (Ofisiál Timor-Leste)  
> **Database:** Neon Serverless PostgreSQL (`esc.nossef`)  
> **Hosting & Cloud:** Vercel (`esc.nossef`)  
> **Repozitóriu GitHub:** `sagedral02/Sistema-Informasaun-Jestaun-Eskola-Sekundaria-Bazeia-ba-PWA`

---

## 1. Vizaun Jerál Sistema

Sistema ne'e dezenvolve espesifikamente hodi responde ba nesesidade jestaun eskolár iha **Escola Secundaria Catolica Nossa Senhora de Fatima Railaco**, kobre siklu tomak husi admiti estudante foun to'o graduasaun no arkivu alumni.

Sistema ne'e mai ho arkitetura **Progressive Web App (PWA)** ne'ebé bele instala iha telemóvel Android/iOS no komputadór, no suporta servisu **offline ho IndexedDB cache & mutation queue** atu mestre sira bele kontinua marka prezensas no nota iha sala aula maski rede internet iha Railaco la estável.

---

## 2. Modulu & Fase Implementasaun (F0 — F15)

Sistema ne'e implementa kompletu tuir roadmap **F0 to F15** husi PRD:

1. **F0 — Repository & Engineering Foundation:** Next.js 14 App Router, TypeScript, Neon Serverless PostgreSQL, PWA Manifest & Service Worker.
2. **F1 — Identidade, Kargu, Konfigurasaun Eskola & Audit:** 14 kargu (Diretór, TU, Xefe Kurríkulu, Tezoureiru, Mestre Titulár, Mestre Pengampu, Konsellór BK, Bibliotekáriu, Patrimóniu, Estudante, Inan-Aman/Wali), RBAC, no audit log kompletu.
3. **F2 — Dadus Mestre Akadémiku:** Tinan Akadémiku 2026/2027, Trimestre 1, 2, 3 (ligadu 1-ba-1 ho CAU 1, 2, 3), Nivel 10.º, 11.º, 12.º Ano, Área Ciências Naturais (CT) & Ciências Sociais e Humanidades (CSH), Sala Aula, Disiplina, no Atribuisaun Mestre.
4. **F3 — Admisasaun & Rejistu Foun:** Periodu pendaftaran, rejistu kandidatu, dokumentu, no matríkula.
5. **F4 — Estudante 360, Enkaregadu & Matríkula:** Perfil kompletu estudante, relasaun inan-aman, istóriku klase, no transferénsia.
6. **F5 — Oráriu Aula Semanál:** Matrís oráriu loron Segunda to Sesta (periodu 1-8), ho motor detesaun kolizaun (Collision Detection Engine).
7. **F6 — Prezensas & PWA Offline Sync:** Rejistu prezensas loron-loron & tuir aula, fila ho PWA offline sync queue no recibo mutasaun idempotente.
8. **F7 — Avaliasaun, CAU 1–3 & Kadiadernu Nota:** TPK, Teste Pársiál, Ezame Trimestrál CAU 1–3, kalkulasaun média automática, no tranka nota (finalize).
9. **F8 — Boletin de Notas, Ezame Nasionál 12.º Ano & Promosaun:** Emisaun boletin de notas ofisiál Diocese de Maliana, ranking klase, ezame nasionál 12.º ano (Português, Inglês, Matemátika, Espesífika), no desizaun promosaun/graduasaun.
10. **F9 — Finansas & Mensalidade (SPP):** Planu taxa $15/fulan, jera fatura em massa, rejistu pagamentu, emisaun resibu ofisiál REC-2026, no reversal pagamentu (INV-14).
11. **F10 — Orientasaun & Konsellu (BK) & Disiplina:** Kazu konsellu konfidensiál, akompañamentu, no rejistu infragrénsia disiplina.
12. **F11 — Biblioteka & Patrimóniu:** Katálogu livru ISBN, exemplár barcode, empréstimu/devolusaun livru, no inventáriu sasán eskola.
13. **F12 — Komunikasaun & Dokumentu:** Avizu públiku & restritu, notifikasaun Web Push, no deklarasaun/sertifikadu eskolár.
14. **F13 — Relatóriu Jerál & Esportasaun:** Relatóriu kanóniku demografia, prezensas, finansas, no esportasaun CSV/Excel/PDF.
15. **F14 — Seguransa & Health Checks:** Endpoint `/api/health/live` no `/api/health/ready`, audit logging, no prevensaun CSRF/SQL injection.
16. **F15 — Go-Live & Dadus Realístiku NOSSEF:** Dadus inisiál kompletu ba eskola NOSSEF Railaco, Ermera.

---

## 3. Konta & Kredensiál ba Teste (Quick Access)

Konta sira hotu mai ho lia-fukun default: `nossef2026`

| Kargu | Naran Kompletu | Email | Lia-fukun |
|---|---|---|---|
| **Diretór Eskola** | Pe. Guilhermino da Silva, SJ | `diretor@nossef.edu.tl` | `nossef2026` |
| **TU / Super Admin** | Maria Madalena Soares, S.Pd | `admin@nossef.edu.tl` | `nossef2026` |
| **Xefe Kurríkulu** | Lourenço dos Santos, Lic.Ed | `kurrikulu@nossef.edu.tl` | `nossef2026` |
| **Tezoureiru / Finansas** | Madre Teresa Noronha, RVM | `finansas@nossef.edu.tl` | `nossef2026` |
| **Mestre Titulár (10-CT)** | Mestre Domingos da Costa | `mestre.matematika@nossef.edu.tl` | `nossef2026` |
| **Mestra Português** | Mestra Jacinta Pereira | `mestre.portugues@nossef.edu.tl` | `nossef2026` |
| **Konsellór (BK)** | Sra. Beatriz da Conceição | `konsellu@nossef.edu.tl` | `nossef2026` |
| **Bibliotekáriu** | João Baptista Martins | `biblioteka@nossef.edu.tl` | `nossef2026` |
| **Responsável Sasán** | Afonso Guterres | `patrimoniu@nossef.edu.tl` | `nossef2026` |
| **Estudante (10.º CT)** | António Soares Guterres | `estudante1@nossef.edu.tl` | `nossef2026` |
| **Enkaregadu / Aman** | Manuel Guterres | `enkaregadu1@nossef.edu.tl` | `nossef2026` |

---

## 4. Oinsá Hahu & Roda iha Komputadór

```bash
# 1. Instala dependénsia sira
npm install

# 2. Roda migrasaun & seed database Neon
node scripts/migrate-seed.js

# 3. Hahu server dezenvolvimentu
npm run dev
```

Aksesu via navegadór: `http://localhost:3000`

---

## 5. Deployment Vercel & Neon

Projetu ne'e konfigura ona ho ligasaun direta:
- **Neon Database:** `esc.nossef`
- **Vercel Project:** `esc.nossef`
