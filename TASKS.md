# Tasks — URL Link Shortener

> รายการงานแบ่งเป็น "card" สไตล์ Kanban สำหรับใช้เช็คลิสต์และอ้างอิงตอน commit code แบ่งเป็น 2 กลุ่มหลัก: **(A) งานออกแบบระบบ** (ทำให้เสร็จ/ตกผลึกก่อนลงมือ) และ **(B) งาน implement** (แบ่งเป็น card ขนาดพอ commit ได้ทีละก้อน) ดูรายละเอียดสถาปัตยกรรมที่ `ARCHITECTURE.md` และเหตุผลออกแบบเต็มที่ `/ai-logs/DESIGN.md`
>
> สถานะ: `☐` ยังไม่เริ่ม · `🔶` กำลังทำ · `☑` เสร็จแล้ว

---

## A. System Design Cards (ออกแบบระบบ)

| ID | Card | รายละเอียด | Output |
|---|---|---|---|
| ☑ DSN-01 | สรุป requirement จากโจทย์ | ไล่ core journey 5 ข้อ + deliverables + nice-to-have + ข้อจำกัดขอบเขต | `DESIGN.md` §1 |
| ☑ DSN-02 | วาง high-level architecture | เลือก layered/clean-lite architecture, แบ่ง project ฝั่ง backend | `DESIGN.md` §2, `ARCHITECTURE.md` §2 |
| ☑ DSN-03 | ออกแบบ Domain model + ER | entity `ShortLink`, enum `Platform`/`ShortCodeSource`, ความสัมพันธ์กับ platform destination | `ARCHITECTURE.md` §5 |
| ☑ DSN-04 | ออกแบบ pluggable short-code generation | เลือก Strategy pattern, นิยาม `IShortCodeGenerator` + 2 implementation แรก | `DESIGN.md` §4 |
| ☑ DSN-05 | ออกแบบ platform-aware redirect | นิยาม `IPlatformResolver`, กติกา fallback ไป default destination | `DESIGN.md` §5 |
| ☑ DSN-06 | ออกแบบ data access abstraction | นิยาม `IShortLinkRepository`, แผน swap in-memory → DB จริง | `DESIGN.md` §6 |
| ☑ DSN-07 | ร่าง API contract | endpoint, request/response, error convention (ProblemDetails) | `DESIGN.md` §7 |
| ☑ DSN-08 | วางโครง frontend (pages/components) | หน้า Create/Dashboard/Detail, component ย่อย, data-fetching strategy | `DESIGN.md` §8 |
| ☑ DSN-09 | วางแผน test strategy | รายการ unit test ที่ต้องมีต่อ core logic แต่ละส่วน | `DESIGN.md` §9 |
| ☑ DSN-10 | ทำแผนภาพ architecture ฉบับสมบูรณ์ | sequence diagram (create/redirect), ER diagram, component diagram, deployment topology | `ARCHITECTURE.md` |
| ☑ DSN-11 | Review ดีไซน์รอบสุดท้ายก่อน implement | เช็คว่า design ตอบครบทุกข้อของ evaluation criteria (functionality/architecture/tests/API/UI) มั้ย ปรับตามที่ตกลงกัน | อัปเดตไฟล์ design ที่เกี่ยวข้อง (ถ้ามีการปรับ) |

---

## B. Implementation Cards — Backend (.NET)

แต่ละ card ≈ 1 commit (หรือกลุ่ม commit เล็กๆ ที่ทำต่อเนื่องกัน)

