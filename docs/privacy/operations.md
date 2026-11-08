# Boblox – provozní postup ochrany osobních údajů

Správce: Václav Pěkný. Kontakt pro hráče: venda.pekny@gmail.com.
Stav: 8. 11. 2026. Toto je provozní evidence a postup, nikoliv osvědčení právního souladu.
Veřejné informace jsou v `privacy.html`; skutečná implementace a tyto informace musí zůstat shodné.

## Co je připravené

- Zásady přístupné bez přihlášení, v registraci a v nastavení účtu.
- Centrum soukromí připravuje e-mailové žádosti, nic automaticky neodesílá.
- Ověřený export JSON z aktuálního účtu. Soukromé tabulky čte pevně vymezená funkce, nikoli libovolný klientský dotaz. Žádná hesla, tokeny ani cizí konverzace.
- Věk zůstává podmínkou služby, ne všeobecným souhlasem s GDPR. Aktivita nemá souhlasový checkbox.
- V indexu nejsou Google Fonts; zůstávají čtyři CDN a síťová infrastruktura multiplayeru. Absence fontů neznamená absenci spojení s Googlem.
- Nezjištěna integrace Google Analytics / GTM / Matomo / PostHog / Clarity v indexu a zdrojových skriptech. Není to audit budoucích změn ani všech chování externích knihoven.

## Před zveřejněním musí provozovatel dokončit

1. Ověřit své smluvní postavení u Supabase, hostingu a e-mailu. Uložit konkrétní platné podmínky a DPA, verzi a datum přijetí; nespoléhat jen na obecný odkaz. DPA Supabase podle aktuálního textu tvoří součást smlouvy; není zde doloženo, pod jakým účtem a smlouvou provozovatel službu používá. Ověřit i poddodavatele a záruky mezinárodních přenosů.
2. Vyhodnotit použití spotřebitelského Gmailu pro žádosti s osobními údaji; ověřit, zda jeho podmínky odpovídají skutečné roli poskytovatele. Je-li nutná zpracovatelská smlouva, zajistit odpovídající službu nebo schránku. Tato implementace žádnou smlouvu za provozovatele neuzavřela.
3. Zjistit skutečnou retenci provozních logů a záloh pro používané plány Supabase a hostingu, případně vlastní Node server. Dopsat konkrétní lhůty do veřejných zásad a níže. Nezavádět neověřený příslib, že vše zůstává v EU nebo že výmaz odstraní všechny zálohy okamžitě.
4. V prohlížeči ověřit skutečné síťové požadavky, cookies a localStorage v hostu, při přihlášení i v každém multiplayerovém režimu. Posoudit každou položku úložiště podle nezbytnosti. Nezbytnost nelze odvodit z toho, že jde o localStorage. Pro volitelné prvky zajistit předchozí souhlas nebo je vypnout.
5. Potvrdit posouzení oprávněných zájmů níže, zejména přístupnost poslední aktivity nezletilých. Zvážit omezení na přátele nebo skrytí. Námitku nelze automaticky odmítnout argumentem „je to ve hře“.
6. Zapnout MFA pro účty provozovatele, omezit správce, ověřit obnovu ze zálohy, ochranu tajných klíčů a incidentní kontakty. Zapnutí ochrany proti uniklým heslům v Supabase není touto úpravou doloženo.
7. Publikovat zdrojové změny a otestovat celý tok z druhého zařízení. Pull blokují rozpracované změny. Zde nebyl proveden commit, push ani potvrzena produkční stránka.

## Evidence účelů a uchování

