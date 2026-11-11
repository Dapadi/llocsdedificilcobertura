"""Extractor del listado "Llocs de difícil cobertura convocats en el procediment".

El PDF oficial es de texto con una tabla de columnas fijas:

    LOCALITAT/LOCALIDAD - CENTRE/CENTRO | Lloc | Horas | Itinerante | Tipus/Tipo |
    Requisito | Composición | Observaciones

agrupada por CUERPO > ESPECIALIDAD > PROVÍNCIA. Cada fila se ancla con el número de
puesto ("Lloc", 6 dígitos). Las columnas se calculan a partir de la cabecera de cada
página y el texto de cada celda (que puede ocupar varias líneas) se asigna a la fila
cuyo borde superior queda más cerca.

Principios:
* Se conservan los valores originales de cada columna (``*_original``).
* Nada se interpreta sin estar documentado: lo dudoso se marca en ``revision``.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any

import pymupdf

SCHEMA_VERSION = 1

# Tolerancias en puntos PDF.
TOL_MISMA_LINEA = 3.0
MAX_SALTO_MISMO_BLOQUE = 13.5
MAX_HUECO_ENTRE_PALABRAS = 8.0
TOL_ANCLA = 8.0

RE_FECHA = re.compile(r"\b(\d{2})/(\d{2})/(\d{4})\b")
RE_LLOC = re.compile(r"^\d{6}$")
RE_CENTRO = re.compile(r"^(?P<municipio>.+?) - (?P<codigo>\d{8}) - (?P<centro>.+)$")
RE_CUERPO = re.compile(r"^CUERPO/COS:\s*(?P<v>.+)$")
RE_ESPECIALIDAD = re.compile(r"^ESPECIALIDAD/ESPECIALITAT:\s*(?P<codigo>\S+)\s+(?P<nombre>.+)$")
RE_PROVINCIA = re.compile(r"^PROV[ÍI]NCIA/PROVINCIA:\s*(?P<v>.+)$")
RE_PIE = re.compile(r"^P[àa]g\s+\d+\s+of\s+\d+$")

COLUMNAS = ("centro", "lloc", "horas", "itinerante", "tipo", "requisito", "composicion", "observaciones")
CABECERAS = {
    "Lloc": "lloc",
    "Horas": "horas",
    "Itinerante": "itinerante",
    "Tipus/Tipo": "tipo",
    "Requisito": "requisito",
    "Composición": "composicion",
    "Observaciones": "observaciones",
}

# Valores exactos de la columna TIPO observados en los listados. Cualquier otro valor
# se conserva tal cual y se marca para revisión (no se adivina su significado).
TIPOS_CONOCIDOS = {
    "Vacante": "vacante",
    "Sust. Det.": "sustitucion-determinada",
    "Sust. Ind.": "sustitucion-indeterminada",
}
ITINERANTE_VALIDOS = {"SI", "NO"}


class ErrorExtraccion(Exception):
    """El documento no tiene la estructura esperada."""


@dataclass
class _Palabra:
    x0: float
    y0: float
    x1: float
    y1: float
    texto: str

    @property
    def xc(self) -> float:
        return (self.x0 + self.x1) / 2


@dataclass
class _Ancla:
    pagina: int
    y0: float
    lloc: str
    cuerpo: str | None
    especialidad_codigo: str | None
    especialidad_nombre: str | None
    provincia: str | None
    segmento: int
    celdas: dict[str, list[str]] = field(default_factory=lambda: {c: [] for c in COLUMNAS})
    revision: list[str] = field(default_factory=list)


def _agrupar_lineas(palabras: list[_Palabra]) -> list[list[_Palabra]]:
    lineas: list[list[_Palabra]] = []
    for p in sorted(palabras, key=lambda w: (w.y0, w.x0)):
        if lineas and abs(lineas[-1][0].y0 - p.y0) <= TOL_MISMA_LINEA:
            lineas[-1].append(p)
        else:
            lineas.append([p])
    for l in lineas:
        l.sort(key=lambda w: w.x0)
    return lineas


def _texto(linea: list[_Palabra]) -> str:
    return " ".join(w.texto for w in linea)


def _geometria_columnas(palabras: list[_Palabra]) -> tuple[float, dict[str, float], float]:
    """Devuelve (x máxima de la columna del centro, centro X de cada columna, Y de la cabecera)."""
    candidatas = [w for w in palabras if w.texto in CABECERAS]
    if not candidatas:
        raise ErrorExtraccion("Cabecera de tabla no encontrada")
    # La cabecera es la línea más alta que contiene palabras de cabecera (una palabra como
    # "Lloc" también puede aparecer en el texto de las observaciones).
    y_cab = min(w.y0 for w in candidatas)
    cab = {CABECERAS[w.texto]: w for w in candidatas if abs(w.y0 - y_cab) <= TOL_MISMA_LINEA}
    faltan = set(CABECERAS.values()) - set(cab)
    if faltan:
        raise ErrorExtraccion(f"Cabecera de tabla incompleta; faltan: {sorted(faltan)}")
    centros = {c: cab[c].xc for c in CABECERAS.values()}
    return cab["lloc"].x0 - 10.0, centros, cab["lloc"].y1


def _tramos(palabras: list[_Palabra]) -> list[_Palabra]:
    """Une palabras contiguas de una misma línea en tramos de texto (una celda o parte de ella)."""
    tramos: list[_Palabra] = []
    for linea in _agrupar_lineas(palabras):
        actual: _Palabra | None = None
        for w in linea:
            if actual is not None and w.x0 - actual.x1 <= MAX_HUECO_ENTRE_PALABRAS:
                actual = _Palabra(actual.x0, min(actual.y0, w.y0), w.x1, max(actual.y1, w.y1), f"{actual.texto} {w.texto}")
                tramos[-1] = actual
            else:
                actual = _Palabra(w.x0, w.y0, w.x1, w.y1, w.texto)
                tramos.append(actual)
    return tramos


def _columna(t: _Palabra, x_max_centro: float, centros: dict[str, float]) -> str:
    """Las celdas de texto pueden estar alineadas a la izquierda, derecha o centradas; el
    centro se reconoce por su inicio y el resto por el centro de cabecera más cercano."""
    if t.x0 < x_max_centro:
        return "centro"
    return min(centros, key=lambda c: abs(centros[c] - t.xc))


def _bloques(palabras: list[_Palabra]) -> list[list[list[_Palabra]]]:
    """Agrupa líneas consecutivas de una misma columna en bloques (una celda = un bloque)."""
    lineas = _agrupar_lineas(palabras)
    bloques: list[list[list[_Palabra]]] = []
    for l in lineas:
        if bloques and l[0].y0 - bloques[-1][-1][0].y0 <= MAX_SALTO_MISMO_BLOQUE:
            bloques[-1].append(l)
        else:
            bloques.append([l])
    return bloques


def extraer_fecha_listado(texto_pagina: str) -> str | None:
    m = RE_FECHA.search(texto_pagina)
    return f"{m.group(3)}-{m.group(2)}-{m.group(1)}" if m else None


def parsear_pdf(ruta: str) -> dict[str, Any]:
    """Extrae todos los puestos de un PDF de listado.

    Lanza ``ErrorExtraccion`` si el documento no tiene la estructura esperada, de modo
    que nunca se publique un resultado parcial como si fuera completo.
    """
    try:
        doc = pymupdf.open(ruta)
    except Exception as e:  # archivo ausente, corrupto o no PDF
        raise ErrorExtraccion(f"No se puede abrir el PDF: {e}") from e
    anclas: list[_Ancla] = []
    avisos: list[str] = []
    fecha_listado: str | None = None
    cuerpo = esp_cod = esp_nom = provincia = None
    segmento = 0
    geom_prev: tuple[float, dict[str, float]] | None = None

    for n, pagina in enumerate(doc, start=1):
        palabras = [_Palabra(*w[:5]) for w in pagina.get_text("words")]
        if not palabras:
            avisos.append(f"Página {n} sin texto extraíble")
            continue
        try:
            x_max_centro, centros, y_cab = _geometria_columnas(palabras)
        except ErrorExtraccion:
            if geom_prev is None:
                raise
            (x_max_centro, centros), y_cab = geom_prev, 0.0
            avisos.append(f"Página {n}: cabecera no encontrada; se reutilizan las columnas anteriores")
        geom_prev = (x_max_centro, centros)

        if fecha_listado is None:
            fecha_listado = extraer_fecha_listado(pagina.get_text("text")[:600])

        y_pie = min((w.y0 for w in palabras if w.texto == "Pàg"), default=pagina.rect.height)
        cuerpo_pag = _tramos([w for w in palabras if y_cab + 2 < w.y0 < y_pie - 1])

        # Líneas de sección (CUERPO / ESPECIALIDAD / PROVÍNCIA) y filas ancla, en orden vertical.
        eventos: list[tuple[float, str, Any]] = []
        ids_seccion: set[int] = set()
        for linea in _agrupar_lineas(cuerpo_pag):
            txt = _texto(linea)
            for tipo, rx in (("cuerpo", RE_CUERPO), ("esp", RE_ESPECIALIDAD), ("prov", RE_PROVINCIA)):
                m = rx.match(txt)
                if m:
                    eventos.append((linea[0].y0, tipo, m))
                    ids_seccion.update(id(w) for w in linea)
                    break
        for w in cuerpo_pag:
            if id(w) in ids_seccion:
                continue
            if _columna(w, x_max_centro, centros) == "lloc" and RE_LLOC.match(w.texto):
                eventos.append((w.y0, "fila", w))
        eventos.sort(key=lambda e: e[0])

        anclas_pag: list[_Ancla] = []
        for y, tipo, dato in eventos:
            if tipo == "cuerpo":
                cuerpo = dato.group("v").strip()
                esp_cod = esp_nom = provincia = None
                segmento += 1
            elif tipo == "esp":
                esp_cod, esp_nom = dato.group("codigo"), dato.group("nombre").strip()
                provincia = None
                segmento += 1
            elif tipo == "prov":
                provincia = dato.group("v").strip()
                segmento += 1
            else:
                a = _Ancla(n, y, dato.texto, cuerpo, esp_cod, esp_nom, provincia, segmento)
                anclas_pag.append(a)

        # Texto de cada columna, por bloques, asignado a la fila cuyo borde superior está más cerca.
        resto = [w for w in cuerpo_pag if id(w) not in ids_seccion]
        for col in COLUMNAS:
            pcol = [w for w in resto if _columna(w, x_max_centro, centros) == col]
            for bloque in _bloques(pcol):
                top = bloque[0][0].y0
                candidatas = [a for a in anclas_pag if _mismo_segmento(a, top, eventos, anclas_pag)]
                if not candidatas:
                    avisos.append(f"Página {n}: texto sin fila asociada en columna {col}: {_texto(bloque[0])[:40]!r}")
                    continue
                a = min(candidatas, key=lambda c: abs(c.y0 - top))
                if abs(a.y0 - top) > TOL_ANCLA:
                    a.revision.append(f"Texto de la columna {col} con posición vertical dudosa")
                if col == "lloc":
                    continue
                a.celdas[col].extend(_texto(l) for l in bloque)
        anclas.extend(anclas_pag)

    n_paginas = len(doc)
    doc.close()
    if not anclas:
        raise ErrorExtraccion("No se ha detectado ningún puesto en el documento")

    puestos = [_construir_puesto(a) for a in anclas]
    ids = [p["id"] for p in puestos]
    duplicados = sorted({i for i in ids if ids.count(i) > 1})
    if duplicados:
        avisos.append(f"Identificadores de puesto repetidos: {duplicados}")

    return {
        "schema": SCHEMA_VERSION,
        "fecha_listado": fecha_listado,
        "paginas": n_paginas,
        "puestos": puestos,
        "avisos": avisos,
    }


def _mismo_segmento(a: _Ancla, y: float, eventos: list[tuple[float, str, Any]], anclas: list[_Ancla]) -> bool:
    """Una celda solo puede pertenecer a una fila si no hay una cabecera de sección entre ambas."""
    lo, hi = sorted((a.y0, y))
    return not any(lo < ey < hi and t != "fila" for ey, t, _ in eventos)


def _construir_puesto(a: _Ancla) -> dict[str, Any]:
    c = {k: " ".join(v).strip() for k, v in a.celdas.items()}
    rev = list(a.revision)

    m = RE_CENTRO.match(c["centro"])
    if m:
        municipio, centro_codigo, centro = m.group("municipio"), m.group("codigo"), m.group("centro")
    else:
        municipio = centro_codigo = None
        centro = c["centro"] or None
        rev.append("No se ha podido separar municipio, código y nombre del centro")

    horas_txt = c["horas"]
    try:
        horas = float(horas_txt.replace(",", ".")) if horas_txt else None
    except ValueError:
        horas = None
    if horas is None:
        rev.append("Horas no interpretables")

    if c["itinerante"] not in ITINERANTE_VALIDOS:
        rev.append(f"Valor inesperado en columna Itinerante: {c['itinerante']!r}")

    tipo = TIPOS_CONOCIDOS.get(c["tipo"])
    if tipo is None:
        rev.append(f"Valor desconocido en columna Tipo: {c['tipo']!r}")

    if not (a.cuerpo and a.especialidad_codigo and a.provincia):
        rev.append("Falta cuerpo, especialidad o provincia")

    return {
        "id": a.lloc,
        "cuerpo": a.cuerpo,
        "especialidad_codigo": a.especialidad_codigo,
        "especialidad_nombre": a.especialidad_nombre,
        "provincia": a.provincia,
        "municipio": municipio,
        "centro_codigo": centro_codigo,
        "centro": centro,
        "horas": horas,
        "horas_original": horas_txt or None,
        "itinerante_original": c["itinerante"] or None,
        "tipo_original": c["tipo"] or None,
        "tipo": tipo,
        "requisito": c["requisito"] or None,
        "composicion": c["composicion"] or None,
        "observaciones": c["observaciones"] or None,
        "pagina": a.pagina,
        "revision": rev,
    }
