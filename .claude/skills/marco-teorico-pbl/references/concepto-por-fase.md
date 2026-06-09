# Mapa de conceptos teóricos por sesión — COIIAOC Parte 2

Cada sesión tiene 4 conceptos asignados (A, B, C, dominio transferible).
Lee este archivo en el Paso 2 del workflow.

---

## II1 · Ingesta Multicanal · PRDA: Percibir

**Concepto A — PEAS Framework**
- Definición operativa de agente inteligente
- Performance · Environment · Actuators · Sensors
- Por qué PEAS antes de escribir código: evita diseñar el sensor equivocado
- Referencia: Russell & Norvig, AIMA 4ª ed., Cap. 2, Fig. 2.1

**Concepto B — Taxonomía del entorno**
- Dimensiones: Observable | Determinista | Episódico | Dinámico | Discreto
- VERBEX es: parcialmente observable, determinista desde las reglas, episódico, dinámico, discreto
- Consecuencia: entorno episódico + determinista → capa de percepción sin LLM es suficiente

**Concepto C — Clasificador de percepts**
- Función de percepción formal: f: percept → representación interna
- La heurística de canal (helionlink → portal → email) es un clasificador formal
- El JSON de 7 campos es la representación interna; II2–II4 nunca ven el texto original

**Dominio transferible (Slide D)**
- Atención al cliente multicanal (email, WhatsApp, formulario web, redes sociales)
- Mismo patrón: clasificar la fuente antes de clasificar el problema

---

## II2 · Lógica Determinista · PRDA: Razonar

**Concepto A — Sistemas de reglas de producción**
- Knowledge-Based Systems (KBS): representación explícita del conocimiento
- Regla de producción: condición → acción
- Por qué importa vs LLM: auditabilidad, reproducibilidad, versionabilidad
- Referencia: Hayes-Roth, Waterman & Lenat (1983); CLIPS; OPS5

**Concepto B — Taxonomía de tipos de agentes**
- Reactivo simple | Reactivo basado en modelo | Basado en objetivos | Basado en utilidad
- VERBEX II2 está en nivel 2: basado en modelo (catálogo + clientes + cache)
- El "modelo" en II2 = 3 estructuras in-memory; en II4 se amplía a Sheets

**Concepto C — Autómata Finito Determinista (DFA)**
- COMPLETO → PARCIAL → ERROR como DFA formal
- Estados finitos, transiciones deterministas, estado inicial, estado absorbente
- Transiciones prohibidas: ERROR no remonta; por qué esto es correcto en AS9100
- R09 como anotación (flag), no como transición de estado

**Dominio transferible (Slide D)**
- Aprobación de crédito hipotecario: APTO → CONDICIONAL → DENEGADO
- DENEGADO es absorbente: ninguna regla posterior lo revierte sin intervención humana

---

## II3 · Capa Semántica · PRDA: Razonar (LLM)

**Concepto A — El problema de fundamentación simbólica (Symbol Grounding)**
- Por qué los sistemas de reglas no pueden leer texto libre sin interpretación
- Distribucionalismo semántico como base de por qué los LLMs extraen estructura
- Distinción: extracción (sacar lo que está) vs razonamiento (inferir lo que no está)
- La confusión extracción/razonamiento ES el antipatrón E4

**Concepto B — Taxonomía de errores LLM en extracción estructurada**
- Alucinación factual (inventa un PN) | Drift de formato (no respeta JSON) |
  Degradación por temperatura | Sensibilidad al prompt
- Cada tipo de error → mecanismo de mitigación en II3:
  temperature=0.1, parser anti-alucinación, few-shot, schema explícito

**Concepto C — Arquitectura SOUL + SKILL del system prompt**
- SOUL: identidad del agente (quién es, qué no hace, 7 reglas absolutas)
- SKILL: procedimiento de extracción (cómo extraer, tablas autoritativas, 5 ejemplos few-shot)
- Por qué separar identidad de procedimiento: el SOUL es estable entre versiones; el SKILL evoluciona
- Anatomía de un few-shot de calidad: INPUT complejo → OUTPUT validado → señal a observar

**Dominio transferible (Slide D)**
- Procesamiento de facturas de proveedor en sector seguros
- Texto libre → JSON estructurado → reglas de validación deterministas (mismos 3 pasos)

---

## II4 · Routing y Notificación · PRDA: Actuar

