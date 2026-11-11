#!/usr/bin/env python3
"""Actualiza los datos de DCCV desde la web de la Conselleria.

Uso:
    python scripts/update_convocatorias.py [--data-dir public/data]
    python scripts/update_convocatorias.py --pdf listado.pdf --url https://.../AAMMDD_pue_prov.pdf
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from dccv.updater import ErrorActualizacion, actualizar, procesar_pdf  # noqa: E402


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--data-dir", default="public/data", type=Path)
    ap.add_argument("--pdf", type=Path, help="Procesa un PDF local en lugar de descargarlo")
    ap.add_argument("--url", help="URL oficial del PDF (obligatoria con --pdf)")
    args = ap.parse_args()
    try:
        if args.pdf:
            if not args.url:
                ap.error("--pdf requiere --url con la URL oficial del documento")
            res = procesar_pdf(args.pdf.read_bytes(), args.url, args.data_dir)
        else:
            res = actualizar(args.data_dir)
    except ErrorActualizacion as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 1
    print(res)
    return 0


if __name__ == "__main__":
    sys.exit(main())
