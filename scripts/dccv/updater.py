"""Descarga el listado semanal de la Conselleria, lo extrae y actualiza los datos estáticos.

Flujo (idempotente, pensado para ejecutarse varias veces el mismo día):
  1. Descarga la página oficial (con reintentos).
  2. Localiza el enlace "Llocs provisionals oferits".
  3. Descarga el PDF y calcula su huella SHA-256. Si ya está procesado, no hace nada.
  4. Extrae los puestos. Si la extracción falla no se publica nada y se conserva el último
     listado válido.
  5. Escribe ``<data>/convocatorias/<id>.json``, actualiza ``index.json`` y ``status.json``.
"""

from __future__ import annotations

import hashlib
import html as html_lib
import json
import re
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
from collections.abc import Callable
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .parser import ErrorExtraccion, parsear_pdf

URL_PAGINA = "https://ceice.gva.es/va/web/rrhh-educacion/convocatoria-y-peticion-telematica6"
USER_AGENT = "DCCV-updater (+https://github.com/Dapadi/llocsdedificilcobertura)"
SCHEMA_INDICE = 1

Fetch = Callable[[str], bytes]


class ErrorActualizacion(Exception):
    """Fallo recuperable: se conservan los datos anteriores."""


def descargar(url: str, intentos: int = 4, timeout: float = 60.0, pausa: float = 5.0) -> bytes:
    """GET con reintentos y espera exponencial (la web oficial ha dado errores de tiempo de espera)."""
    ultimo: Exception | None = None
    for i in range(intentos):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read()
        except (urllib.error.URLError, TimeoutError, ConnectionError, OSError) as e:
            ultimo = e
            if i < intentos - 1:
                time.sleep(pausa * (2**i))
    raise ErrorActualizacion(f"No se pudo descargar {url}: {ultimo}")


_RE_ENLACE = re.compile(r'<a\b[^>]*?href="(?P<href>[^"]+)"[^>]*>(?P<texto>.*?)</a>', re.I | re.S)


def descubrir_enlace_provisional(pagina_html: str, url_base: str = URL_PAGINA) -> str:
    """Devuelve la URL absoluta del PDF de "Llocs provisionals oferits"."""
    candidatos: list[tuple[int, str]] = []
    for m in _RE_ENLACE.finditer(pagina_html):
        texto = html_lib.unescape(re.sub(r"<[^>]+>", "", m.group("texto"))).strip().lower()
        href = html_lib.unescape(m.group("href"))
        if "provisionals oferits" in texto or "provisionales ofertados" in texto:
            candidatos.append((0, href))
        elif re.search(r"_pue_prov\.pdf", href, re.I):
            candidatos.append((1, href))
    if not candidatos:
        raise ErrorActualizacion("No se ha encontrado el enlace a «Llocs provisionals oferits» en la página oficial")
    candidatos.sort(key=lambda c: c[0])
    return urllib.parse.urljoin(url_base, candidatos[0][1])


def _fecha_desde_nombre(nombre: str) -> str | None:
    """Los PDF se llaman AAMMDD_pue_prov.pdf; devuelve la fecha ISO o None."""
    m = re.match(r"^(\d{2})(\d{2})(\d{2})_", nombre)
    if not m:
        return None
    try:
        return datetime(2000 + int(m[1]), int(m[2]), int(m[3])).date().isoformat()
    except ValueError:
        return None


def _estado_desde_nombre(nombre: str) -> str:
    return "provisional" if re.search(r"_prov\b|_prov\.", nombre, re.I) else "desconocido"


def _ahora() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _leer_json(ruta: Path, defecto: Any) -> Any:
    try:
        return json.loads(ruta.read_text(encoding="utf-8"))
    except FileNotFoundError:
        return defecto


def _escribir_json(ruta: Path, datos: Any) -> None:
    ruta.parent.mkdir(parents=True, exist_ok=True)
    ruta.write_text(json.dumps(datos, ensure_ascii=False, indent=2, sort_keys=False) + "\n", encoding="utf-8")


