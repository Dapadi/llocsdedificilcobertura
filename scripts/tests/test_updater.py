import json
from pathlib import Path

import pytest

from dccv.updater import (
    ErrorActualizacion,
    actualizar,
    descubrir_enlace_provisional,
    procesar_pdf,
)

PDF = Path(__file__).resolve().parents[2] / "tests" / "fixtures" / "261106_pue_prov.pdf"
URL_PAGINA = "https://ceice.gva.es/va/web/rrhh-educacion/convocatoria-y-peticion-telematica6"
URL_PDF = "https://ceice.gva.es/documents/162909733/416898822/261106_pue_prov.pdf"
HTML = f"""<ul><li><a href="/documents/1/2/otro.pdf">Requisits generals</a></li>
<li><a href="/documents/162909733/416898822/261106_pue_prov.pdf" target="_blank"><strong><em><span>Llocs provisionals oferits</span></em></strong></a></li></ul>"""
AHORA = lambda: "2026-11-12T10:00:00Z"  # noqa: E731


def test_descubre_enlace_por_texto():
    assert descubrir_enlace_provisional(HTML, URL_PAGINA) == URL_PDF


def test_descubre_enlace_por_nombre_si_cambia_el_texto():
    html = '<a href="/documents/9/9/261113_pue_prov.pdf">Listado</a>'
    assert descubrir_enlace_provisional(html, URL_PAGINA).endswith("/261113_pue_prov.pdf")


def test_error_si_no_hay_enlace():
    with pytest.raises(ErrorActualizacion):
        descubrir_enlace_provisional("<a href='/x.pdf'>Otra cosa</a>", URL_PAGINA)


def fetch_falso(pdf=PDF.read_bytes(), html=HTML):
    def fetch(url):
        if url == URL_PAGINA:
            return html.encode()
        if url == URL_PDF:
            return pdf
        raise ErrorActualizacion(f"URL inesperada {url}")

    return fetch


def test_ciclo_completo_y_idempotencia(tmp_path):
    r1 = actualizar(tmp_path, fetch_falso(), URL_PAGINA, AHORA)
    assert r1["resultado"] == "nuevo" and r1["puestos"] == 58

    indice = json.loads((tmp_path / "index.json").read_text())
    assert indice["ultima"] == "20261105_261106_pue_prov"
    assert indice["convocatorias"][0]["estado"] == "provisional"
    assert indice["convocatorias"][0]["fecha_listado"] == "2026-11-05"
    datos = json.loads((tmp_path / indice["convocatorias"][0]["archivo_datos"]).read_text())
    assert len(datos["puestos"]) == 58

    # Segunda ejecución con el mismo documento: no duplica nada.
    r2 = actualizar(tmp_path, fetch_falso(), URL_PAGINA, AHORA)
    assert r2["resultado"] == "sin-cambios"
    assert len(json.loads((tmp_path / "index.json").read_text())["convocatorias"]) == 1


def test_fallo_de_red_conserva_datos_anteriores_y_lo_registra(tmp_path):
    actualizar(tmp_path, fetch_falso(), URL_PAGINA, AHORA)
    antes = (tmp_path / "index.json").read_text()

    def fetch_roto(url):
        raise ErrorActualizacion("tiempo de espera agotado")

    with pytest.raises(ErrorActualizacion):
        actualizar(tmp_path, fetch_roto, URL_PAGINA, lambda: "2026-11-19T10:00:00Z")

    assert (tmp_path / "index.json").read_text() == antes
    estado = json.loads((tmp_path / "status.json").read_text())
    assert estado["resultado"] == "error"
    assert estado["ultima_convocatoria"] == "20261105_261106_pue_prov"
    assert estado["ultimo_exito"] == "2026-11-12T10:00:00Z"


def test_pdf_corrupto_no_publica_nada(tmp_path):
    with pytest.raises(ErrorActualizacion):
        procesar_pdf(b"%PDF-1.4 esto no es un pdf", URL_PDF, tmp_path)
    assert not (tmp_path / "index.json").exists()


def test_version_corregida_del_mismo_documento(tmp_path):
    procesar_pdf(PDF.read_bytes(), URL_PDF, tmp_path, ahora=AHORA)
    import pymupdf

    doc = pymupdf.open(str(PDF))
    doc.set_metadata({"title": "corregido"})
    modificado = doc.tobytes()
    r = procesar_pdf(modificado, URL_PDF, tmp_path, ahora=lambda: "2026-11-13T09:00:00Z")
    assert r["id"].endswith("__v2")
    indice = json.loads((tmp_path / "index.json").read_text())
    assert [c["id"] for c in indice["convocatorias"]] == ["20261105_261106_pue_prov", "20261105_261106_pue_prov__v2"]
    assert indice["convocatorias"][1]["cambios"] == {"anterior": "20261105_261106_pue_prov", "nuevos": 0, "retirados": 0}