| ID | Card | Commit message แนะนำ | งานที่ต้องทำ | Definition of Done |
|---|---|---|---|---|
| ☑ BE-01 | Scaffold solution & projects | `chore(backend): scaffold solution structure` | สร้าง `Gulfy.Api`, `Gulfy.Application`, `Gulfy.Domain`, `Gulfy.Infrastructure`, `Gulfy.Tests`, ตั้ง project reference, เพิ่ม `.gitignore` | `dotnet build` ผ่านทั้ง solution (ยืนยันแล้วสำหรับ 4 โปรเจกต์แรก; `Gulfy.Tests` ต้อง `dotnet restore` ด้วยอินเทอร์เน็ตจริงบนเครื่องคุณ เพราะแซนด์บ็อกซ์นี้เข้าถึง nuget.org ไม่ได้ — โครงสร้างไฟล์ถูกต้องตาม official xunit template) |
| ☑ BE-02 | Domain entities & enums | `feat(domain): add ShortLink entity and enums` | สร้าง `ShortLink`, `Platform`, `ShortCodeSource` ตาม ER ที่ออกแบบไว้ | entity มี behavior methods (RegisterVisit/Disable/Delete) ครบ, ไม่มี dependency ภายนอก — `dotnet build Gulfy.Domain` ผ่านจริงในแซนด์บ็อกซ์นี้; เพิ่ม unit test คู่กันไว้ใน `Gulfy.Tests/Domain/ShortLinkTests.cs` แล้ว (รอรัน `dotnet test` จริงบนเครื่องคุณ) |
| ☑ BE-03 | Repository interface + in-memory implementation | `feat(infra): add in-memory short link repository` | `IShortLinkRepository` + `InMemoryShortLinkRepository` (ConcurrentDictionary, thread-safe) | CRUD + `ExistsAsync` ทำงานถูกต้อง มี unit test เบื้องต้น |
| ☑ BE-04 | Short-code generators | `feat(application): add pluggable short-code generators` | `IShortCodeGenerator`, `RandomBase62ShortCodeGenerator` (พร้อม retry เมื่อชน), `CustomAliasShortCodeGenerator` (validate format) | มี unit test ครอบ collision-retry และ invalid alias |
| ☑ BE-05 | Platform resolver | `feat(application): add platform resolver from user-agent` | `IPlatformResolver` + implementation parse User-Agent → `Platform` | unit test ครอบ UA string หลายแบบ (iOS/Android/Default/ไม่รู้จัก) |
| ☑ BE-06 | ShortLinkService (use-case กลาง) | `feat(application): add ShortLinkService orchestrating create/resolve/manage` | รวม logic: validate URL, สร้างลิงก์, resolve ตอน redirect, disable/delete, click counting | unit test ครอบ create/disable/delete/resolve/click-count/last-accessed ครบ |
| ☑ BE-07 | API: Create & List/Get endpoints | `feat(api): add create/list/get link endpoints` | `POST /api/links`, `GET /api/links`, `GET /api/links/{code}` + DTO + validation + ProblemDetails error | ทดสอบผ่าน Swagger/Postman ได้ตาม contract |
| ☑ BE-08 | API: Disable/Delete endpoints | `feat(api): add disable and delete endpoints` | `PATCH /api/links/{code}/disable`, `DELETE /api/links/{code}` | ยิงแล้วลิงก์ resolve ไม่ได้อีกต่อไป ตรงตามพฤติกรรมที่ระบุ |
| ☑ BE-09 | Redirect endpoint + click tracking | `feat(api): add redirect endpoint with click tracking` | `GET /{code}` (root level) เรียก `ResolveAsync`, คืน 302/404 ตามสถานะ | นับ click ถูกต้องแม้ยิงพร้อมกันหลาย request (race condition test) |
| ☑ BE-10 | CORS + config (BaseUrl) | `chore(api): configure CORS and ShortUrl:BaseUrl setting` | เปิด CORS ให้ frontend dev server เรียกได้, อ่าน BaseUrl จาก `appsettings.json` | frontend เรียก API ข้าม origin ได้ใน dev |
| ☑ BE-11 | Unit test suite ครบ | `test(backend): complete unit test coverage for core logic` | รวม/เก็บตกเทสต์ที่ยังขาด (validator, service edge cases) | `dotnet test` ผ่านทั้งหมด, ครอบคลุมตามที่ระบุใน DSN-09 |
| ☑ BE-12 | Swagger/OpenAPI | `chore(api): enable Swagger for API contract exploration` | เปิด Swashbuckle ให้ดู contract ผ่าน `/swagger` | reviewer เปิดดู endpoint ได้ทันทีตอนรัน |

---

## C. Implementation Cards — Frontend (React)