def procesar_pdf(
    pdf_bytes: bytes,
    url_documento: str,
    data_dir: Path,
    url_pagina: str = URL_PAGINA,
    ahora: Callable[[], str] = _ahora,
) -> dict[str, Any]:
    """Procesa un PDF descargado. Devuelve {"resultado": "nuevo"|"sin-cambios", ...}."""
    sha = hashlib.sha256(pdf_bytes).hexdigest()
    indice = _leer_json(data_dir / "index.json", {"schema": SCHEMA_INDICE, "convocatorias": [], "ultima": None})

    previa = next((c for c in indice["convocatorias"] if c["sha256"] == sha), None)
    if previa:
        return {"resultado": "sin-cambios", "id": previa["id"]}

    with tempfile.NamedTemporaryFile(suffix=".pdf") as tmp:
        tmp.write(pdf_bytes)
        tmp.flush()
        try:
            extraido = parsear_pdf(tmp.name)
        except ErrorExtraccion as e:
            raise ErrorActualizacion(f"Extracción fallida: {e}") from e

    nombre = urllib.parse.unquote(urllib.parse.urlparse(url_documento).path.rsplit("/", 1)[-1])
    fecha_listado = extraido["fecha_listado"]
    fecha_nombre = _fecha_desde_nombre(nombre)
    base_id = f"{(fecha_listado or fecha_nombre or 'sin-fecha').replace('-', '')}_{Path(nombre).stem}"
    # Mismo nombre y fecha pero contenido distinto = versión corregida del mismo documento.
    version = 1 + sum(1 for c in indice["convocatorias"] if c["id"].split("__v")[0] == base_id)
    cid = base_id if version == 1 else f"{base_id}__v{version}"

    anterior = next((c for c in reversed(indice["convocatorias"]) if c["id"] == indice.get("ultima")), None)
    cambios = None
    if anterior:
        ids_ant = {p["id"] for p in _leer_json(data_dir / anterior["archivo_datos"], {"puestos": []})["puestos"]}
        ids_nue = {p["id"] for p in extraido["puestos"]}
        cambios = {"anterior": anterior["id"], "nuevos": len(ids_nue - ids_ant), "retirados": len(ids_ant - ids_nue)}

    archivo = f"convocatorias/{cid}.json"
    estado = _estado_desde_nombre(nombre)
    documento = {
        "schema": extraido["schema"],
        "id": cid,
        "documento": {
            "nombre_archivo": nombre,
            "url": url_documento,
            "url_pagina": url_pagina,
            "sha256": sha,
            "estado": estado,
            "fecha_listado": fecha_listado,
            "fecha_nombre_archivo": fecha_nombre,
            "paginas": extraido["paginas"],
            "descargado_en": ahora(),
        },
        "avisos": extraido["avisos"],
        "puestos": extraido["puestos"],
    }
    _escribir_json(data_dir / archivo, documento)

    indice["convocatorias"].append(
        {
            "id": cid,
            "archivo_datos": archivo,
            "nombre_archivo": nombre,
            "url_documento": url_documento,
            "sha256": sha,
            "estado": estado,
            "fecha_listado": fecha_listado,
            "fecha_nombre_archivo": fecha_nombre,
            "descargado_en": documento["documento"]["descargado_en"],
            "num_puestos": len(extraido["puestos"]),
            "num_revision": sum(1 for p in extraido["puestos"] if p["revision"]),
            "cambios": cambios,
        }
    )
    indice["convocatorias"].sort(key=lambda c: (c["fecha_listado"] or "", c["descargado_en"]))
    indice["ultima"] = indice["convocatorias"][-1]["id"]
    indice["actualizado_en"] = ahora()
    _escribir_json(data_dir / "index.json", indice)
    return {"resultado": "nuevo", "id": cid, "puestos": len(extraido["puestos"])}


def actualizar(data_dir: Path, fetch: Fetch = descargar, url_pagina: str = URL_PAGINA, ahora: Callable[[], str] = _ahora) -> dict[str, Any]:
    """Ejecuta el ciclo completo y registra el resultado en ``status.json``."""
    estado_prev = _leer_json(data_dir / "status.json", {})
    try:
        pagina = fetch(url_pagina).decode("utf-8", errors="replace")
        url_pdf = descubrir_enlace_provisional(pagina, url_pagina)
        res = procesar_pdf(fetch(url_pdf), url_pdf, data_dir, url_pagina, ahora)
        nuevo = {"resultado": "ok", "mensaje": res["resultado"], "ultima_convocatoria": res["id"], "ultimo_exito": ahora()}
        error: ErrorActualizacion | None = None
    except ErrorActualizacion as e:
        error = e
        nuevo = {
            "resultado": "error",
            "mensaje": str(e),
            "ultima_convocatoria": estado_prev.get("ultima_convocatoria"),
            "ultimo_exito": estado_prev.get("ultimo_exito"),
        }
        res = {"resultado": "error", "mensaje": str(e)}
    nuevo["ultimo_intento"] = ahora()
    # Solo se reescribe si cambia algo relevante, para no generar commits vacíos cada ejecución.
    claves = ("resultado", "mensaje", "ultima_convocatoria", "ultimo_exito")
    if any(estado_prev.get(k) != nuevo.get(k) for k in claves):
        _escribir_json(data_dir / "status.json", nuevo)
    if error:
        raise error
    return res
