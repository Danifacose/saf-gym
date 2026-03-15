# ⚙️ Execution

Questa cartella contiene gli **script Python deterministici** del progetto PEPPESITO.

## Ruolo

Gli script in questa cartella sono i **tool di esecuzione** del Livello 3 dell'architettura. Gestiscono:

- Chiamate API
- Elaborazione dati
- Operazioni su file
- Interazioni con database
- Scraping web
- Qualsiasi altra operazione deterministica

## Convenzioni

1. **Ben commentati**: ogni script deve avere docstring e commenti chiari
2. **Variabili d'ambiente**: usa `python-dotenv` per caricare da `.env`
3. **Gestione errori**: ogni script deve gestire errori in modo esplicito
4. **Testabili**: ogni script deve poter essere eseguito standalone per test

## Template base

```python
#!/usr/bin/env python3
"""
Descrizione: [cosa fa questo script]
Input: [cosa riceve]
Output: [cosa produce]
"""

import os
from dotenv import load_dotenv

load_dotenv()

def main():
    # Logica principale
    pass

if __name__ == "__main__":
    main()
```
