# Boblox

Webová 3D multiplayerová herní platforma s Roblox estetikou, Three.js enginem a vanilla architekturou.

## Language

**Admin**:
Oprávněný systémový uživatel (`Vendeez`) s přístupem k administračnímu panelu, globálnímu vysílání a správě ekonomiky.
_Avoid_: Superuser, root, moderátor

**Headshot**:
Procedurální 3D Three.js snapshot hlavy a ramen hráčova avatara s nasazenými předměty pro profilové a navigační ikony.
_Avoid_: Avatar 2D ikona, profilovka, placeholder

**Bobux Transaction**:
Záznam o pohybu na účtu Bobuxů rozlišující příjem (kladný, zelený) a výdaj/sázku (záporný, červený).
_Avoid_: Historie bodů, mince log

**Avatar Shop**:
Sjednocený katalog a přizpůsobovací rozhraní pro nákup doplňků, nasazování předmětů a volbu barvy torza avatara.
_Avoid_: Tržiště, customizer, inventář modal