**Concepto A — Teoría de selección de acción y efectores**
- El problema de selección de acción: quién necesita saber qué y cuándo
- Fan-out paralelo como ejecución concurrente de efectores independientes
- Por qué no secuencial: latencia para AOG; fallo de un canal no bloquea los demás

**Concepto B — Taxonomía de canales de actuación**
- Persistencia (Sheets) | Alerta operacional (Telegram producción) |
  Alerta especialista (Telegram calidad) | Comunicación cliente (Email HTML)
- Cada canal: audiencia, latencia máxima, formato, condición de disparo
- Consecuencia de diseño: Switch por prioridad + Filter por certificación son independientes

**Concepto C — Idempotencia como propiedad de corrección**
- R09 no es "anti-duplicado": es idempotencia implementada
- Definición: f(f(x)) = f(x) — aplicar la operación N veces produce el mismo resultado que 1
- Por qué crítico en sistemas distribuidos y en pipelines con reintentos
- VERBEX: la fila en Sheets es idempotente; el email al cliente no lo es → diseño diferente

**Dominio transferible (Slide D)**
- Sistemas de notificación en plataformas de e-commerce (pedido confirmado →
  almacén + cliente + contabilidad + CRM en paralelo)

---

## II5 · Resiliencia · PRDA: Sistema

**Concepto A — Principios de sistemas resilientes**
- Fail-fast vs fail-safe: cuándo es mejor fallar rápido vs continuar con degradación
- Bulkhead pattern: aislar fallos para que no se propaguen (sub-workflows)
- Circuit breaker: dejar de intentar cuando el servicio externo está caído
- En VERBEX: Error Trigger global como circuit breaker + sub-workflows como bulkheads

**Concepto B — Taxonomía de fallos en pipelines de datos**
- Transitorio (retry resuelve) | Permanente (requiere intervención) | Silencioso (el más peligroso)
- VERBEX: onError: continueErrorOutput captura transitorio + permanente;
  la hoja Errores en Sheets expone los silenciosos

**Concepto C — Modularidad y cohesión**
- Acoplamiento vs cohesión: por qué el monolito de II4 se refactoriza en II5
- Principio: "Lo modular se opera; lo monolítico se rehace"
- Master + 4 sub-workflows: cada uno tiene un single responsibility
- Cómo evolucionar un agente sin reescribirlo desde cero

**Dominio transferible (Slide D)**
- Pipelines de datos en banca: ingesta → validación → enriquecimiento → distribución
  Cada etapa es un sub-pipeline independiente con su propio error handling

---

## II6 · MVP Completo · PRDA: Sistema (cierre)

**Concepto A — Definición operativa de MVP en sistemas agénticos**
- Criterios de aceptación como especificación ejecutable (no como lista de deseos)
- La diferencia entre "funciona en demo" y "es operable": monitorización, error recovery, audit trail
- F0–F7 como criterios de aceptación del Agente VERBEX: qué mide cada uno

**Concepto B — Observabilidad en sistemas agénticos**
- Los 3 pilares: logs (qué pasó), métricas (con qué frecuencia), trazas (por qué pasó)
- n8n tiene logs pero NO tiene: comparación de prompts, búsqueda semántica, evaluación
- Langfuse / LangSmith como capa de observabilidad específica para LLMs

**Concepto C — Gobernanza y compliance en IA industrial**
- AS9100: retención de datos 7 años, trazabilidad de decisiones, audit trail
- Por qué el JSON determinista + la hoja Errores + los logs de n8n juntos forman la evidencia
- El checklist de 48 ítems de II5 como artefacto de gobernanza

**Dominio transferible (Slide D)**
- Sistema de alertas en planta de manufactura farmacéutica: FDA 21 CFR Part 11
  mismos requisitos (audit trail, integridad de datos, trazabilidad de decisiones)

---

## Guía de derivación para sesiones no listadas

Si necesitas generar el marco teórico para una sesión que no está en este archivo,
usa este proceso:

1. **Identifica la fase PRDA dominante** de la sesión
2. **Pregunta**: ¿Qué principio de CS/Ingeniería de Sistemas justifica el diseño de esta sesión?
3. **El concepto A** responde: "Este diseño existe porque en la teoría de agentes, [X]"
4. **El concepto B** responde: "VERBEX es [tipo/dimensión Y] en la taxonomía de [X]"
5. **El concepto C** responde: "El mecanismo concreto que implementamos es formalmente un [Z]"
6. **El dominio transferible** es un sector completamente diferente (banca, seguros, logística, salud, retail)
   que usa exactamente el mismo patrón arquitectónico