| Skupina | Základ / účel | Uchování a odpovědnost |
|---|---|---|
| Auth, profil, inventář, postup, virtuální zůstatek | Smlouva – požadovaná herní služba | Životnost účtu; při ukončení / výmazu vyčistit aktivní databázi. Neponechat staré účty automaticky „pro jistotu“. Neaktivní účty přezkoumat při každoroční revizi. |
| Potvrzení věku | Oprávněný zájem – věková podmínka a ochrana nezletilých | Životnost účtu, bez sběru data narození a dokladů při běžné registraci. |
| Soukromé zprávy, vztahy | Smlouva – vyžádaná komunikace | Vztah do odstranění; zprávy po dobu vedení příslušných účtů. Při žádosti o výmaz zkontrolovat obě strany konverzace a kopie, ne jen tabulku Auth. |
| Veřejné komentáře a hlasování | Smlouva – publikace vyžádaná autorem; oprávněný zájem – moderace | Do odstranění obsahu nebo výmazu identifikace autora, s posouzením konkrétních výjimek. `ON DELETE SET NULL` samo neodstraní uloženou přezdívku ani osobní údaje v textu. |
| Presence, poslední aktivita | Posuzovaný oprávněný zájem – sociální dostupnost a multiplayer | Presence do timeoutu, pouze poslední čas u účtu. Ne archiv časové historie. Námitky vyřizuje správce; automatické skrytí zatím není implementované. |
| Ledger, idempotence, stav her | Smlouva a oprávněný zájem – konzistence a prevence podvodu | Životnost účtu, při výmazu odstranit též interní tabulky. Nemaž běžící idempotentní záznamy po libovolné TTL bez změny ochrany proti opakovanému vyplacení! |
| Podpora a žádosti | Právní povinnost / smlouva / oprávněný zájem dle typu | Do uzavření + nejvýše 12 měsíců; konkrétní spor či povinnost jen v nezbytném rozsahu. Měsíčně ručně promazávat vyřízenou korespondenci i koš. |
| Logy a zálohy poskytovatelů | Bezpečnost, doručení služby | Konkrétní nastavení plánu musí provozovatel ověřit před vydáním. Incidentní důkazy oddělit a stanovit další přezkum. |

Jde o manuální provozní pravidla. Nebyl vytvořen plánovač, který by četl Gmail nebo automaticky mazal korespondenci či účty. Provozovatel musí jejich provádění zajistit a evidovat. Sledování neaktivních účtů není důvod přidávat nové nepřiměřené osobní údaje.

## Žádosti hráčů – praktický postup

1. Zapsat datum přijetí, typ žádosti, interní číslo, termín jeden měsíc a stav do neveřejné evidence. Nepřepisovat do evidence celé zprávy ani hesla. Při složité žádosti lze za zákonných podmínek prodloužit nejvýše o další dva měsíce; informovat a odůvodnit do prvního měsíce.
2. Přiměřeně ověřit účet pomocí již potvrzeného e-mailu / ověřené relace. Přezdívka nebo screenshot profilu samy nestačí. Pokud účet nemá dostupný potvrzený e-mail, dohodnout přiměřený alternativní postup; nevyžadovat automaticky občanský průkaz.
3. Přístup: poskytnout export přes bezpečný soukromý kanál; případně doplnit osobní údaje z podpory a technických logů. Chránit údaje třetích osob, přístupové údaje a tajemství infrastruktury. JSON z aplikace je databázová kopie, ne tvrzení, že zahrnuje všechny dodavatelské logy.
4. Oprava: odlišit upravitelný profil od pravdivého historického záznamu; provést opravu na backendu, nikoli jen lokálně. Námitka / omezení: posoudit konkrétní účel a dopad, během posuzování provést přiměřená omezení podle GDPR. V případě zobrazení aktivity bez silnějšího důvodu omezit zveřejnění; případná kódová změna musí platit na všech zařízeních.
5. Výmaz: vysvětlit důsledky, ověřit rozsah a případné zákonné výjimky, ukončit / zneplatnit relace a pak vyčistit níže uvedená místa v řízené transakci. Žádost o výmaz neznamená souhlas se smazáním všech účtů stejné přezdívky. Neprovádět podle pouhé e-mailové adresy dodané neověřeným žadatelem.
6. Odpovědět, co bylo provedeno a co bylo případně ponecháno, s konkrétním důvodem a dobou / kritériem. Neslibovat, že lze odstranit kopie, které si nezávisle pořídili jiní hráči. Upozornit na místní cache a stažené exporty.

### Kontrolní mapa výmazu (provádí pouze oprávněný správce po ověření)

| Úložiště | Závislost na konkrétním účtu |
|---|---|
| `auth.users`, relace a identity | Ověřené UUID; zneplatnit relace, zohlednit platnost již vydaných JWT. Samotné smazání Auth uživatele není úplný výmaz. |
| `public.profiles`, `boblox_private.legacy_credentials` | `id`; odstranit profil, případné historické přihlašovací údaje. |
| `public.account_consents`, `boblox_private.email_enrollment` | `user_id`; FK do Auth má cascade, výsledek ověřit. |
| `boblox_private.friendships`, `messages` | Oba sloupce `sender_id` i `recipient_id`; posoudit text komunikace a protistranu. |
| `boblox_private.ledger`, `game_sessions`, `casino_state`, `account_requests` | `user_id`; `account_requests.payload/result` mohou obsahovat profil nebo komunikaci. Zkontrolovat i cache výsledků jiných účtů, které obsahují konverzaci s žadatelem. |
| `public.comments`, `game_ratings` | `user_id`, historické `username` a osobní obsah; pouhé nastavení FK na NULL nestačí. |
| Inventáře ostatních profilů, oznámení | Historické odkazy v `friends`, požadavcích, případně `announcements.sender` a textu; odstranit / anonymizovat nezbytné identifikátory bez poškození cizího postupu. |
| Alternativní Node SQLite | `users`, `direct_messages` (ID i historická přezdívka), `comments`, `game_ratings`, `account_consents`, `account_commands`, `account_command_state`, `account_ledger` a sociální odkazy v JSON inventáři. Ne všechny tabulky mají cascade. |
| Zálohy, logy, podpora, lokální cache | Zdokumentovat expiraci záloh a ochranu proti obnovení smazaných dat. Vyčistit vlastní kopie; místní úložiště jiného zařízení nelze smazat pouhým SQL příkazem. |

