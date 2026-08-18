# Architecture — URL Link Shortener

> เอกสารนี้รวมแผนภาพสถาปัตยกรรม (architecture diagrams) และ ER design เบื้องต้นของระบบ ก่อนเริ่ม implement จริง เพื่อใช้เป็นจุดอ้างอิงตอนเขียนโค้ดและตอนอธิบายในรอบสัมภาษณ์ ดูสรุปโจทย์และเหตุผลการออกแบบฉบับเต็มได้ที่ `/ai-logs/DESIGN.md`

---

## 1. System Context Diagram

```mermaid
graph LR
    U["👤 User<br/>(สร้าง/จัดการลิงก์)"] -->|HTTPS| FE["React Frontend<br/>(Vite + TS)"]
    V["👤 Link Visitor<br/>(คลิกลิงก์สั้น)"] -->|GET /:code| API
    FE -->|"REST /api/links/*"| API["ASP.NET Core Web API"]
    API --> Repo[("Storage<br/>(in-memory ก่อน)")]
    Repo -.swap ภายหลัง.-> DB[("Relational DB<br/>เช่น PostgreSQL")]
```

---

## 2. Backend — Layered Architecture

```mermaid
graph TD
    subgraph API["Gulfy.Api"]
        Controllers["Controllers<br/>LinksController, RedirectController"]
        Middleware["Middleware<br/>(error handling, logging)"]
    end

    subgraph APP["Gulfy.Application"]
        Services["ShortLinkService"]
        Ports["Interfaces (ports)<br/>IShortLinkRepository<br/>IShortCodeGenerator<br/>IPlatformResolver"]
        DTOs["DTOs / Validators"]
    end

    subgraph DOM["Gulfy.Domain"]
        Entities["ShortLink entity<br/>Platform / ShortCodeSource enums"]
    end

    subgraph INFRA["Gulfy.Infrastructure"]
        InMemRepo["InMemoryShortLinkRepository"]
        RandomGen["RandomBase62ShortCodeGenerator"]
        AliasGen["CustomAliasShortCodeGenerator"]
        UAResolver["UserAgentPlatformResolver"]
    end

    Controllers --> Services
    Services --> Ports
    Services --> Entities
    Services --> DTOs
    InMemRepo -.implements.-> Ports
    RandomGen -.implements.-> Ports
    AliasGen -.implements.-> Ports
    UAResolver -.implements.-> Ports
```

หลักการ: Domain ไม่ผูกกับ framework ใดๆ, Application เห็นแค่ interface (ports), Infrastructure เป็นคนเดียวที่รู้จัก implementation จริง → สลับ storage/strategy ได้โดยไม่แก้ business logic (Dependency Inversion)

---

## 3. Sequence — สร้างลิงก์สั้น (Create Short Link)

```mermaid
sequenceDiagram
    participant U as React (CreateLinkPage)
    participant C as LinksController
    participant S as ShortLinkService
    participant G as IShortCodeGenerator
    participant R as IShortLinkRepository

    U->>C: POST /api/links {originalUrl, customAlias?, platformDestinations?}
    C->>S: CreateAsync(request)
    S->>S: Validate URL format
    S->>G: Generate(customAlias)
    G->>R: ExistsAsync(code)?
    R-->>G: false (ไม่ชน)
    G-->>S: shortCode
    S->>R: AddAsync(ShortLink)
    R-->>S: ok
    S-->>C: ShortLinkDto
    C-->>U: 201 Created {shortCode, shortUrl, ...}
```

---

## 4. Sequence — Redirect เมื่อมีคนเปิดลิงก์สั้น

```mermaid
sequenceDiagram
    participant V as Visitor
    participant RC as RedirectController
    participant S as ShortLinkService
    participant R as IShortLinkRepository
    participant P as IPlatformResolver

    V->>RC: GET /{code}
    RC->>S: ResolveAsync(code, userAgentHeader)
    S->>R: GetByCodeAsync(code)
    R-->>S: ShortLink | null

    alt ไม่พบ หรือ Disabled/Deleted
        S-->>RC: null
        RC-->>V: 404 Not Found
    else Active
        S->>P: Detect(userAgent)
        P-->>S: Platform (iOS/Android/Default)
        S->>S: เลือกปลายทาง (override ตาม platform หรือ fallback เป็น OriginalUrl)
        S->>R: RecordVisit(code)  note: increment ClickCount + set LastAccessedAt
        R-->>S: ok
        S-->>RC: destinationUrl
        RC-->>V: 302 Redirect → destinationUrl
    end
```

