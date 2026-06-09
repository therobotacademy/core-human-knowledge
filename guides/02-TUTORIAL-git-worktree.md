# Tutorial — `git worktree`

> Cómo tener **varias ramas abiertas a la vez en carpetas distintas**, compartiendo un único repositorio.
> Escrito sobre el caso real de este repo (`master` con LAB4 + rama `skill/prueba-validacion`), en Windows + PowerShell.

---

## 1. El problema que resuelve

Con git "normal" solo puedes tener **una rama** checada en tu carpeta a la vez. Si estás en `skill/prueba-validacion` y necesitas mirar (o ejecutar) los ficheros de `master`, tienes que:

- `git switch master` → pero entonces **pierdes de vista** tu trabajo de PV (y si tienes cambios sin commitear, te toca `git stash`).
- o clonar el repo otra vez en otra carpeta → pero eso **duplica** el `.git` entero y se desincroniza.

`git worktree` resuelve esto: **un mismo repositorio, varios directorios de trabajo**, cada uno con una rama distinta checada, todos compartiendo la misma base de objetos y refs.

```
                ┌──────────────────────────────┐
                │   repositorio (.git único)    │
                │  commits · ramas · tags · stash│
                └───────────────┬───────────────┘
              ┌─────────────────┼──────────────────┐
              ▼                 ▼                  ▼
   carpeta principal     ../LAB4-master      ../revision-pr
   rama: skill/pv        rama: master        rama: labs/1
   (tu trabajo)          (referencia LAB4)   (revisar otra cosa)
```

Es **un solo repo** visto desde tres carpetas, cada una "congelada" en una rama diferente.

---

## 2. Modelo mental (lo que comparten y lo que no)

| Se **comparte** entre worktrees | Es **propio** de cada worktree |
| --- | --- |
| Historial de commits, ramas, tags | El directorio de trabajo (los ficheros en disco) |
| El `stash` (es global) | El `HEAD` (qué rama/commit tiene checada) |
| `remotes` y la mayoría de `config` | El índice (staging area) |
| Los hooks de `.git/hooks` | Ficheros **no rastreados** e **ignorados** (`.tmp/`, `node_modules/`, PDFs de QA…) |

**Consecuencia práctica clave:** los ficheros ignorados/temporales **no viajan** entre worktrees. Si en la carpeta principal tienes `.tmp/` con scripts de build o `node_modules/`, en `../LAB4-master` **no estarán** — cada worktree parte limpio salvo lo versionado. Esto suele ser una ventaja (aíslas builds), pero conviene saberlo.

**La regla de oro:** una rama solo puede estar checada en **un** worktree a la vez. Git te impedirá checar `master` en dos sitios — y está bien, porque evita que edites la misma rama desde dos carpetas y te pises.

---

## 3. El caso de este repo

Situación: estás en `skill/prueba-validacion` y quieres **consultar los ficheros de LAB4 que viven en `master`** sin mezclarlos en tu rama de trabajo.

```powershell
# Estás en la carpeta principal, rama skill/prueba-validacion
git worktree add ..\LAB4-master master
```

Esto crea la carpeta hermana `..\LAB4-master` con `master` checado. Ahora:

- **Carpeta principal** (`46-UNIPRO-...`) → rama `skill/prueba-validacion`, tu trabajo del skill.
- **`..\LAB4-master`** → rama `master`, con `raw-unipro/LABORATORIOS/LAB4.../materiales/`, `intuitions.md`, `wiki/lab4-guia/`, etc., para consultar o ejecutar.

Cuando termines de consultar, la quitas (sección 6). El trabajo de PV nunca se "ensucia" con el contenido de LAB4.

> En este repo ya hicimos la **Opción A** (merge de `master` en la rama PV), así que LAB4 ya está disponible en la carpeta principal. El worktree (Opción B) es la alternativa para cuando **no** quieras esa mezcla — ver la comparación en §7.

---

## 4. Comandos esenciales

### Crear un worktree

```powershell
# Rama EXISTENTE en una carpeta nueva
git worktree add ..\LAB4-master master

# Rama NUEVA creada al vuelo (equivale a git switch -c)
git worktree add -b hotfix/typo ..\hotfix master
#  └ crea la rama hotfix/typo a partir de master, en ../hotfix

# Solo inspeccionar un commit/rama SIN ocupar la rama (HEAD desacoplado)
git worktree add --detach ..\inspeccion v1.0
#  útil para mirar/compilar algo puntual sin "reservar" la rama
```

### Listar

```powershell
git worktree list
# C:/.../46-UNIPRO-...        0964670 [skill/prueba-validacion]
# C:/.../LAB4-master          83cdd35 [master]
```

### Quitar (cuando ya no lo necesitas)

```powershell
git worktree remove ..\LAB4-master        # debe estar limpio
git worktree remove --force ..\LAB4-master # si tiene cambios sin guardar
```

### Limpiar referencias huérfanas

Si borraste la carpeta **a mano** (con el explorador) en vez de con `remove`, git se queda con un registro fantasma. Lo limpias con:

```powershell
git worktree prune
```

### Otros

```powershell
git worktree move ..\LAB4-master ..\nueva-ubicacion   # mover de sitio
git worktree lock ..\LAB4-master      # evita que prune lo borre (p. ej. en un USB)
git worktree unlock ..\LAB4-master
```

---

## 5. Anatomía (para entender qué pasa por dentro)

- La carpeta principal tiene el `.git/` real (la base de datos del repo).
- Cada worktree enlazado **no** tiene un `.git/` carpeta, sino un **fichero** `.git` con una línea `gitdir: .../.git/worktrees/<nombre>`.
- Dentro de `.git/worktrees/<nombre>/` git guarda el `HEAD`, el índice y la config propia de ese worktree.

