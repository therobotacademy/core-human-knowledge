"use strict";
// docx-apm-utils.js — Alias del motor curso-neutro `_shared/docx-core.js`.
//
// La lógica (paleta COIIAOC v1.1, helpers de párrafo/bloque/tabla, fábrica makeDoc)
// vive ahora en `.claude/skills/_shared/docx-core.js`. Este fichero se mantiene por
// COMPATIBILIDAD: los gen_*.js del curso APM hacen `require('./docx-apm-utils')`.
//
// Para un curso nuevo, requerir directamente `../_shared/docx-core` en vez de duplicar.
module.exports = require("../_shared/docx-core");