| ID | Card | Commit message แนะนำ | งานที่ต้องทำ | Definition of Done |
|---|---|---|---|---|
| ☑ FE-01 | Scaffold Vite + React + TS | `chore(frontend): scaffold vite react-ts app` | `npm create vite`, ตั้ง ESLint/Prettier, Tailwind (หรือ styling ที่เลือก), proxy `/api` | `npm run dev`/`npm run build`/`npm run lint` ผ่านหมดแล้ว — ใช้ oxlint แทน ESLint (ค่า default ของ create-vite เวอร์ชันนี้), ใช้ plain CSS + design tokens แทน Tailwind (ให้ตรงกับ UI mockup ที่ทำไว้ก่อนหน้า) แทน Tailwind |
| ☑ FE-02 | API client + types | `feat(frontend): add typed api client for links` | `api/links.ts`, `types/ShortLink.ts` ครอบ endpoint ทั้งหมดตาม contract | เรียก API จริงได้ (ทดสอบผ่าน console/manual) |
| ☑ FE-03 | CreateLinkPage + LinkForm | `feat(frontend): add create link page with validation` | ฟอร์ม originalUrl/customAlias/platform overrides, client-side validation + แสดง error จาก backend | สร้างลิงก์สำเร็จแล้วเห็นผลลัพธ์ (short URL) |
| ☑ FE-04 | DashboardPage + LinkTable | `feat(frontend): add dashboard listing all links with stats` | ตาราง/การ์ดแสดงลิงก์ทั้งหมด + click count + created/last accessed | responsive ทั้ง desktop/mobile |
| ☑ FE-05 | Disable/Delete actions | `feat(frontend): add disable and delete actions with confirmation` | ปุ่ม disable/delete ต่อแถว + confirm dialog + refresh state (React Query invalidate) | UI อัปเดตทันทีหลัง action สำเร็จ |
| ☑ FE-06 | LinkDetailPage (สถิติละเอียด) | `feat(frontend): add link detail page with stats` | หน้าแสดงรายละเอียด/สถิติของลิงก์เดียว | เข้าถึงจาก dashboard ได้ แสดงข้อมูลครบ |
| ☑ FE-07 | Copy-to-clipboard + QR code | `feat(frontend): add copy-to-clipboard and qr code (nice-to-have)` | ปุ่ม copy พร้อม toast, generate QR code (เช่น `qrcode.react`) | ใช้งานได้จริงบน desktop/mobile |
| ☑ FE-08 | Responsive polish | `style(frontend): polish responsive layout and empty/error states` | ปรับ layout มือถือ, loading/empty/error state ให้ครบ | ทดสอบผ่าน devtools responsive mode |
| ☑ FE-09 | (bonus) Component tests | `test(frontend): add component tests for form and table` | Vitest + RTL ครอบ `LinkForm` validation, `LinkTable` rendering | test ผ่านทั้งหมด (ถ้าเวลาเหลือ) |

---

## D. Cross-cutting / Docs / Repo-level Cards

| ID | Card | Commit message แนะนำ | งานที่ต้องทำ | Definition of Done |
|---|---|---|---|---|
| ☑ DOC-01 | Design notes | `docs: add design notes and requirement summary` | `DESIGN.md` (ย้ายไปที่ `/ai-logs/`) | มีเนื้อหาสรุป requirement + เหตุผลออกแบบ |
| ☑ DOC-02 | Architecture diagrams | `docs: add architecture diagrams and ER design` | `ARCHITECTURE.md` (diagram + ER + trade-off) | มี diagram ครบตามที่ระบุ (context, layers, sequence x2, ER, component, topology) |
| ☑ DOC-03 | Task board | `docs: add task breakdown board` | ไฟล์นี้ (`TASKS.md`) | ครอบคลุมทั้งงานออกแบบและ implement |
| ☑ DOC-04 | README หลัก (run/test + API contract) | `docs: add root README with setup, run, test instructions` | วิธี clone/install/run ทั้ง backend+frontend, สรุป API contract, key design decisions, แนวทางต่อยอด | คนอื่น clone แล้วรันตามได้จริงโดยไม่ถามเพิ่ม |
| ☑ DOC-05 | Export AI session log | `docs: export ai session log to /ai-logs` | Export แชต/บันทึกการทำงานร่วมกับ AI ใส่ `/ai-logs/` | มีไฟล์ log จริงตามที่โจทย์ระบุ (ข้อ 6 ของ assignment) |
| ☑ REPO-01 | ตั้งค่า root repo (README stub, .gitignore รวม, license ถ้ามี) | `chore: initialize repo scaffolding` | จัดโครง `/backend`, `/frontend`, `/ai-logs` ให้พร้อมรับโค้ดจริง | โครงสร้าง repo ตรงกับที่ระบุใน `ARCHITECTURE.md`/`DESIGN.md` |
| ☑ REPO-02 | Final pass ก่อนส่งงาน | `chore: final review before submission` | รัน build+test ทั้งหมด, เช็ค README ครบ, เช็คว่า card ทุกใบใน B/C ทำเสร็จตามเกณฑ์ evaluation | พร้อมส่งลิงก์ repo ให้ผู้สัมภาษณ์ |