Produkční hromadné mazání nebylo v rámci této úpravy spuštěno. Není vytvořen nebezpečný veřejný endpoint přijímající libovolné UUID pro výmaz.

## Posouzení oprávněného zájmu – záznam k potvrzení provozovatelem

- Účel: vzájemná dostupnost hráčů, ochrana účtů, konzistence herních operací; nejde o reklamu nebo obchodování s profily.
- Nezbytnost: online dostupnost pomáhá multiplayeru; přesný veřejný čas poslední aktivity nemusí být nezbytný pro samotné hraní. Neoznačovat jej automaticky za smluvně nutný.
- Dopad: riziko sledování chování, obtěžování a odhalení denního režimu, zejména u nezletilých. Soukromé zprávy a e-mail nesmí být veřejné.
- Záruky: pouze poslední čas místo historie, minimální identifikace, žádný povinný analytický souhlas, informace v zásadách, dostupná námitka, přiměřené omezení přístupu. Před vydáním zvážit viditelnost jen pro přátele; tato změna není implementovaná.
- Závěr: právní základ závisí na skutečné viditelnosti, nezbytnosti a přijatých zárukách. Tento záznam není automatické schválení současné veřejné dostupnosti aktivity. Provozovatel musí rozhodnutí doložit a podle něj upravit službu či zásady.
- Screening DPIA / pověřence: zhodnotit rozsah, cílení na nezletilé, systematické monitorování a další rizika; nepředpokládat automatickou povinnost ani výjimku jen kvůli velikosti projektu.

## Incident a bezpečnost

Omezit dopad, uchovat přiměřené důkazy, zapsat okamžik zjištění, rozsah, příjemce, riziko a nápravu. Obměnit uniklé klíče / přístupy a zneplatnit dotčené relace. Každý incident dokumentovat. Pokud není nepravděpodobné riziko pro práva lidí, oznámit ÚOOÚ bez zbytečného odkladu, pokud možno do 72 hodin od zjištění. Při pravděpodobném vysokém riziku informovat i postižené bez zbytečného odkladu. Nečekat na úplné vyšetření, lze doplňovat. Oznámení neodesílá tento software automaticky.

## Zdroje a hranice kontroly

- GDPR, zejména čl. 5, 6, 12–22, 25, 28, 30, 32–35 a kapitola V: https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng
- Informační povinnost: https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/obligations_en
- Cookies a technické ukládání: https://uoou.gov.cz/verejnost/qa-otazky-a-odpovedi/cookies
- Incidenty: https://www.edpb.europa.eu/sme/assess-the-risks/data-breaches_en
- Supabase DPA: https://supabase.com/legal/dpa

Nejde o celkový právní audit. Veřejné komentáře a zprávy mohou vyžadovat posouzení povinností podle DSA; případné platby, reklama či náhodné odměny další spotřebitelská / věková pravidla. V tomto úkolu nebylo potvrzeno, zda virtuální měna nebo odměny mají vztah ke skutečným penězům. Nelze z toho dovodit legálnost skutečného hazardu.

## Ověření implementace
25 cílených Node testů prošlo (privacy, age confirmation, recovery email, cache busting a soukromý chat). Rollback-only produkční SQL test ověřil pevnou identitu, vlastní konverzace, nepřístupnost anonymům a vyloučení přihlašovacích údajů; žádné skutečné uživatelské záznamy nezměnil. Supabase advisors po změně nepřidal varování pro nový export; zbývají dřívější hlášení k existujícím funkcím a vypnuté ochraně proti uniklým heslům. Kompletní node --test byl spuštěn, HTTP testy v prostředí selhávají na localhost connect EACCES. Fyzická kontrola UI v produkčním prohlížeči nebyla provedena; klient není publikovaný.
