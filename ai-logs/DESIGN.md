# URL Link Shortener — สรุปโจทย์ & System Design (ฉบับร่าง)

> เอกสารนี้สรุปสิ่งที่ต้องทำจากโจทย์ Full Stack Assignment และวางโครงสถาปัตยกรรมคร่าวๆ ด้วย .NET (backend) + React (frontend) — **ยังไม่ implement จริง** ใช้เป็น blueprint ก่อนเริ่มเขียนโค้ด

---

## 1. สรุปสิ่งที่ต้องทำ

### 1.1 Core user journey (บังคับ — ฟังก์ชันหลัก)

| # | Feature | รายละเอียด |
|---|---------|-----------|
| 1 | สร้างลิงก์สั้น | รับ URL ยาว → validate ว่าเป็น URL ที่ถูกต้อง → สร้าง short code (หรือรับ custom alias จากผู้ใช้) → คืนลิงก์สั้น |
| 2 | ดูสถิติการเข้าถึง | อย่างน้อย: จำนวนคลิกทั้งหมด; ถ้าทำได้เพิ่ม: วันที่สร้าง (CreatedAt), วันที่เข้าถึงล่าสุด (LastAccessedAt) |
| 3 | ปิดใช้งาน/ลบลิงก์ | Disable = หยุด redirect แต่ข้อมูลยังอยู่; Delete = ลบถาวร; ทั้งสองกรณีเข้าลิงก์แล้วต้อง**ไม่** redirect |
| 4 | ปลายทางตามแพลตฟอร์ม | ลิงก์เดียวกัน redirect ไปคนละที่ตาม platform ของผู้เข้าชม (iOS / Android / Default) ตัดสินใจ ณ เวลา redirect |
| 5 | Short-code generation แบบสลับได้ | ต้องรองรับได้มากกว่า 1 วิธี (เช่น auto-generate แบบ random, custom alias ที่ผู้ใช้ตั้งเอง) — ออกแบบให้เพิ่มวิธีใหม่ในอนาคตได้ง่าย (pluggable) |

พฤติกรรม redirect: เมื่อเปิดลิงก์สั้น → ถ้า active: เพิ่ม click count + อัปเดต LastAccessedAt + redirect ไปปลายทางที่ถูกต้องตาม platform; ถ้า disabled/deleted: ไม่ redirect (คืน 404/410 หรือหน้าแจ้งเตือน)

### 1.2 สิ่งที่ต้องส่ง (Required deliverables)

- **Code** — .NET backend + React frontend รวมอยู่ใน repo เดียว รันบนเครื่อง local ได้ด้วยคำสั่งไม่กี่คำสั่ง (มีเอกสารกำกับ)
- **Unit tests** — ครอบคลุม logic หลัก: short-code generation, URL validation, click counting, disable/delete
- **README.md + design notes** — สรุป API contract, วิธีรัน/เทสต์, การตัดสินใจด้านสถาปัตยกรรม, แนวทางต่อยอด
- **AI session log** — ถ้าใช้ agentic AI (เช่น session นี้) ต้อง export แล้วแนบไว้ใน `/ai-logs` หรือลิงก์ใน README

### 1.3 Nice to have (bonus)

- UI สวยงาม responsive (มือถือ/เดสก์ท็อป)
- In-memory storage แต่ออกแบบ data layer ให้สลับเป็น DB จริงได้ภายหลัง (ไม่บังคับต่อ DB จริง)
- Input validation + error message ที่เป็นประโยชน์ + edge case handling
- Copy-to-clipboard, QR code หรือ UX เล็กๆ อื่นๆ

### 1.4 ข้อจำกัดขอบเขต (Out of scope)

- ไม่ต้องมี authentication, deployment, production infra (เว้นแต่อยากโชว์)
- ใช้ `http://localhost:PORT` เป็น base URL ได้เลย ไม่จำเป็นต้อง map โดเมน `gul.fy` จริงผ่าน hosts file (เก็บเป็นแค่ display value ก็พอ) — เก็บ base URL เป็น config (`appsettings.json` → `ShortUrl:BaseUrl`) เพื่อความยืดหยุ่น

