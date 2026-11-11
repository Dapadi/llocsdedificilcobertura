from collections import Counter
from pathlib import Path

import pytest

from dccv.parser import ErrorExtraccion, parsear_pdf

PDF = Path(__file__).resolve().parents[2] / "tests" / "fixtures" / "261106_pue_prov.pdf"


@pytest.fixture(scope="module")
def resultado():
    return parsear_pdf(str(PDF))


def por_id(res, pid):
    return next(p for p in res["puestos"] if p["id"] == pid)


def test_totales(resultado):
    # 58 filas verificadas de forma independiente con pdftotext sobre el mismo documento.
    assert len(resultado["puestos"]) == 58
    assert len({p["id"] for p in resultado["puestos"]}) == 58
    assert resultado["paginas"] == 9
    assert resultado["fecha_listado"] == "2026-11-05"
    assert resultado["avisos"] == []


def test_sin_filas_en_revision(resultado):
    assert [p["id"] for p in resultado["puestos"] if p["revision"]] == []


def test_distribucion_por_cuerpo(resultado):
    c = Counter(p["cuerpo"] for p in resultado["puestos"])
    assert c["MESTRES"] == 21
    assert c["PROFESSORS D'ENSENYAMENT SECUNDARI"] == 24


def test_fila_sencilla(resultado):
    p = por_id(resultado, "905734")
    assert (p["municipio"], p["centro_codigo"], p["centro"]) == ("GANDIA", "46015587", "IES TIRANT LO BLANC")
    assert (p["especialidad_codigo"], p["provincia"]) == ("2A2", "VALENCIA")
    assert (p["horas"], p["itinerante_original"], p["tipo_original"], p["tipo"]) == (18.0, "NO", "Sust. Det.", "sustitucion-determinada")


def test_nombre_de_centro_en_varias_lineas(resultado):
    assert por_id(resultado, "918372")["centro"] == "CIPFP POLITÈCNIC MARÍTIM PESQUER DEL MEDITERRANI"


def test_municipio_con_guion(resultado):
    p = por_id(resultado, "515029")
    assert p["municipio"] == "CREVILLENT - SAN FELIPE NERI"
    assert p["centro"] == "CEIP CARDENAL BELLUGA"


def test_horas_con_coma_decimal(resultado):
    p = por_id(resultado, "600042")
    assert (p["horas"], p["horas_original"]) == (11.5, "11,5")


def test_requisito_y_itinerante(resultado):
    p = por_id(resultado, "911892")
    assert (p["itinerante_original"], p["requisito"]) == ("SI", "ING-B2.")
    assert por_id(resultado, "843717")["requisito"] == "ING-C1."


def test_composicion_y_observaciones(resultado):
    p = por_id(resultado, "895127")
    assert (p["composicion"], p["observaciones"]) == ("TEC+MAT+FQ", "AT. DOMICILIARIA")


def test_observacion_centrada_no_pierde_texto(resultado):
    # El texto empieza a la izquierda de la frontera "natural" de la columna.
    assert por_id(resultado, "923864")["observaciones"] == "PCT Matemàtica. Centre singular. Lloc difícil provisió"


def test_especialidades_de_maestros(resultado):
    esp = {(p["especialidad_codigo"], p["especialidad_nombre"]) for p in resultado["puestos"] if p["cuerpo"] == "MESTRES"}
    assert ("128", "EDUCACIÓN PRIMARIA") in esp
    assert ("121", "LENGUA EXTRANJERA: INGLÉS") in esp
    assert ("127", "PEDAGOGÍA TERAPÉUTICA") in esp


def test_documento_inexistente():
    with pytest.raises(Exception):
        parsear_pdf("/ruta/que/no/existe.pdf")


def test_pdf_sin_estructura_de_listado(tmp_path):
    import pymupdf

    doc = pymupdf.open()
    doc.new_page().insert_text((72, 72), "Documento cualquiera")
    ruta = tmp_path / "otro.pdf"
    doc.save(ruta)
    with pytest.raises(ErrorExtraccion):
        parsear_pdf(str(ruta))
