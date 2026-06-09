# Cheatsheet · Git nativo (merge) vs. Pull Requests de GitHub (`gh`)

> **Idea rectora: un *merge* y un *PR* son operaciones independientes.**
> - El **merge** es **git nativo**: fusiona ramas en tu repo local; GitHub no se entera hasta que haces `push`.
> - El **PR** es un objeto **de GitHub** (una solicitud de revisión/integración) que vive en el servidor; no cambia tu repo local.
> - Puedes **mergear sin PR**, y **cerrar un PR sin mergear**. No son lo mismo.

---

## Sección 1 · Pull Requests (GitHub · vía `gh`)

**Qué es:** una propuesta de integrar la rama `HEAD` en la rama `BASE`, gestionada en GitHub. Sirve para revisión/registro; **por sí solo no toca tu código local**.

**Reglas que aprendimos:**
- **Cerrar ≠ mergear.** `gh pr close` descarta la propuesta **sin fusionar nada**.
- **Hace falta diferencia.** Sólo se puede crear un PR si `HEAD` tiene commits que no están en `BASE`. Si la rama **ya está mergeada** → error `No commits between BASE and HEAD`.
- **El orden importa:** si quieres dejar registro de PR, **crea el PR ANTES del merge**. Después del merge ya no se puede.

**Comandos:**
```bash
gh pr create --base master --head dev/mi-rama \
     --title "Título" --body-file cuerpo.md     # crear
gh pr view 8 --json number,state,headRefName     # consultar
gh pr close 8                                    # cerrar SIN borrar rama
gh pr close 8 --delete-branch                    # cerrar Y borrar rama
gh pr merge 8 --merge | --squash | --rebase      # mergear DESDE GitHub
```

**Autenticación de `gh` (distinta de git):**
- `gh` necesita su propio login (`gh auth login`); el *credential helper* de git **no** lo loguea.
- Si `gh` no está logueado pero git sí puede pushear, reutiliza la credencial de git como token:
  ```bash
  GH_TOKEN=$(printf "protocol=https\nhost=github.com\n\n" \
       | git credential fill | sed -n 's/^password=//p')
  GH_TOKEN="$GH_TOKEN" gh pr create ...
  ```
- En Windows, si `gh` no está en el PATH: `& "C:\Program Files\GitHub CLI\gh.exe" ...`

---

## Sección 2 · Git nativo (merge) y su relación con GitHub

**El merge real** (lo que de verdad mete la rama en `master`):
```bash
git stash push -m wip -- ruta/fichero   # 1. árbol limpio (o commitea) antes de cambiar de rama
git checkout master                     # 2. sitúate en la rama destino
git merge --no-ff dev/mi-rama \         # 3. fusiona (--no-ff = commit de merge explícito)
     -m "Merge dev/mi-rama: ..."
git push origin master                  # 4. SUBE el resultado a GitHub  ← clave
git checkout dev/mi-rama && git stash pop # 5. vuelve y recupera tu trabajo
```
- `--no-ff` crea un **commit de merge** (deja constancia de la integración, convención del repo).
  *Alternativa:* fast-forward (sin commit de merge) si la rama es `master`+N lineal.

**Relación con GitHub:**
- GitHub solo "ve" lo que **pusheas**. El merge local **no aparece** en GitHub hasta `git push`.
- **Merge local + push = `master` actualizado en GitHub, sin ningún PR.**
- Si había un PR **abierto** de esa rama, al pushear el merge GitHub suele marcarlo **"Merged"** al detectar los commits en `BASE`. Si lo habías **cerrado antes** (como el #8), queda **"Closed"**, no "Merged".
- `gh pr close` **no hace nada** en tu git local ni en `master`.

**Conservar la rama:** ni el merge ni `gh pr close` (sin `--delete-branch`) la borran. Para borrarla:
```bash
git branch -d dev/mi-rama                 # local
git push origin --delete dev/mi-rama      # remota
```

---

## Tabla resumen — qué hace cada operación

| Acción | ¿Cambia `master` local? | ¿Sube a GitHub? | ¿Afecta al PR? |
|---|:--:|:--:|:--:|
| `git merge --no-ff` | **sí** | no (hasta push) | no |
| `git push origin master` | no (sube lo ya hecho) | **sí** | lo marca *merged* si seguía abierto |
| `gh pr create` | no | no | **crea** el PR |
| `gh pr close` | no | no | **cierra** (sin fusionar) |
| `gh pr merge` | — | sí (lo hace `gh`) | **mergea + cierra** |

---

## Lo que pasó en esta sesión (ejemplo real)

- **Rama A `dev/ddf-wizard-alpha`:** `commit` → `push` → `gh pr create` (#8) → `gh pr close 8` (sin mergear) → `git merge --no-ff` a `master` → `push`.
  → El PR quedó **Closed**, pero el trabajo **sí entró** en `master` por el merge nativo posterior. (PR y merge, independientes.)
- **Rama B `dev/ddf-app-template`:** `git merge --no-ff` directo a `master` → `push`. Al intentar `gh pr create` **después**, GitHub respondió `No commits between master and dev/ddf-app-template` → ya estaba integrada, no había nada que proponer.

> Moraleja: **el merge integra; el PR documenta/revisa.** Si quieres ambas cosas con su registro en GitHub, haz el PR **primero** y mergéalo (o ciérralo) **después**.

---

*Referencia derivada de las operaciones de la sesión dev DDF-Wizard · 2026-06-09.*