### 1.5 เกณฑ์ประเมิน (เพื่อจัดลำดับความสำคัญตอน implement)

- Functionality 15% · Code quality/architecture 15% · Unit tests 10% · API contract/README/UI 10% (รวม pre-interview 50%)
- Communication 25% + Technical Q&A 25% ระหว่างสัมภาษณ์ (50%) → โค้ดต้อง**อธิบายง่าย**และมี seam ที่ต่อยอดได้ ไม่ over-engineer

---

## 2. High-level Architecture

```
gulfy-link-shortener/                 (single repo)
├── backend/
│   ├── Gulfy.Api/                    # ASP.NET Core Web API (controllers, Program.cs, middleware)
│   ├── Gulfy.Application/            # Use-cases / services, DTOs, interfaces (ports)
│   ├── Gulfy.Domain/                 # Entities, enums, domain logic (framework-agnostic)
│   ├── Gulfy.Infrastructure/         # Repository implementations (in-memory now, DB later)
│   └── Gulfy.Tests/                  # xUnit unit tests
├── frontend/
│   └── (React + Vite + TypeScript app)
├── ai-logs/                          # exported AI session log(s)
└── README.md
```

แนวคิด: **Clean/Onion-lite architecture** — Domain ไม่รู้จัก Infrastructure, Application เรียกผ่าน interface (`IShortLinkRepository`, `IShortCodeGenerator`, `IPlatformResolver`) → Controllers บาง (thin), logic จริงอยู่ใน Application services → ทำให้ mock/unit test ง่าย และสลับ storage เป็น DB จริงได้โดยไม่กระทบชั้นอื่น

Request flow (redirect):
```
Browser → GET /{code}
   → RedirectController
     → ShortLinkService.ResolveAsync(code, userAgent)
        → repo.GetByCode(code)
        → ถ้า null/disabled/deleted → 404
        → platformResolver.Detect(userAgent) → เลือก destination URL
        → repo.RecordVisit(code)  (increment click, update LastAccessedAt) — แบบ atomic/thread-safe
     → 302 Redirect ไปปลายทางที่เลือก
```

---

## 3. Domain Model (คร่าวๆ)

```csharp
public class ShortLink
{
    public Guid Id { get; init; }
    public string ShortCode { get; init; }
    public string OriginalUrl { get; init; }          // default destination
    public Dictionary<Platform, string> PlatformDestinations { get; init; }  // optional overrides
    public string? CustomAlias { get; init; }
    public ShortCodeSource Source { get; init; }        // Auto | CustomAlias
    public bool IsDisabled { get; private set; }
    public bool IsDeleted { get; private set; }
    public int ClickCount { get; private set; }
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset? LastAccessedAt { get; private set; }

    public void RegisterVisit() { ClickCount++; LastAccessedAt = DateTimeOffset.UtcNow; }
    public void Disable() => IsDisabled = true;
    public void Enable()  => IsDisabled = false;
    public void MarkDeleted() => IsDeleted = true;
    public bool IsActive => !IsDisabled && !IsDeleted;
}

public enum Platform { Default, Ios, Android }
public enum ShortCodeSource { Auto, CustomAlias }
```

---

## 4. Pluggable Short-code Generation (Strategy Pattern)

```csharp
public interface IShortCodeGenerator
{
    string Generate(string? requestedAlias);   // throws ถ้า alias ไม่ถูกต้อง/ชนกัน (แล้วให้ service เช็คซ้ำผ่าน repo)
}

// Implementations:
// - RandomBase62ShortCodeGenerator: สุ่ม 6-8 ตัวอักษร base62, เช็ค collision กับ repo แล้ว retry
// - CustomAliasShortCodeGenerator: ใช้ alias ที่ผู้ใช้กรอกตรงๆ (validate format/ความยาว/ตัวอักษรที่อนุญาต)
```

