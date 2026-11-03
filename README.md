# boblox
## Zabezpečení a architektura v9.4

Přihlášené účty používají serverové příkazy pro ekonomiku a soukromá data. Přehled změn, pořadí migrací a omezení nasazení jsou v [poznámkách k v9.4](docs/development/v9.4-security-and-architecture.md). Lokální Node server vyžaduje náhodný `JWT_SECRET` (alespoň 32 znaků); administrátora určuje `ADMIN_USER_ID`. Testy spouštějte pomocí `node --test`.
