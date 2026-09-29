# W03 Canvas — texto listo para pegar

Cada bloque de abajo es **una sección independiente** del text entry box de Canvas. Copia solo el
contenido, sin los títulos de sección ni las notas de este archivo.

Toda la evidencia es pública y verificable sin iniciar sesión. Las tres URLs que hay que entregar:

| Qué | URL |
|---|---|
| Repositorio | https://github.com/adab-code/glowbook |
| Project board | https://github.com/users/adab-code/projects/2 |
| Pull request revisado | https://github.com/ivanchulde/sacrament-meetings/pull/1 |

Las dos imágenes hay que subirlas como imagen al Canvas, no como enlace:

| Imagen | Archivo | Para qué criterio |
|---|---|---|
| VS Code con `npm run dev` y `localhost:3000` | `docs/images/w03-local-setup.png` | Local Development Screenshot |
| Diagrama del modelo de datos | `docs/images/w03-data-model.png` | Data Model |
| Jerarquía de componentes | `docs/images/w03-component-hierarchy.png` | Data Model / arquitectura |

---

## SECCIÓN 1 — Team Meeting Summary

**Reunión síncrona:** jueves 24 de septiembre de 2026, 20:00 MDT, por Microsoft Teams.

**Miembros presentes:** Iván Chulde, Aaron Daniel Alfaro Barra.
**Líder de grupo esta semana:** Iván Chulde.
**Líder de grupo para la semana 04:** Aaron Daniel Alfaro Barra.

**Decisiones principales:**

1. **Especificación revisada y confirmada.** Repasamos el documento de especificaciones historia por
   historia. El alcance se mantuvo en cinco historias de usuario: acceso a cuentas, catálogo de
   servicios, perfiles de clientes, calendario de citas y panel diario. Añadimos las dos secciones
   que faltaban en el borrador de la semana 02 — *Technical Requirements* y *Assumptions* — y
   movimos explícitamente pagos, autoservicio para clientes, recordatorios, citas recurrentes y la
   vista de calendario mensual a un *backlog* de Fase 2. No se eliminó ningún requisito funcional.
2. **Base de datos: PostgreSQL con Prisma 7.** Se eligió sobre MongoDB porque el dominio es
   relacional —una cita siempre debe resolver a un cliente, un servicio y un estudio reales— y
   PostgreSQL está aprobado por el curso. En desarrollo usamos una instancia local de PostgreSQL 18.
   Para despliegue la app se hospeda en Render con una instancia de Postgres de Render, permitido
   por el curso bajo "Vercel or similar".
3. **Autenticación: Auth.js v5 con el proveedor Credentials.** Consideramos Clerk y elegimos Auth.js
   porque GlowBook necesita tenancy por estudio e invitaciones de personal: la identidad debe vivir
   en *nuestras* tablas `Account` / `StaffUser` para poder imponer las reglas de aislamiento. El
   correo duplicado y el mensaje genérico de "invalid email or password" se aplican en `authorize()`.
4. **Arquitectura de componentes acordada.** Dos grupos de rutas — `(auth)` para páginas públicas y
   `(app)` para el shell autenticado — más un guard `proxy.ts`. Los datos fluyen en un solo sentido:
   route handler → Prisma → server component → estado del client component, sin librería de fetch en
   el cliente. Se planificaron unos 40 componentes en las capas layout, shared, feature y UI; 22
   están construidos. Ninguna carpeta `features/` puede importar de otra.
5. **Diseño y marca acordados:** paleta cálida "Glow Rose / Studio Gold / Warm Stone", **Geist Sans**
   para UI con **Fraunces** para títulos display, escala de espaciado de 4px y targets táctiles
   mínimos de 44px. Se eligió **shadcn/ui** como librería compartida para la semana 04 sobre los
   tokens de Tailwind v4. Al momento de la entrega existen 4 de los 14 primitivos planificados
   (`button`, `card`, `input`, `label`) y falta añadir `components.json`; los primitives actuales
   son propios sobre `class-variance-authority` y Radix y siguen la estructura de shadcn, así que
   la migración es aditiva y no una reescritura.