---

## 5. ER Diagram — เบื้องต้น (ออกแบบให้ map เข้ากับ relational DB ได้ในอนาคต)

```mermaid
erDiagram
    SHORT_LINK {
        guid Id PK
        string ShortCode UK "unique, indexed"
        string OriginalUrl "default destination"
        string CustomAlias "nullable"
        string Source "Auto | CustomAlias"
        bool IsDisabled
        bool IsDeleted
        int ClickCount
        datetime CreatedAt
        datetime LastAccessedAt "nullable"
    }
    PLATFORM_DESTINATION {
        guid Id PK
        guid ShortLinkId FK
        string Platform "Ios | Android"
        string DestinationUrl
    }

    SHORT_LINK ||--o{ PLATFORM_DESTINATION : "มี override ต่อแพลตฟอร์ม (0..n)"
```

**หมายเหตุการออกแบบ:**
- ช่วง in-memory: เก็บ `PlatformDestinations` เป็น `Dictionary<Platform,string>` ภายใน entity เดียวได้เลย ไม่ต้องมีตารางแยกจริง
- ER ด้านบนกันไว้ล่วงหน้าแบบ normalized (1 ShortLink → many PlatformDestination) เผื่อย้ายไป EF Core/DB จริง จะได้ไม่ต้อง redesign schema
- `ShortCode` ควรมี unique index เสมอ (กันชนกันตอน concurrent create)
- `ClickCount` increment ต้อง atomic — ระวัง race condition เวลามีหลาย request redirect พร้อมกัน

---

## 6. Frontend — Component Architecture

```mermaid
graph TD
    App --> Router["React Router"]
    Router --> CreateLinkPage
    Router --> DashboardPage
    Router --> LinkDetailPage

    CreateLinkPage --> LinkForm
    DashboardPage --> LinkTable
    DashboardPage --> CopyButton
    DashboardPage --> QrCodeButton
    LinkDetailPage --> StatBadge

    LinkForm --> ApiClient["api/links.ts"]
    LinkTable --> ApiClient
    LinkDetailPage --> ApiClient
    ApiClient --> Backend["ASP.NET Core API"]
```

---

## 7. Local Dev Topology

```mermaid
graph LR
    subgraph "เครื่อง Dev"
        Vite["Vite dev server<br/>localhost:5173"] -->|proxy /api| Kestrel["Kestrel<br/>localhost:5001"]
        Kestrel --> Mem[("In-memory store<br/>(process memory)")]
    end
    Browser["เบราว์เซอร์"] --> Vite
    Browser -->|เปิดลิงก์สั้นโดยตรง| Kestrel
```

- Backend: Kestrel บน `localhost:5001` (หรือ map `gul.fy` ผ่าน hosts file ถ้าอยากโชว์ short-domain จริง — ไม่บังคับ)
- Frontend: Vite dev server บน `localhost:5173` proxy request `/api/*` ไปที่ backend
- Storage เป็น in-process memory → ข้อจำกัด: ข้อมูลหายเมื่อ restart process, ใช้ได้กับ instance เดียว (ไม่ scale แนวนอนได้จนกว่าจะสลับเป็น DB จริง) — บันทึกไว้เป็น known limitation ใน README

---

## 8. ทางเลือก/trade-off ที่ควรพูดถึงตอนสัมภาษณ์

| หัวข้อ | ทางเลือกที่เลือก | ทางเลือกอื่น | เหตุผล |
|---|---|---|---|
| Storage | In-memory (ConcurrentDictionary) | LiteDB / SQLite | โจทย์อนุญาต in-memory, เน้นความเร็วในการพัฒนา + โชว์ seam สำหรับสลับ DB |
| Short-code gen | Strategy pattern (interface + 2 impl) | if/else เดียวในฟังก์ชัน | ตอบโจทย์ pluggable ตรงๆ และ Open/Closed |
| Platform detect | Server-side, ตอน redirect (จาก User-Agent header) | Client-side JS แล้วส่ง platform มาเป็น query param | โจทย์ระบุ "ตัดสินใจตอน redirect" — ทำที่ server ให้ trust ได้มากกว่าและไม่ต้องพึ่ง JS ฝั่ง client |
| Click counting | Increment แบบ atomic ใน repository (thread-safe) | Fire-and-forget async logging queue | scope เล็ก ไม่จำเป็นต้องมี queue/message broker สำหรับ assignment นี้ |
