# Tutorial — `git push --force-with-lease`

> Cómo reescribir historia ya publicada **sin machacar** el trabajo de un compañero (o de una sesión paralela).
> Fundamentado en el caso real de este repo: el hook `push-prompt-log.ps1`, que enmienda el mismo commit diario y debe force-pushear — pero nunca sobrescribir lo que otro publicó mientras tanto.

---

## 1. El problema que resuelve

Un push normal solo acepta **fast-forward**: el tip remoto debe ser ancestro de lo que mandas (solo añades commits encima). En cuanto **reescribes** historia — `git commit --amend`, `git rebase`, `git reset` — tu commit nuevo ya no desciende del tip remoto, y git se niega:

```
$ git push
 ! [rejected]  master -> master (non-fast-forward)
error: failed to push some refs
hint: Updates were rejected because the tip of your current branch is behind...
```

Para avanzar necesitas forzar. La pregunta es **cuál** de las dos fuerzas usar.

---

## 2. Las tres opciones (y por qué solo una es segura)

| Comando | Comprobación de seguridad | Riesgo |
|---|---|---|
| `git push` | Solo fast-forward | No sirve tras reescribir historia |
| `git push --force` | Ninguna | **Destruye** commits que no hayas visto |
| `git push --force-with-lease` | Compara con tu último `fetch` | Rechaza si alguien movió el remoto |

> **Regla de oro:** nunca escribas `--force`. Escribe `--force-with-lease`.

---

## 3. Cómo funciona el "lease" (fianza)

Cuando haces `git fetch`, git registra dónde estaba el remoto en tu **ref de seguimiento** (`origin/master`). El lease es la promesa *"creo que el remoto sigue en el commit X"*. Al hacer push, git verifica esa promesa:

- **Remoto sigue en X** (lo que viste la última vez) → el push **se acepta**.
- **Remoto avanzó a Y** (alguien empujó algo) → el lease **se rompe**, el push **se rechaza** sin destruir nada.

```
$ git push --force-with-lease
 ! [rejected]  master -> master (stale info)
error: failed to push some refs
```

`stale info` = el lease funcionó. Nadie perdió trabajo.

---

## 4. Por qué `--force` es peligroso

```
Tú:        hiciste fetch de master en commit A, enmendaste → A'
Mientras:  una sesión paralela publicó B encima de A
Tú:        git push --force   # remoto era A→B, ahora es A'
                              # commit B DESAPARECE. Silenciosamente.
```

Nunca viste `B`. `--force` lo borró. En un `master` compartido así es como se pierde trabajo.

---

## 5. Cuándo necesitas un force push

Cada vez que **reescribes un commit ya publicado**:

- `git commit --amend` sobre un commit ya pusheado (exactamente lo que hace el hook de este repo)
- `git rebase` de una rama ya publicada (squash, reword, reorder, drop)
- `git reset --hard <anterior>` y re-push

**No** necesitas force para trabajo normal (añadir commits nuevos = fast-forward).

---

## 6. El caso real de este repo

`push-prompt-log.ps1` mantiene **un commit por día** (`c1 daily <fecha>`). El primer prompt del día lo crea; los posteriores lo **enmiendan** (reescriben un commit ya publicado) y vuelven a pushear:

```powershell
if ($head -eq $msg) {
    # El commit de hoy está en HEAD: pliega los nuevos prompts.
    git commit --amend --no-edit *>$null
    # --force-with-lease aborta con seguridad si una sesión paralela o el
    # evaluador en la nube movió origin desde nuestro último fetch.
    git push --force-with-lease *>$null
} else {
    git commit -m $msg *>$null   # primer commit del día
    git push *>$null             # push normal: solo fast-forward
}
```

Por qué el lease es imprescindible aquí:

- **Sesiones paralelas.** Varios procesos Claude comparten `master`. Dos amend-and-push en carrera son inevitables. El lease hace que **el perdedor sea rechazado** (y reintente) en vez de **borrar al ganador**.
- **El evaluador en la nube.** La rutina nocturna hace commit `eval: …` y pushea a `master`. Si aterriza entre nuestro amend y nuestro push, el lease lo detecta.

El modo de fallo es suave: al recibir un lease roto el hook simplemente **sale** (el commit queda local); el siguiente `Stop` reintenta cuando la copia local esté al día.

---

## 7. Receta paso a paso (manual)

Enmendaste un commit publicado y necesitas actualizar el remoto:

```bash
# 1. Asegura que tu ref de seguimiento refleja la realidad.
git fetch origin

# 2. Comprueba que no vas a pisarte nada nuevo:
git log --oneline origin/master..HEAD     # tus commits que no están en remoto
git log --oneline HEAD..origin/master     # commits remotos que no están en los tuyos  ← quieres VACÍO

# 3. Si la segunda línea está vacía, pushea con seguridad:
git push --force-with-lease

# 4. Si NO estaba vacía, integra primero:
git pull --rebase        # o merge
git push --force-with-lease
```

---

## 8. Gotchas

- **No hagas `git fetch` inmediatamente antes de un `--force-with-lease` sin inspeccionar.** Hacer fetch refresca el lease al nuevo valor remoto — ya no puede detectar el cambio. Inspecciona siempre tras el fetch (receta §7) o ancla el lease explícitamente:
  ```bash
  git push --force-with-lease=master:<sha-que-esperas>
  ```
- **Protege la ref, no el árbol de trabajo.** `--force-with-lease` no sabe nada de cambios locales sin commitear; solo compara el tip de rama.
- **Opción más fuerte (git moderno):** `git push --force-with-lease --force-if-includes` también verifica que tu historial local **contenga** los commits remotos que vas a sobrescribir — cierra el hueco de "hice fetch pero no mergé".
- **Hooks y CI** deben usar siempre `--force-with-lease`, nunca `--force` — no hay ningún humano mirando que pueda notar una sobrescritura silenciosa.

---

## 9. Chuleta

```bash
# Situación normal (solo añades commits)
git push

# Enmendaste/rebasaste un commit ya publicado
git push --force-with-lease

# Lease rechazado (stale info) → integra y reintenta
git fetch origin
git rebase origin/master     # o merge
git push --force-with-lease

# Anclar el tip remoto esperado (máxima precisión)
git push --force-with-lease=master:<sha>

# Opción más segura en git moderno
git push --force-with-lease --force-if-includes

# NUNCA
git push --force
```

---

*Complementario a `02-TUTORIAL-git-worktree.md`. Uso real en `artifacts/Daily-Prompt-Evaluator/push-prompt-log.ps1`.*