6. **Modelo de datos acordado:** ocho entidades, dinero siempre en centavos enteros, citas con un
   snapshot de `priceCentsTotal`, `Restrict` en los borrados que dejarían historia huérfana, y
   `accountId` en toda tabla con alcance de tenant.
7. **Flujo de ramificación practicado y formalizado.** Nombres de rama `feat/<slug>`, `fix/<slug>`,
   `docs/<slug>`, y la regla acordada es que nada llega a `main` salvo por pull request con al menos
   una revisión aprobatoria del otro miembro y un tiempo de respuesta de 24 horas. El ciclo rama →
   commit → push → pull request → merge se ejerció de verdad esta semana: **catorce pull requests**
   (#9–#22) llevaron el trabajo de la semana 04 a `main`, y la serie apilada se mergeó en orden de
   dependencia. **Una parte de la regla acordada todavía no se cumple:** el segundo miembro tiene
   actualmente acceso de solo lectura al repositorio, así que los catorce PR fueron escritos y
   mergeados por la misma persona y aún no hay ninguna revisión cruzada registrada en el
   repositorio. Dar acceso de escritura y dejar landado un PR revisado cierra esto, y es el primer
   punto de la lista de la semana 04.
8. **Board actualizado.** El project board lleva los issues separados en trabajo de frontend,
   backend e infraestructura, cada uno acotado a 4–8 horas y asignado al miembro dueño, con los P1
   de mayor prioridad en el **hito de la Semana 04**.
9. **Cadencia asíncrona acordada:** un mensaje corto de progreso y bloqueantes en Teams antes de las
   5:00pm MDT cada día hábil, los bloqueantes se señalan de inmediato en vez de en la siguiente
   reunión, y el board se actualiza antes del cierre del día para que siga siendo una herramienta
   viva.
10. **Instrucciones de IA redactadas.** Capturamos el stack, la arquitectura, los datos, el estilo y
    las reglas de flujo en `.github/copilot-instructions.md` para que cualquier asistente de IA
    sugiera código que encaje con el proyecto. Se probará y refina como entregable de la semana 04.
11. **Entornos locales verificados.** Ambos miembros clonaron el repositorio, ejecutaron
    `npm install` y confirmaron que `npm run dev` servía la app en `localhost:3000` antes de empezar
    cualquier trabajo de arquitectura.

**Responsabilidades asignadas:**

| Miembro | Responsabilidad semana 03 | Propiedad semana 04 (hito Week 04) |
|---|---|---|
| **Iván Chulde** (líder semana 03) | Facilitó la reunión, documentó las decisiones, mantuvo el board al día, redactó el sistema de diseño y la arquitectura de componentes | Design tokens + setup de shadcn/ui, layout `AppShell`, CRUD de catálogo de servicios, CRUD de perfiles de clientes, UI del panel y del calendario |
| **Aaron Daniel Alfaro Barra** | Realizó la práctica de ramificación/merge, redactó el modelo de datos y las instrucciones de IA, verificó ambos entornos locales | Schema de Prisma + migraciones + seed, flujo de credenciales de Auth.js, sesión y guard `proxy.ts`, invitaciones de personal, API de citas y detección de solapamientos |

Compartido: el flujo de reserva de citas (FR-017 → FR-024) tiene doble propiedad — la API y la
validación por Aaron, la UI del calendario por Iván — y es la primera pieza deliberadamente emparejada.

---

## SECCIÓN 2 — Project Setup

**URL del repositorio público de GitHub del equipo:**
https://github.com/adab-code/glowbook

El `README.md` lista a ambos miembros del equipo (Iván Chulde y Aaron Daniel Alfaro Barra) con sus
áreas de enfoque, además de la lista de funcionalidades, el stack, los pasos de instalación local,
los pasos de despliegue, la tabla de variables de entorno, la estructura del proyecto y la
documentación completa de endpoints de la API.

**Captura de pantalla de VS Code con el proyecto corriendo localmente:**

*(Subir `docs/images/w03-local-setup.png` como imagen. Muestra el IDE con el proyecto `glowbook`
abierto, la terminal con `npm run dev` y el output de Next.js 16.3.5 en Turbopack con el servidor
local en `http://localhost:3000`, y el navegador integrado mostrando la pantalla de inicio de sesión
de GlowBook en `http://localhost:3000/login`.)*

**URL del GitHub Project Board:**
https://github.com/users/adab-code/projects/2

| # | Issue | Dueño | Hito | Estado al momento de la entrega |
|---|---|---|---|---|
| 1 | Scaffold del proyecto Next.js con App Router, TypeScript y Tailwind | Iván | **Week 04** | Hecho — 18 rutas de la app compilan |
| 3 | Diseño del schema de base de datos y datos de ejemplo: Account, StaffUser, Client, Service, Appointment | Aaron | **Week 04** | Hecho — 8 modelos, migración commiteada, seed verificado |
| 2 | Autenticación: registro, inicio y cierre de sesión, restablecimiento de contraseña | Aaron | **Week 04** | Hecho — inicio con credenciales, claims de tenancy, guard de rutas |
| 4 | CRUD del catálogo de servicios con validación y confirmación de borrado | Iván | **Week 04** | Hecho — archivar-o-borrar en servicios referenciados |
| 5 | CRUD de perfiles de clientes con notas e historial de citas | Iván | **Week 04** | Hecho — rechaza archivar si hay citas futuras |
| 6 | Calendario de citas: crear, ver, editar, cancelar y aviso de solapamiento | Ambos | — | Sin empezar — siguiente slice |
| 7 | Panel diario con las citas de hoy y las próximas | Iván | — | Hecho — cuatro métricas más las próximas cinco citas |
| 8 | Desplegar la aplicación en Render con las variables de entorno configuradas | Ambos | — | Sin empezar |

Ocho issues, cada uno acotado a 4–8 horas y asignado a un dueño, repartidos entre trabajo de setup,
datos, autenticación, funcionalidades e infraestructura. **Cinco issues llevan el hito de la Semana
04** —#1 a #5, el conjunto P1— y los tres restantes se dejan fuera del hito a propósito como trabajo
de sprint posterior. Seis de los ocho issues estaban completos al momento de la entrega y llegaron a
`main` mediante pull requests. El issue #6, el calendario de citas, es la única parte del trabajo de
la semana 04 sin empezar, y encabeza el siguiente sprint.

**Documentos de planificación añadidos esta semana:**

- Arquitectura de componentes: `docs/architecture.md`
- Modelo de datos: `docs/data-model.md`
- Sistema de diseño: `docs/design-system.md`
- Instrucciones para el asistente de IA: `.github/copilot-instructions.md`

---

## SECCIÓN 3 — Architecture & Design Planning

### Modelo de datos

*(Subir `docs/images/w03-data-model.png` como imagen. Diagrama completo con 8 entidades, sus campos
clave y 11 relaciones.)*

Ocho entidades, con sus campos clave y relaciones:

| Entidad | Campos clave | Relaciones |
|---|---|---|
| **Account** (estudio — raíz de tenancy) | `id`, `studioName`, `slug` (único), `timezone`, `currency`, `onboardingComplete` | Tiene muchos `StaffUser`, `StaffInvite`, `Client`, `Service`, `Appointment` (1:N). Es el límite de aislamiento |
| **StaffUser** | `id`, `accountId`, `email` (único), `passwordHash`, `role` (`OWNER`/`STAFF`), `firstName`, `lastName`, `isActive` | Pertenece a un Account (1:N); tiene muchos `PasswordResetToken` y muchos `StaffInvite` que acepta |
| **StaffInvite** | `id`, `accountId`, `email`, `role`, `token` (hasheado, expira a 7 días), `expiresAt`, `acceptedAt` | Enviado por un StaffUser y aceptado por un StaffUser (`SetNull`); pertenece a un Account |
| **Client** | `id`, `accountId`, `firstName`, `lastName`, `email`, `phone`, `notes` (alergias/preferencias), `isArchived` | Pertenece a un Account (1:N); tiene muchas citas (1:N) |
| **Service** | `id`, `accountId`, `name`, `description`, `priceCents`, `durationMinutes`, `isActive` | Pertenece a un Account (1:N); aparece en muchas citas (N:M vía la tabla puente) |
| **Appointment** | `id`, `accountId`, `clientId`, `staffUserId`, `startsAt`, `endsAt`, `status` (`SCHEDULED`/`COMPLETED`/`CANCELLED`/`NO_SHOW`), `cancellationReason`, `priceCentsTotal` | Pertenece a un Client (1:N) y opcionalmente a un StaffUser (1:N); tiene muchas filas AppointmentService (1:N) |
| **AppointmentService** (puente) | `appointmentId` + `serviceId` (PK compuesta) | Resuelve el N:M entre Appointment y Service |
| **PasswordResetToken** | `id`, `staffUserId`, `tokenHash` (único), `expiresAt` (1 hora), `usedAt` | Pertenece a un StaffUser (1:N) |

**Decisiones de relaciones que tomó el equipo:**

- **`Account` es el límite de aislamiento.** Toda tabla con alcance de tenant lleva `accountId`, y
  cada query la toma de la sesión — nunca de la entrada del usuario. Un registro de otro estudio
  devuelve `404`, no `403`, así que los IDs no se pueden sondear.
- **Appointment ↔ Service es muchos-a-muchos** mediante `AppointmentService` con PK compuesta, de
  modo que una reserva puede cubrir varios servicios y es imposible seleccionar duplicados.
- **`Appointment.endsAt` es derivado** del `durationMinutes` de los servicios elegidos, y
  **`priceCentsTotal` es un snapshot** del momento de la reserva, así que editar el precio de un
  servicio después nunca reescribe el historial.
- **Política de borrado:** borrar un estudio hace cascada. Un cliente o servicio referenciado por
  citas está protegido a nivel de schema con `Restrict`, y la API lo maneja archiviando
  (`isArchived` / `isActive = false`) y devolviendo `meta.archived` con una explicación, para que la UI
  pueda avisar y pedir confirmación en vez de exponer un error de constraint. Un servicio sin
  referencias se borra de verdad. Quitar un miembro del personal deja sus citas con `SetNull`, es
  decir, sin asignar en vez de desaparecer.
- **El dinero son centavos enteros**, nunca float, así que los totales nunca derivan por un error de
  redondeo. **Los timestamps son actualmente `timestamp(3)` sin zona horaria.** Cada `Account`
  guarda su propia zona IANA y las citas se renderizan a través de ella, pero los valores
  almacenados son naive: el calendario de citas del próximo sprint debe convertir el límite del día
  del estudio a esa zona antes de poder correr solapamientos con seguridad. Está registrado como el
  primer seguimiento de la semana 04, no descrito como ya correcto.
- **Índices** en `StaffUser.email` (único), `Client(accountId, lastName)`,
  `Service(accountId, isActive)`, `Appointment(accountId, startsAt)`,
  `Appointment(staffUserId, startsAt, endsAt)` y `Appointment(clientId, startsAt)`.

**Integridad referencial de un vistazo** — cada clave foránea del schema y qué pasa cuando se borra
la fila padre:

| Tabla hija | Padre | `onDelete` | Por qué |
|---|---|---|---|
| `StaffUser`, `StaffInvite`, `Client`, `Service`, `Appointment` | `Account` | `Cascade` | Un estudio es dueño de sus registros; borrar el estudio se los lleva |
| `Appointment` | `Client` | `Restrict` | El historial de citas es la razón por la que se conserva, así que la API archiva en vez de fallar |
| `AppointmentService` | `Service` | `Restrict` | Un servicio nombrado en una reserva no puede desaparecer de ella |
| `AppointmentService` | `Appointment` | `Cascade` | Las filas del puente no tienen sentido sin su cita |
| `Appointment` | `StaffUser` | `SetNull` | Quitar personal deja la cita sin asignar en vez de borrarla |
| `StaffInvite` | `StaffUser` | `SetNull` | La invitación queda como registro de quién la aceptó |
| `PasswordResetToken` | `StaffUser` | `Cascade` | Un enlace de restablecimiento no significa nada sin la cuenta que restablece |

### Planificación de diseño

**Dirección de marca:** *calma, cálida, precisa* — una herramienta que quita la ansiedad de los
dobles bookings, dirigida a profesionales independientes que trabajan desde el teléfono entre citas.
Lema: "Your studio, beautifully organised."

**Paleta de colores** — definida una vez como tokens `@theme` de Tailwind v4 en
`src/app/globals.css` y consumida en todas partes, más pares de estado semánticos:

| Rol | Escala |
|---|---|
| **Brand — Glow Rose** (acciones primarias, nav activa, focus rings) | `50 #FDF2F7` · `100 #FAE6EF` · `200 #F4C9DC` · `300 #EBA3C1` · `400 #DE74A1` · `500 #CE4C81` · **`600 #B4346A` (botón primario, enlaces — 5.84:1 sobre blanco)** · `700 #932A57` (hover) · `800 #762449` · `900 #5F213D` |
| **Accent — Studio Gold** (resaltes, marcador de "ahora") | `100 #FAEECF` · `300 #EAC062` · `500 #C9861F` · `700 #855115` |
| **Neutral — Warm Stone** (superficies, texto, bordes) | `50 #FAF8F7` · `100 #F3EFEE` · `200 #E6DEDA` (bordes) · `300 #D2C7C2` · `400 #A99C97` · `500 #857874` · `600 #6B605C` (texto secundario, 6.1:1) · `700 #574E4B` · `800 #3B3533` · `900 #221E1D` · `950 #14100F` (fondo de página) |
| **Semánticos** | success `#2F7D57` / `#E8F5EE` · warning `#B45309` / `#FDF3E3` · danger `#C0342B` / `#FBEBEA` · info `#2F6F8F` / `#E9F2F7` |
| **Mapeo de estado de cita** | Scheduled → info · Completed → success · Cancelled → danger · No-show → warning. Siempre con etiqueta de texto, nunca solo color |

**Tipografía:**

| Rol | Familia | Tratamiento |
|---|---|---|
| Cuerpo / UI | **Geist Sans** (`next/font`) | Peso variable; `body` 16/24, `body-sm` 14/20, `label` 13/16 |
| Display / títulos de página | **Fraunces** (`next/font`, variable) | `h1` `clamp(1.75rem, 3vw, 2rem)`/1.2 a peso 600; `display` `clamp(2.5rem, 6vw, 3.5rem` solo para el hero de la landing |
| Horarios y precios | Geist Sans con `tabular-nums` | Evita que los huecos del calendario y los precios se muevan al cambiar los dígitos |

**Convenciones de layout y espaciado:**

- **Escala base de 4px** con los pasos por defecto de Tailwind, aplicada semánticamente: gutter de
  página `px-4 sm:px-6 lg:px-8` · `space-y-4` entre campos de formulario · `gap-6` entre tarjetas ·
  `space-y-8` entre secciones de página · `p-4 sm:p-6` de padding en tarjetas · `gap-2` entre un icono
  y su etiqueta · `gap-1 p-2` dentro de bloques densos del calendario.
- **App shell:** CSS grid — sidebar fijo `w-64` en `lg` y superior, topbar sticky `h-16`, contenido
  con scroll independiente, contenido limitado a `max-w-7xl`.
- **Mobile-first.** Por debajo de `lg` el sidebar se colapsa tras un hamburger en el topbar, usando
  un Radix Dialog para que el foco quede atrapado y `Escape` lo cierre. Las tablas pasan a tarjetas
  apiladas en pantallas pequeñas para que nada se desplace horizontalmente. 375px es el objetivo de
  diseño principal.
- **Radios y elevación:** `0.5rem` en controles, `1rem` en tarjetas, `rounded-full` en badges;
  `shadow-xs` en reposo → `shadow-sm` en hover → `shadow-md` en popovers y diálogos.
- **Movimiento:** 150ms en hover, 200ms en paneles, 300ms en fundidos de página, todos `ease-out` y
  envueltos en variantes `motion-reduce`.
- **Librería de UI compartida:** el equipo acordó **shadcn/ui** como librería de la semana 04, sobre
  los tokens de Tailwind v4, para que ambos miembros instalen primitivos idénticos. Dos cosas son
  huecos honestos y no completados al momento de la entrega: solo existen **4 de los 14 primitivos
  planificados** — `button`, `card`, `input`, `label` en `src/components/ui/` — y **`components.json`
  aún no se ha añadido**, así que el objetivo de "ambos miembros instalan las mismas versiones" todavía
  no lo impone ninguna herramienta. Los 10 primitivos planificados restantes son `textarea`, `select`,
  `dialog`, `alert-dialog`, `dropdown-menu`, `table`, `badge`, `calendar`, `popover` y `skeleton`. Siete
  componentes compartidos (`confirm-dialog`, `empty-state`, `form-field`, `page-header`, `spinner`,
  `status-badge`, `submit-button`) ya cubren el trabajo de diálogo, formulario, estado y estado vacío
  que varios de esos primitivos suministrarían.
- **Arquitectura de componentes:** dos grupos de rutas (`(auth)`, `(app)`) más `src/proxy.ts` para la
  intercepción de auth. La arquitectura acordada en la semana 03 planifica **8 componentes
  layout/shared, ~19 componentes feature** entre `auth`/`dashboard`/`calendar`/`clients`/`services`/
  `staff` **y 14 primitivos UI**, unos 40 en total. Al momento de la entrega hay 22 construidos — 3 de
  layout, 7 compartidos, 8 feature y 4 primitivos UI — y **11 se usan en dos o más páginas** (`card`
  en 10, `button` en 8, `page-header` en 7, `input`/`empty-state`/`form-field` en 6 cada uno), lo cual
  ya supera el requisito de "al menos 5 componentes usados en múltiples páginas".

*(Subir `docs/images/w03-component-hierarchy.png` como imagen del diagrama de jerarquía de
componentes.)*

---

## SECCIÓN 4 — W03 Team: Code Review Report

**URL del Pull Request revisado:**
https://github.com/ivanchulde/sacrament-meetings/pull/1

- **Repositorio (del compañero asignado):** https://github.com/ivanchulde/sacrament-meetings
- **Título del PR:** Complete Sacrament Meeting Planner
- **Rama:** `peer-code-review` → `main` · 4 commits · 19 archivos cambiados · +846 / −97
- **Preview deployment:** Vercel desplegó la rama correctamente; todos los checks pasaron, sin
  conflictos con la rama base
- **Comentario de review enviado en el pull request** (764 caracteres, 24 de septiembre de 2026):

> Overall, the implementation meets the main requirements of the checklist. The TypeScript data model
> is properly defined, there are five complete meeting records, and no `any` type is used in the
> modified files. The reusable components are present, and `MeetingDetail` displays the required
> meeting information. The routing, layouts, API routes, and typed data fetching are also implemented
> correctly.
>
> One area I would recommend checking is the cleanup of the original Next.js template code. The diff
> shows some old imports and template content in `app/layout.tsx` and `app/page.tsx`. If any of that
> code remains in the final files, it should be removed to avoid unused imports and unnecessary code.
> Other than that, the implementation follows the checklist well.

**Qué revisé:** el modelo de datos en TypeScript y si los cinco registros de reunión están completos,
que ningún `any` se colara en los archivos modificados, que los componentes reutilizables estén
realmente compartidos entre páginas, que `MeetingDetail` renderice todos los campos requeridos, y que
el routing, los layouts, las API routes y el data fetching tipado estén implementados correctamente.

**El único hallazgo accionable:** código de plantilla de `create-next-app` sobrante en
`app/layout.tsx` y `app/page.tsx` — imports viejos y boilerplate que debería eliminarse para que los
archivos finales no arrastren imports sin usar.

**Notas de la revisión del deployment:** probé el preview de Vercel de esa misma rama en PC / Chrome.
No se encontraron problemas en ninguna ruta: `/api/meetings`, `/api/meetings/1`, `/meetings`,
`/meetings/1`, `/meetings/current`, y el layout de `/meetings`.

---

## Checklist antes de enviar

- [ ] Copiar la Sección 1 en el primer text entry box
- [ ] Copiar la Sección 2 en el segundo, y subir la captura de VS Code
- [ ] Copiar la Sección 3 en el tercero, y subir el diagrama del modelo de datos
- [ ] Copiar la Sección 4 en el cuarto
- [ ] Verificar que las tres URLs abren sin iniciar sesión
- [ ] Quitar las líneas `(Subir ...)` una vez que hayas adjuntado cada imagen
- [ ] Reemplazar cualquier `[nombre]` por el nombre de quien entrega