No necesitas tocar nada de eso, pero saberlo explica por qué **no se duplica** el historial (a diferencia de un `git clone`): solo se añade un puntero ligero.

---

## 6. Ciclo de vida típico (de principio a fin)

```powershell
# 1. Crear el worktree de referencia
git worktree add ..\LAB4-master master

# 2. Trabajar: en la carpeta principal sigues con PV;
#    cuando necesites LAB4, abres ..\LAB4-master (otra ventana del editor)

# 3. (opcional) actualizarlo si master avanza
cd ..\LAB4-master
git pull            # o git fetch + git merge
cd ..\46-UNIPRO-... # vuelves a tu carpeta de PV

# 4. Al terminar, eliminarlo
git worktree remove ..\LAB4-master
```

---

## 7. ¿Worktree o merge? (Opción B vs Opción A)

Las dos formas de "trabajar en PV teniendo LAB4 a mano":

| | **Opción A — merge** (`git merge master`) | **Opción B — worktree** |
| --- | --- | --- |
| Qué hace | Trae el contenido de `master` **dentro** de la rama PV | Monta `master` en **otra carpeta** |
| Resultado | Una sola carpeta con LAB4 + PV juntos | Dos carpetas, ramas separadas |
| LAB4 acaba… | **versionado en PV** (hasta que mergees a master) | solo como **referencia**, fuera de los commits de PV |
| Historia | crea un commit de merge | no toca la historia |
| Cuándo conviene | quieres de verdad incorporar lo de master a tu rama | LAB4 es **solo consulta** y quieres PV "limpia" |
| Coste | resolver conflictos una vez | gestionar una carpeta extra |

Regla rápida: **¿necesito que el contenido de master forme parte de mi rama?** → A (merge). **¿solo lo quiero ver/ejecutar al lado?** → B (worktree).

---

## 8. Worktree frente a otras alternativas

| Herramienta | Para qué | Por qué worktree puede ser mejor |
| --- | --- | --- |
| `git switch` | cambiar de rama en la misma carpeta | switch te obliga a **abandonar** la rama actual; worktree las tiene **a la vez** |
| `git stash` | guardar cambios a medias | con worktree no necesitas stash: cada rama vive en su carpeta |
| `git clone` (2.ª copia) | otra copia del repo | clone **duplica** `.git` y se desincroniza; worktree comparte uno solo |

Casos de uso habituales del worktree:
- **Referencia en paralelo** (nuestro caso: LAB4 mientras trabajas en PV).
- **Hotfix urgente**: arreglar un bug en `master` sin tocar tu feature a medias.
- **Revisar un PR**: checar la rama de otro en una carpeta aparte y ejecutarla.
- **Builds/tests largos**: lanzar la suite en un worktree mientras sigues programando en otro.

---

## 9. Notas para Windows + PowerShell (este repo)

- **Rutas con espacios:** este repo cuelga de `...\Mi unidad\__Active-AGENTS\...`. Si la ruta del worktree lleva espacios, **entre comillas**:
  ```powershell
  git worktree add "..\LAB4 master" master
  ```
  (Mejor evita espacios en el nombre del worktree: usa `..\LAB4-master`.)
- **Pon el worktree FUERA del repo**, como hermano (`..\nombre`), nunca dentro de la carpeta del repo (git intentaría rastrearlo y se lía).
- **Google Drive:** la carpeta está sincronizada con Drive. Un worktree hermano (`..\LAB4-master`) **también** se sincronizará. No es un problema, pero genera tráfico de sync; para algo efímero, considera crearlo en una ruta local fuera de Drive (p. ej. `C:\tmp\LAB4-master`):
  ```powershell
  git worktree add C:\tmp\LAB4-master master
  ```
- **Ficheros de bloqueo de Office (`~$*.docx`) y `.tmp/`:** recuerda que **no** se comparten entre worktrees (son ignorados/no rastreados). Cada carpeta tiene los suyos.

---

## 10. Errores comunes y cómo evitarlos

| Síntoma | Causa | Solución |
| --- | --- | --- |
| `fatal: 'master' is already checked out at ...` | intentas checar en dos sitios la misma rama | usa otra rama, o `--detach` para solo inspeccionar |
| Borré la carpeta a mano y `worktree list` aún la muestra | git no se enteró | `git worktree prune` |
| `remove` se queja de cambios sin guardar | el worktree está sucio | commitea/descarta, o `git worktree remove --force` |
| No veo mi `node_modules` / `.tmp` en el nuevo worktree | son ignorados, no se comparten | reinstala/regenera en ese worktree si los necesitas |
| El worktree quedó "detached HEAD" | lo creaste con un commit/tag, no una rama | normal para inspección; crea rama con `git switch -c` si vas a commitear |

---

## 11. Chuleta

```powershell
git worktree add  ..\dir <rama>        # nueva carpeta con una rama existente
git worktree add -b <rama> ..\dir base # crear rama nueva + carpeta
git worktree add --detach ..\dir <ref> # inspección sin ocupar rama
git worktree list                      # ver todos
git worktree remove ..\dir             # quitar (limpio)
git worktree remove --force ..\dir     # quitar (con cambios)
git worktree prune                     # limpiar fantasmas
git worktree move ..\dir ..\otro       # mover
git worktree lock / unlock ..\dir      # proteger de prune
```

**En una frase:** `git worktree` te da varias "ventanas" sobre el mismo repositorio, cada una en una rama distinta y en su propia carpeta, sin clonar ni hacer malabares con `stash` — ideal para tener `master` (referencia de LAB4) abierto al lado de tu rama de trabajo `skill/prueba-validacion`.