`ShortLinkService` เลือก strategy ตามว่าผู้ใช้ส่ง `customAlias` มาหรือไม่ (หรือ inject เป็น `IEnumerable<IShortCodeGenerator>` + selector ถ้าต้องการรองรับหลายวิธีพร้อมกันในอนาคต เช่น dictionary-word generator, sequential base62 ฯลฯ) — นี่คือจุดที่ตอบโจทย์ข้อ 5 (pluggable) และโชว์ SOLID (Open/Closed) ได้ดี

---

## 5. Platform-aware Redirect

```csharp
public interface IPlatformResolver
{
    Platform Detect(string userAgent);   // parse UA string → iOS/Android/Default
}
```

Service เลือก URL: `link.PlatformDestinations.GetValueOrDefault(platform, link.OriginalUrl)` — ถ้าไม่มี override เฉพาะ platform ใช้ `OriginalUrl` เป็น fallback เสมอ

---

## 6. Data Layer (Swappable Storage)

```csharp
public interface IShortLinkRepository
{
    Task<ShortLink?> GetByCodeAsync(string code);
    Task<IReadOnlyList<ShortLink>> GetAllAsync();
    Task AddAsync(ShortLink link);
    Task<bool> ExistsAsync(string code);
    Task SaveChangesAsync();   // no-op สำหรับ in-memory, มีความหมายจริงตอนสลับเป็น EF Core
}
```

- Implementation แรก: `InMemoryShortLinkRepository` ใช้ `ConcurrentDictionary<string, ShortLink>` (thread-safe สำหรับ click counting ที่มาจากหลาย request พร้อมกัน)
- อนาคต: `EfCoreShortLinkRepository` หรือ `LiteDbShortLinkRepository` implement interface เดิม → ไม่ต้องแก้ Application/Domain layer เลย (Dependency Inversion)

---

## 7. API Contract (ฉบับร่าง)

| Method | Path | Body/Query | คำอธิบาย |
|--------|------|-----------|----------|
| `POST` | `/api/links` | `{ originalUrl, customAlias?, platformDestinations?: { ios?, android? } }` | สร้างลิงก์ใหม่ → คืน `{ shortCode, shortUrl, ... }` |
| `GET` | `/api/links` | — | list ลิงก์ทั้งหมด (สำหรับ dashboard) |
| `GET` | `/api/links/{code}` | — | ดู detail + สถิติของลิงก์เดียว |
| `PATCH` | `/api/links/{code}/disable` | — | ปิดใช้งาน |
| `PATCH` | `/api/links/{code}/enable` | — | เปิดใช้งานกลับ (ถ้าต้องการ) |
| `DELETE` | `/api/links/{code}` | — | ลบถาวร |
| `GET` | `/{code}` | — (root level, ไม่ใช่ `/api`) | redirect จริง — เช็ค active, นับ click, resolve platform |

Response ตัวอย่าง (`POST /api/links`):
```json
{
  "shortCode": "HsQy5",
  "shortUrl": "http://localhost:5001/HsQy5",
  "originalUrl": "https://www.google.co.th",
  "createdAt": "2026-08-18T07:00:00Z",
  "isDisabled": false,
  "clickCount": 0
}
```

Error convention: ใช้ `ProblemDetails` (RFC 7807) มาตรฐานของ ASP.NET Core — 400 (validation), 404 (ไม่พบ/ลิงก์ inactive), 409 (alias ชนกัน)

---

## 8. Frontend (React) — โครงคร่าวๆ