---

## E. Post-launch polish (หลัง REPO-02 — งานเพิ่มเติมที่ทำหลังส่งรอบแรก)

| ID | Card | Commit message | รายละเอียด | Definition of Done |
|---|---|---|---|---|
| ☑ FE-10 | Migrate UI to MUI Material | `style(frontend): migrate UI to MUI Material for a modern look` | แทนที่ custom CSS/component ทั้งหมดด้วย MUI Material: `AppBar`, `TextField`/`Accordion` form, `Table` (desktop) + `Card` list (mobile) responsive แทน media query เดิม, `Chip` status badge, `Switch` disable/enable, `Snackbar`/`Popover` สำหรับ copy/QR, `Fab`; เพิ่ม `src/theme.ts` (คง palette เดิม) | `tsc`/`oxlint`/`vitest` ผ่านหมด (9 specs); ทดสอบ flow จริงผ่านเบราว์เซอร์ (Playwright) ทุกหน้า ทั้ง desktop และ mobile ไม่มี console error |
| ☑ FE-11 | เปลี่ยน theme font เป็น DB Heavent | `style(frontend): switch theme font to DB Heavent` | ตั้ง `typography.fontFamily` ใน `theme.ts` เป็น `"DB Heavent", sans-serif` | ตรวจสอบผ่าน computed style จริงในเบราว์เซอร์ |
| ☑ FE-12 | จัดความสูง status filter ให้เท่ากับช่องค้นหา | `style(frontend): match status filter Select height to search TextField` | เพิ่ม `size="small"` ให้ `FormControl` ของ `Select` ให้ตรงกับ `TextField` (ซึ่ง default เป็น `small` จาก theme) | วัดความสูงจริงทั้งสอง input เท่ากัน (40px) |
| ☑ BE-13 | แก้ config gul.fy local domain mapping | `BE-13: fix gul.fy local domain mapping config (BaseUrl port, launchSettings syntax, vite https proxy)` | ใส่ port ให้ `ShortUrl:BaseUrl`, แก้ `launchSettings.json` https profile ที่ syntax พัง, แก้ `vite.config.ts` proxy target เป็น https | ทดสอบรันจริงผ่าน `https://gul.fy:5001` (Kestrel + curl -k) ได้ `shortUrl` ที่ถูกต้อง |
| ☑ DOC-06 | Export ARCHITECTURE.md ตาม source code จริง | `DOC-06: Export output architecture` | สร้าง `ai-logs/output/ARCHITECTURE.md` — วาดแผนภาพใหม่จาก source code จริง (เทียบกับฉบับดีไซน์ก่อน implement ที่ `ai-logs/ARCHITECTURE.md`) | ไฟล์ตรงกับ implementation ปัจจุบัน |
| ☑ DOC-07 | แก้ syntax mermaid ใน output architecture | `DOC-07: Fix mermaid output architecture` | แก้ diagram ที่ render ไม่ผ่านใน `ai-logs/output/ARCHITECTURE.md` | diagram render ได้ถูกต้องทุกอัน |
| ☑ DOC-08 | บันทึกวิธี map gul.fy ใน README | `DOC-08: document gul.fy local domain mapping in README` | เพิ่ม section "Local domain mapping" ใน `README.md` และ `backend/README.md` (ขั้นตอน hosts file, trust dev cert, run profile, หมายเหตุเรื่อง cert warning) | ทำตามขั้นตอนแล้วเปิด `https://gul.fy:5001` ได้จริง; ระบุชัดว่าไม่บังคับสำหรับการรัน/ตรวจงาน |
| ☑ DOC-09 | อัปเดต task board ให้ตรงกับ commit ล่าสุด | `DOC-09: update task board with post-launch polish (MUI, gul.fy, output docs)` | เพิ่ม section E นี้เข้า `TASKS.md` ให้ตรงกับ commit จริงที่ทำไปแล้ว | `TASKS.md` ครอบคลุมทุก commit |
| ☑ DOC-10 | Sync output/ARCHITECTURE.md กับงานล่าสุด | `DOC-10: sync output/ARCHITECTURE.md with post-launch changes (MUI, gul.fy, QR button removal)` | อัปเดต `ai-logs/output/ARCHITECTURE.md` (DOC-06/07) ให้ตรงกับ BE-13 (gul.fy BaseUrl+launch profile) และการเอา `QrCodeButton` ออกจาก `LinkTable` — แก้ diagram, delta table, local dev topology | เนื้อหาในไฟล์ตรงกับ source code จริง ณ ปัจจุบัน ไม่มี mermaid syntax error |
| ☑ DOC-11 | Upload user manual (ทำนอก session นี้) | `DOC-11: upload file user-mannual.pdf` | เพิ่มไฟล์ user manual (PDF) เข้า `ai-logs/` — commit นี้ทำนอกบทสนทนากับ Claude ไม่ทราบรายละเอียดเนื้อหา | ไฟล์อยู่ใน repo แล้ว |
| ☑ DOC-12 | Export/ต่อ AI session log | `docs: export continued AI session log to ai-logs/SESSION-AI.md` | เพิ่ม §10 ใน `ai-logs/SESSION-AI.md` ครอบคลุมงานตั้งแต่ README restructure จนถึง doc sync (DOC-10) — README split+undo, UI bug fixes, MUI migration, font, select height, gul.fy saga ทั้งหมด (backend config + frontend attempt + undo + README docs), hardcode audit, task-board sync | เนื้อหาครอบคลุมทุก turn ตั้งแต่ §9 จบจนถึงตอนนี้ |

> หมายเหตุ: อีก 2 commit ที่ tag เป็น `FE-08:` เพิ่มเติม (`Fix uncentered create-link card and table badge/column overflow`, `Remove QR code button from the link table row actions`) เป็น follow-up fix ของ card FE-08 เดิม ไม่ใช่ card ใหม่ — commit จริงใช้ ID เดิมต่อเนื่องกันเพราะเป็นการแก้บั๊กที่พบระหว่างทดสอบ FE-08 ซ้ำหลัง migrate ไป MUI (FE-10)

---

## แนะนำลำดับการทำงาน (suggested order)

1. **A (design)** ให้ตกผลึกก่อน (ทำไปแล้วส่วนใหญ่ผ่าน `DESIGN.md`/`ARCHITECTURE.md`) → เหลือแค่ DSN-11 review รอบสุดท้าย
2. **BE-01 → BE-06** (domain/infra/application layer + unit tests คู่กันไปเรื่อยๆ ไม่ต้องรอทำทีเดียวตอนท้าย)
3. **BE-07 → BE-10** (เปิด API ให้ frontend เรียกได้เร็วที่สุด แม้ endpoint ยังไม่ครบทุกเคส)
4. **FE-01 → FE-04** ต่อ UI หลักให้ครบ core journey (ขนานกับ BE ได้ถ้ามีเวลา/คนพอ)
5. **BE-11/BE-12, FE-05 → FE-09** เก็บรายละเอียด + nice-to-have
6. **DOC-04, DOC-05, REPO-01, REPO-02** ปิดงานสุดท้ายก่อนส่ง
7. **E (post-launch polish)** — งานเพิ่มเติมหลังส่งรอบแรก ไม่บังคับต่อการตรวจ: MUI redesign (FE-10 → FE-12), gul.fy local domain setup (BE-13, DOC-08), export architecture ตาม source code จริง (DOC-06, DOC-07)