```
frontend/src/
├── api/            # apiClient.ts (fetch wrapper), links.ts (typed API calls)
├── types/          # ShortLink, CreateLinkRequest, ...
├── pages/
│   ├── CreateLinkPage.tsx      # ฟอร์มสร้างลิงก์ (URL, alias, platform overrides)
│   ├── DashboardPage.tsx       # ตารางลิงก์ทั้งหมด + action (disable/delete) + copy/QR
│   └── LinkDetailPage.tsx      # สถิติละเอียดของลิงก์เดียว
├── components/
│   ├── LinkForm.tsx
│   ├── LinkTable.tsx / LinkCard.tsx
│   ├── StatBadge.tsx
│   ├── CopyButton.tsx
│   └── QrCodeButton.tsx
└── App.tsx (React Router: "/", "/links/:code")
```

- Data fetching: React Query (หรือ SWR) เพื่อจัดการ loading/error/cache/refetch หลัง mutation ได้ง่าย
- Styling: Tailwind CSS (เร็วและ responsive ง่าย) หรือ CSS module ตามถนัด
- Validation ฝั่ง client เบื้องต้น (ก่อนยิง API) + แสดง error message จาก backend

---

## 9. Testing Plan

**Backend (xUnit + FluentAssertions/Moq):**
- `RandomBase62ShortCodeGeneratorTests` — ความยาว, charset, ไม่ซ้ำ (mock repo เช็ค collision-retry)
- `CustomAliasShortCodeGeneratorTests` — reject alias ที่ผิดรูปแบบ/ชนกัน
- `UrlValidatorTests` — accept/reject รูปแบบ URL ต่างๆ (scheme, malformed, ฯลฯ)
- `ShortLinkServiceTests` — click counting เพิ่มถูกต้อง, LastAccessedAt อัปเดต, disable/delete แล้ว resolve ไม่สำเร็จ, platform resolution fallback ไป default
- `PlatformResolverTests` — UA string ต่างๆ map ไป Platform ที่ถูกต้อง

**Frontend (ถ้าเวลาเหลือ, nice-to-have):** Vitest + React Testing Library สำหรับ `LinkForm` validation และ `LinkTable` rendering

---

## 10. Design decisions & Extensibility (พูดตอนสัมภาษณ์)

- **Repository pattern + DI** → สลับ in-memory → EF Core/DB จริงได้โดยไม่แตะ business logic
- **Strategy pattern สำหรับ short-code generation** → เพิ่มวิธีใหม่ (เช่น human-readable words, sequential ID + Base62) โดยไม่แก้ของเดิม (Open/Closed Principle)
- **Platform resolution เป็น service แยก** → ทดสอบง่าย, ในอนาคตอาจอัปเกรดเป็น proper UA-parsing library หรือรองรับ platform เพิ่ม (Desktop, Bot)
- **Thread-safety ของ click counting** → ต้องคิดเรื่อง race condition ตอน concurrent visits (ConcurrentDictionary / lock เฉพาะ record หรือใช้ atomic increment)
- ต่อยอดในอนาคต: auth + per-user ownership, rate limiting, custom domains, link expiration, analytics ละเอียด (geo, referrer), caching layer สำหรับ redirect lookup ที่ hot, database จริง (Postgres) + index บน ShortCode

---

## 11. Next steps (เมื่อพร้อม implement)

1. Scaffold `dotnet new webapi` + solution แยก projects ตามข้อ 2
2. Scaffold React ด้วย Vite + TypeScript
3. Implement Domain → Infrastructure (in-memory) → Application services → API controllers → เขียน unit tests คู่กันไปทีละส่วน
4. ต่อ frontend เข้ากับ API, ทำ dashboard + create form
5. เพิ่ม nice-to-have (QR code, copy button) ถ้าเวลาเหลือ
6. เขียน README (run/test instructions + API contract + design notes) + export AI log ใส่ `/ai-logs`

---

*หมายเหตุ: เอกสารนี้เป็น blueprint ระดับ high-level ยังไม่ได้ implement โค้ดจริง — ใช้เป็นจุดเริ่มต้นคุยรายละเอียด/ปรับก่อนลงมือเขียนโค้ด*
