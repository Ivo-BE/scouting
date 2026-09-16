# Handleiding Scouting — volleybal en de Scout-module

Versie 1.0 · september 2026 · Opstellingen-app (TripleSpark)

---

## Deel 1 — Wat is scouting in volleybal?

### 1.1 Waarom scouten

Scouting is het systematisch vastleggen van wat er in een wedstrijd gebeurt: wie deed welke actie, waar, en met welk resultaat. Het doel is niet "cijfers verzamelen" maar **beslissingen onderbouwen**:

- **Eigen ploeg**: welke receptie-opstelling houdt stand, welke aanvaller scoort uit welke positie, waar verliezen we punten (opslagfouten? aanvalsfouten? receptie?), wie verdient meer speeltijd.
- **Tegenstander**: hun rotatievolgorde, waar hun beste aanvaller staat per rotatie, welke receptiespeler onder druk breekt, welke server je moet vrezen.
- **Training**: cijfers maken zichtbaar wat je op het oog "voelt" maar niet kunt bewijzen. Een receptie die 62% positief is in set 1 en 38% in set 4 is een gesprek waard.

Volleybal leent zich uitzonderlijk goed voor scouting omdat het spel **discreet** is: elke rally bestaat uit een opslag, een beperkt aantal contacten en een duidelijk einde. In tegenstelling tot voetbal is bijna elke actie telbaar.

### 1.2 De basisbegrippen

**Het veld en de zones.** Het halve veld wordt verdeeld in zes zones, genummerd volgens de rotatievolgorde:

```
        NET
   4  |  3  |  2      ← voorrij (aanvalszone)
  ----+-----+----      3-meterlijn
   5  |  6  |  1      ← achterrij
```

- Zone 1 is rechtsachter: hier serveert de speler.
- Zone 2, 3, 4 zijn de voorspelers (mogen aanvallen boven het net en blokken).
- Zone 5, 6, 1 zijn de achterspelers (mogen alleen aanvallen van achter de 3-meterlijn).

In de app worden de zones ook met Romeinse cijfers I–VI aangeduid (I = zone 1, enz.). Dat is de officiële notatie op wedstrijdbladen.

**Rotatie.** Elke keer dat een ploeg de opslag terugwint (*side-out*), draait ze één positie door **in wijzerzin**: de speler op 2 gaat naar 1 en serveert, 1 → 6, 6 → 5, 5 → 4, 4 → 3, 3 → 2. Een ploeg die zelf serveert en het punt wint, draait niet.

Belangrijk: de rotatie bepaalt alleen wie *bij de opslag* waar staat. Zodra de bal geserveerd is, mogen spelers vrij bewegen. Daarom "loopt" een spelverdeler na de opslag naar het net en gaat een buitenaanvaller vanuit zone 5 naar zone 4 om aan te vallen. Bij scouting noteer je de zone **waar de actie plaatsvindt**, niet de rotatiepositie van de speler.

**Startopstelling.** Vóór elke set geeft de coach op het opstellingsblad door wie in welke zone begint. Samen met de opslagvolgorde legt dat de hele set vast: als je weet wie op zone 1 t/m 6 begon en je telt de side-outs, weet je op elk moment wie waar hoort te staan. **Dat is het principe waarop de Scout-module bouwt.**

**Libero.** De libero is een verdedigende specialist die vrij mag wisselen met een achterspeler (meestal de middenaanvallers) zonder dat het als officiële wissel telt. De libero mag niet serveren (in de meeste Vlaamse jeugdreeksen), niet aanvallen boven het net en niet blokken. In de praktijk: als de middenaanvaller naar de achterrij draait, komt de libero erin; als hij weer naar voren draait, komt de midden terug.

**Wissels.** Maximaal zes per set. Een speler die eruit gaat, mag alleen terugkomen voor de speler die voor hem inkwam, op dezelfde positie. De app past deze regel toe en past wissels uit het wedstrijdlog automatisch toe tijdens het scouten.

### 1.3 De zes acties

Elke rally bestaat uit een keten van contacten. De internationale standaard (o.a. Data Volley) onderscheidt:

| Actie | Code | Wat | Waar meestal |
|---|---|---|---|
| Opslag | S | De serve vanuit zone 1 | Zone 1 |
| Receptie | R | Het eerste contact na de opslag van de tegenstander | Zone 5, 6, 1 |
| Pas (set) | P | Het tweede contact, meestal door de spelverdeler | Zone 2/3 |
| Aanval | A | Het derde contact over het net | Zone 2, 3, 4 (of achter de 3 m) |
| Blok | B | Het tegenhouden van een aanval boven het net | Zone 2, 3, 4 |
| Verdediging (dig) | V | Het opvangen van een aanval | Zone 5, 6, 1 |

Een typische rally: `S (zij) → R (wij) → P (wij) → A (wij) → B (zij) → V (zij) → P (zij) → A (zij) → punt`.

Je hoeft niet alles te taggen. Zie §1.5 voor wat zinvol is op jouw niveau.

### 1.4 De kwaliteitsschaal

Elke actie krijgt een waardering. De app gebruikt de zes-puntenschaal die in de scoutingwereld standaard is:

| Symbool | Betekenis | Voorbeeld receptie | Voorbeeld aanval |
|---|---|---|---|
| `#` | Perfect / rechtstreeks punt | Bal precies bij de setter, alle opties open | Kill: bal op de grond of onhoudbaar |
| `+` | Goed | Setter kan nog twee aanvallers bedienen | Aanval blijft in het spel maar de tegenstander kan geen georganiseerde aanval opzetten |
| `!` | Matig / neutraal | Setter moet lopen, hoge bal naar buiten | Vrije bal terug, rally gaat gelijk verder |
| `-` | Slecht | Bal over het net of alleen nog een noodbal | Tegenstander kan meteen counteren |
| `/` | Geblokt / afgeweerd | (n.v.t. bij receptie) | Aanval wordt geblokt: punt voor de tegenstander |
| `=` | Fout | Ace tegen: bal op de grond of onspeelbaar | Uit, in het net, netfout |

Voor de opslag: `#` = ace, `+` = tegenstander kan geen goede aanval opzetten, `!` = neutraal, `-` = tegenstander krijgt een perfecte receptie, `=` = opslagfout.

Voor het blok: `#` = blokpunt, `+` = bal wordt vertraagd en verdedigd, `-` = bal gaat via het blok uit ("touch out"), `=` = netfout of blokfout.

**Wees consequent, niet perfect.** Twee scouters oordelen nooit identiek. Wat telt is dat jij dezelfde bal in set 1 en in set 4 hetzelfde beoordeelt. Vuistregel voor receptie: kan de setter een *snelle* bal geven → `#`; alleen een hoge bal → `+`; moet de setter de bal "redden" → `!` of `-`.

### 1.5 Wat meet je, en wat zegt het?

Je hoeft niet alles te meten. Dit zijn de kengetallen die op clubniveau het meeste opleveren, in volgorde van belang:

**1. Side-out % (belangrijkste cijfer in volleybal)**
Percentage rallies waarin jij ontvangt en het punt wint. Boven 60% is sterk, onder 50% verlies je vrijwel altijd. Je leest het af uit de puntentelling: de app kent bij elk punt wie serveerde.

**2. Receptie positief %**
Aandeel `#` en `+` in de receptie. Bij dames-provinciaal is 45–55% normaal; onder 40% heeft je setter geen opties. Bekijk dit **per speler** en **per rotatie**: vaak hangt één rotatie scheef omdat een speler een zwakke ontvanger naast zich heeft.

**3. Aanvalsefficiëntie**
(kills − fouten − geblokt) / aantal aanvallen. Meer dan 25% is goed, 35%+ uitstekend. Kill % alleen (kills / aanvallen) is misleidend: een aanvaller met 40% kills en 30% fouten is minder waard dan een met 30% kills en 5% fouten.

**4. Opslag**
Aces en fouten per speler. Een simpele maar harde maatstaf: een speler die meer opslagfouten dan aces maakt, kost punten. Kijk ook naar `+`: een moeilijke opslag die geen ace is maar de tegenstander uit ritme haalt, is de echte waarde van een goede server.

**5. Verdeling van de aanval**
Hoeveel procent van de sets gaat naar welke aanvaller, per rotatie. Je ziet snel of de setter te voorspelbaar is (alle ballen naar zone 4) of een middenaanvaller nooit gebruikt.

**6. Puntenverlies per categorie**
Hoeveel punten gaf je weg door opslagfouten, aanvalsfouten, receptiefouten (aces tegen) en netfouten? Bij jeugd komt vaak 40% van de punten van de tegenstander uit eigen fouten. Dat is het eerste wat je in training aanpakt.

### 1.6 Tegenstander scouten

Wat je van de tegenstander wilt weten, in volgorde:

1. **Rotatievolgorde**: wie serveert na wie. Daaruit volgt hun hele opstelling. Nodig om te weten waar hun beste aanvaller staat in elke rotatie en waar je moet blokken.
2. **Wie is de setter** en of ze een systeem met één setter (5-1) of twee (6-2) spelen. Bij 5-1 heeft de setter drie rotaties waarin hij voor staat (maar twee aanvallers) — dat zijn de rotaties om ze onder druk te zetten met de opslag.
3. **Zwakke ontvanger**: op wie serveer je? Receptie positief % per speler geeft het antwoord.
4. **Beste aanvaller en zijn favoriete richting**: krijgt hij 40% van de ballen, dan is hij je blokdoel.
5. **Wat doen ze na een slechte receptie**: hoge bal naar zone 4? Dan weet je waar je blok moet staan als je opslag goed is.

Je hoeft niet alle contacten van de tegenstander te taggen. Opslag (met rugnummer), receptie en aanval volstaan voor een volledig beeld.

### 1.7 Wanneer scout je?

- **Live, tijdens de wedstrijd**: alleen haalbaar met ervaring, en enkel de kernacties (receptie en aanval). Voordeel: cijfers bij de time-out. Nadeel: je kijkt niet meer als coach.
- **Achteraf, van video** (aanbevolen): rustig, precies, met terugspoelen. Een set kost een geoefende scouter 20–30 minuten voor beide ploegen, 10–15 minuten voor alleen de eigen ploeg. Een hele wedstrijd: één avond.
- **Vooraf, van de tegenstander**: vraag video op bij een collega-coach of film zelf hun wedstrijd tegen een ander. Rotatie en beste aanvaller heb je na één set.

---

## Deel 2 — Scouting in de app

### 2.1 Voorbereiding (eenmalig per wedstrijd)

De Scout-module leunt volledig op wat je **tijdens de wedstrijd** al vastlegt in het tabblad *Wedstrijd*:

1. **Spelers** met correct rugnummer, en de libero gemarkeerd met **L**.
2. Per set de **startopstelling** bevestigd ("Opstelling bevestigen").
3. **Wissels** vastgelegd via de app (met de stand erbij) — de Scout-module past ze automatisch toe op het juiste moment.
4. Wedstrijd **bewaard**.

Heb je dat niet gedaan (bv. een wedstrijd die je alleen op video hebt), maak dan eerst de wedstrijd aan in *Wedstrijd*: startopstelling per set invullen, bevestigen, bewaren. Wissels kun je ook tijdens het scouten toevoegen met "Wissel…".

De **video** staat lokaal op je toestel: op een laptop in een map, op een tablet in Bestanden of Foto's. De app laadt hem in de browser maar uploadt niets. Alleen de tags gaan naar de database.

### 2.2 Het scherm

Tabblad **Scout** bovenaan. Het scherm heeft twee delen:

**Links — video en taggen**
- Wedstrijdkeuze, "Video kiezen…", Statistieken, CSV.
- De video met knoppen −5s / −1s / play / +1s / +5s en de afspeelsnelheid.
- De vier stappen van een tag: **wie → actie → zone → kwaliteit**.
- Punt wij / Punt zij / Ongedaan.
- Het log: elke tag met tijdstip. Tik op een regel om de video daarnaartoe te spoelen (2 seconden ervoor).

**Rechts — de toestand**
- Stand en wie er serveert.
- Set, "Start opslag" (wie serveerde als eerste in deze set), correctieknoppen.
- Veld van je eigen ploeg: wie staat op dit moment in welke zone, afgeleid uit startopstelling + rotatie + wissels + libero.
- Veld van de tegenstander: vult zich naarmate je hun servers noteert.

### 2.3 Een set scouten, stap voor stap

**Stap 0 — Set instellen**
Kies de set rechts. Zet "Start opslag" op *wij* of *zij*. Controleer of het veld van je ploeg klopt met wat je op de video ziet.

**Stap 1 — Start de video** en pauzeer bij het eerste contact dat je wilt taggen. Met de spatiebalk pauzeer je; ← en → springen 5 seconden.

**Stap 2 — Tag het contact** in vier tikken (of toetsen):

| Stap | Tik | Toets |
|---|---|---|
| Wie | knop met ploegnaam | `W` wij, `T` tegenstander |
| Actie | opslag / receptie / pas / aanval / blok / verdediging | `S` `R` `P` `A` `B` `V` |
| Zone | tik op het vak in het veld rechts | `1` – `6` |
| Kwaliteit | `#` `+` `!` `-` `/` `=` | dezelfde toetsen |

Bij de kwaliteitstik wordt de tag opgeslagen. De **speler wordt automatisch ingevuld** op basis van de zone: de app kijkt wie op dat moment in die zone hoort te staan. In het log zie je "VNK · receptie z6 + · #8".

Na een tag onthoudt de app de ploeg; je hoeft alleen actie, zone en kwaliteit opnieuw te kiezen.

**Stap 3 — Einde rally**: tik **Punt wij** (`Q`) of **Punt zij** (`E`). De app:
- verhoogt de stand,
- bepaalt wie nu serveert,
- draait de ontvangende ploeg door als die het punt won (side-out),
- past wissels uit het wedstrijdlog toe als de stand daar overeenkomt,
- wist de "wie"-keuze zodat je met een schone lei begint.

**Stap 4 — Herhaal** tot de set gedaan is. Ga naar de volgende set.

### 2.4 De opslag van de tegenstander (hun rotatie leren)

Tag je `T` → `S` → zone 1 → kwaliteit, dan vraagt de app: **"Rugnummer van de server"**. Typ het nummer dat je op de video ziet.

- Na de eerste server weet de app dat die speler op zone 1 stond; de vijf anderen zijn nog `?`.
- Elke nieuwe server vult een zone in (de tweede server stond op zone 2, de derde op 3, enz.).
- Na zes verschillende servers is hun **hele rotatie bekend**. Vanaf dan vult de app ook bij hun receptie en aanval het rugnummer in, en stelt bij een volgende opslag het verwachte nummer al voor (je bevestigt gewoon met Enter).

Een set later serveren ze in dezelfde volgorde maar starten ze mogelijk in een andere rotatie: de teller begint per set opnieuw. Meestal heb je hun opstelling in set 2 dan na twee servers al herkend en kun je de rest gewoon invullen omdat de volgorde vast ligt.

### 2.5 Libero

De libero staat niet in de startopstelling maar vervangt in de praktijk een achterspeler. Twee manieren:

- **"Libero staat in voor"**: kies de speler die de libero vervangt (bijna altijd een middenaanvaller). Zodra die speler in de achterrij staat, toont het veld de libero op die plaats en krijgen receptie en verdediging in die zone automatisch de libero. Zet dit bij het begin van de set en vergeet het.
- **Toets `L`**: markeer eenmalig dat de volgende tag door de libero is, ongeacht positie. Handig bij een onverwachte liberowissel.

In de statistieken wordt de libero apart geteld en in het log staat "(L)" achter de naam.

### 2.6 Correcties

- **Ongedaan** (`Z`) verwijdert de laatste tag of het laatste punt in deze set.
- **× in het log** verwijdert een specifieke tag. Verwijder je een punt, dan herrekent de app alle rotaties erna.
- **⇄ opslag**: wissel wie serveert (bv. als je een rally vergeten bent).
- **↻ wij / ↻ zij**: handmatig één positie doordraaien.
- **Wissel…**: een wissel toevoegen die niet in het wedstrijdlog stond. Je kiest het startslot dat eruit gaat en het rugnummer dat erin komt.
- **Verkeerde speler** bij een tag? De app leidt de speler af uit de zone; als iemand op een ongebruikelijke plaats stond (bv. een setter die een noodbal verdedigt in zone 4), tag dan de zone waar de speler *hoort* te staan, of verwijder de tag en tag opnieuw na `L` of een handmatige correctie. Dit is de bewuste beperking van het systeem: 95% van de contacten volgt de rotatie, de andere 5% corrigeer je met de hand.

### 2.7 Wat je minimaal tagt (advies per doel)

| Doel | Tag dit | Tijd per set |
|---|---|---|
| Alleen speeltijd en score | Alleen punten (`Q`/`E`) | 5 min |
| Eigen receptie en aanval | Wij: R, A; alle punten | 10–15 min |
| Volledig eigen beeld | Wij: S, R, A, B, V; alle punten | 20 min |
| Tegenstander voorbereiden | Zij: S (met nummer), R, A; alle punten | 15 min |
| Wedstrijdanalyse compleet | Alles voor beide ploegen | 30–40 min |

Sla de pas (P) over tenzij je specifiek de verdeling van je setter wilt zien.

### 2.8 Statistieken lezen

Knop **Statistieken** (in Scout) toont per ploeg een tabel per speler:

| Kolom | Betekenis |
|---|---|
| Rec | aantal recepties |
| Rec+ | % positieve recepties (`#` en `+`) |
| RecF | receptiefouten (aces tegen) |
| Aanv / Kills / AanvF | aanvallen, kills (`#`), fouten (`=` en `/`) |
| Eff | (kills − fouten) / aanvallen |
| Opsl / Aces / OpslF | opslagen, aces, fouten |
| Blok | blokpunten |
| Verd | verdedigingen |

Interpretatie op clubniveau (dames/heren provinciaal, U17):
- Rec+ boven 50% is goed; een speler onder 35% is een doelwit voor de tegenstander.
- Eff boven 20% is goed; negatief betekent meer fouten dan punten.
- Meer opslagfouten dan aces: opslag risicovoller dan de opbrengst.

### 2.9 Export

**CSV** (in Scout) geeft elke tag als een rij: set, tijd, ploeg, actie, zone, kwaliteit, rugnummer, libero, stand, rotatie van beide ploegen. Open in Excel voor draaitabellen — bijvoorbeeld receptie positief % per rotatie, wat de app zelf (nog) niet toont.

**Seizoen als Excel** (bovenaan) is de export van opstellingen en setstanden over alle wedstrijden; die staat los van de scouting.

### 2.10 Tips uit de praktijk

- **Film vanaf de eindlijn, hoog**: zo zie je alle zes zones en de rugnummers. Zijwaarts gefilmd is de rotatie onleesbaar.
- **Scout op 0.75× snelheid** de eerste keren; op 1× zodra de toetsen in je vingers zitten.
- **Doe eerst de punten van een hele set**, dan pas de contacten. Zo klopt de rotatie zeker vóór je gaat taggen, en zie je op het veld rechts meteen of het overeenkomt met de video. Klopt het niet, dan zit er een punt te veel of te weinig — corrigeer dat vóór je verdergaat.
- **Werk met twee mensen**: één bedient de video, de ander roept "wij receptie zes plus". Dat gaat dubbel zo snel en je discussieert de kwaliteit ter plekke.
- **Vergelijk per rotatie**, niet alleen per speler. Een zwakke rotatie is meestal een combinatie (setter voor + zwakke ontvanger + geen middenaanvaller), geen individu.
- **Deel met de spelers wat ze zelf kunnen beïnvloeden**: eigen opslagfouten en receptie-%. Aanvalsefficiëntie hangt van de pas af; gebruik die intern.
- **Bewaar de video** (of minstens de clips) naast de tags; het log spoelt naar elk moment, dus terugkijken met een speler kost geen zoekwerk.

### 2.11 Veelgestelde vragen

**De app zet een verkeerde speler bij mijn tag.**
Controleer eerst het veld rechts: klopt de rotatie met de video? Zo niet, mis je een punt of een wissel. Corrigeer dat; alle tags erna worden herrekend. Klopt de rotatie maar stond de speler echt ergens anders, gebruik `L` (libero) of tag de zone waar hij *hoort*.

**Ik ben een rally vergeten.**
Voeg alsnog het punt toe (`Q`/`E`); het tijdstip klopt dan niet exact maar de rotatie wel. Of gebruik ⇄ opslag / ↻ als alleen de opslag of rotatie verkeerd staat.

**De tegenstander wisselt: klopt hun rotatie dan nog?**
Nee. De app kent hun wissels niet. Na een wissel bij hen: bij de eerstvolgende opslag van de nieuwe speler typ je het nieuwe nummer; het vervangt de oude op die plaats. Voor aanvallen en recepties tussenin moet je het nummer met de hand controleren.

**Kan ik live scouten tijdens de wedstrijd?**
Technisch ja (zonder video), praktisch alleen de punten en misschien de receptie. De app is gebouwd voor analyse achteraf.

**Zien andere coaches mijn tags?**
Ja, alle coaches van de ploeg zien dezelfde scouting; de tags staan bij de wedstrijd in de database. De video zelf blijft op jouw toestel.

**Hoe deel ik het resultaat met de spelers?**
Statistieken → screenshot, of de CSV in Excel. Het wedstrijdverslag (tabblad Wedstrijd → Verslag) bevat opstellingen en wissels, niet de scouting; die twee combineren komt in een latere versie.

### 2.12 Aanvalsrichting

Tag je een aanval van je eigen ploeg (`W` → `A` → zone → kwaliteit), dan vraagt de app daarna **"Waar kwam de bal neer?"**: tik de zone aan de kant van de tegenstander (gezien vanaf hun kant, dus zone 1 is hun rechtsachter), of typ `1`–`6`. Bij een fout (`=`) of geblokte bal (`/`) wordt dit overgeslagen. Sla over met de spatiebalk of "Sla over" als je het niet zag.

Uit deze gegevens tekent het rapport per speelster een veldje met pijlen: van waar ze aanvalt naar waar de bal landt, groen voor een punt, grijs voor in spel, rood voor een fout. Na een paar wedstrijden zie je in één oogopslag wie altijd diagonaal slaat en wie de lijn durft — voor jou én voor het blok van de tegenstander.

### 2.13 Bankmodus (live scouten door een speelster)

De knop **Bankmodus** maakt van Scout één scherm voor live gebruik op de bank, bijvoorbeeld door een speelster die niet speelt:

- Bovenaan groot de **stand**, de set en wie serveert. Tik op de stand om ze te corrigeren als je punten gemist hebt: de app vult de ontbrekende punten aan.
- Daaronder één **vraag** die meebeweegt met het spel: "Dames H serveert — wie ving op?", "Wie viel aan, en hoe?", "Rally loopt — tik wat je ziet, of het punt".
- Alleen de **eigen ploeg**: hun opslag hoef je niet te taggen, de app begint bij jouw receptie. Rugnummers van de tegenstander zijn niet nodig.
- Kwaliteit in **woorden** (goed / matig / fout; punt / in spel / geblokt / fout). De app vertaalt ze naar de standaardcodes.
- Punten, opslagwissel en rotatie gaan automatisch na een ace, opslagfout, kill, geblokte bal of receptiefout. Twijfel je, dan zijn er altijd de grote knoppen **Punt wij / Punt zij**.

**Iets gemist?** Dat is normaal en vangt de app op:
- Een actie gemist → tik gewoon de volgende die je wél zag; de klaargezette vraag is een voorstel, geen verplichting.
- Een hele rally gemist → alleen Punt wij / Punt zij. Rotatie en stand blijven kloppen.
- De stand loopt achter → tik op de stand en typ de juiste.
- Fout getikt → **Ongedaan**, of tik het blokje in de rallybalk weg.

Wat een bankspeelster minimaal doet: de punten. Dat alleen al geeft side-out en break per rotatie. Receptie en aanval erbij is de volgende stap; laat haar één set oefenen op video vóór de eerste echte wedstrijd, en wissel de taak af over de bank.

Na de wedstrijd zet je Bankmodus uit en verfijn je van video wat je wilt (tegenstander, blok, verdediging, aanvalsrichting). De punten en rotaties staan dan al goed.

### 2.14 Rapport (PDF)

**Rapport (PDF)** opent een afdrukbare pagina in Data Volley-stijl:

1. Totalen per speelster: opslag (tot/ace/fout), receptie (tot/pos%/fout), aanval (tot/kill/fout/eff), blok, verdediging, met ploegtotaal.
2. **Side-out en break per rotatie**: hoeveel rallies je ontving en won per rotatie (SO%) en hoeveel je op eigen opslag won (Break%). Een rotatie onder 40% side-out is je eerste trainingsonderwerp.
3. Aanvalsrichtingen per speelster (zie 2.12).
4. Dezelfde tabel voor de tegenstander.

Via de printdialoog van de browser bewaar je hem als PDF ("Opslaan als PDF"), of print je hem voor het bord in de kleedkamer. Het menu "Statistieken" in de app toont dezelfde rotatietabel ook op het scherm.

### 2.15 Slim taggen (standaard aan)

Met **Slim** aan zet de app na elke tag de logische volgende stap klaar en kent punten automatisch toe:

| Na deze tag | Gebeurt automatisch |
|---|---|
| Rally start | Ploeg, opslag, zone 1 en de server staan klaar: alleen kwaliteit tikken |
| Opslag `#` (ace) | Punt voor de server; dezelfde ploeg serveert weer |
| Opslag `=` | Punt voor de ontvanger; die serveert nu |
| Opslag in spel | Klaargezet: ontvangende ploeg, receptie |
| Receptie / verdediging / pas (geen fout) | Klaargezet: zelfde ploeg, aanval |
| Receptie `=` | Punt voor de server |
| Aanval `#` | Punt voor de aanvaller |
| Aanval `=` | Punt voor de tegenstander |
| Aanval `/` (geblokt) | Vraag "door wie?" met de drie netspelers → blok `#` én punt |
| Aanval in spel | Klaargezet: andere ploeg, verdediging |
| Blok `#` / `=` | Punt |

Een klaargezette stap is een voorstel: tik gewoon iets anders als het niet klopt. De knoppen **Punt wij / Punt zij** blijven werken voor rallies die je niet volledig tagt. Zet **Slim** uit als je liever alles zelf bepaalt (bv. bij het corrigeren van een oude set).

Een volledige rally "opslag – receptie – aanval geblokt" is zo vijf tikken in plaats van veertien.

### 2.16 De pas taggen (spelverdeling)

Standaard slaat Slim de pas over. Wil je de spelverdeling van je setter zien, zet dan **Pas taggen** aan (de instelling blijft bewaard):

1. Markeer je setter(s) in de spelerslijst met **S** (bij een 6-2 twee speelsters).
2. Na elke receptie of verdediging van je eigen ploeg zet de app de pas klaar met de setter-op-het-veld al ingevuld; je tikt alleen de kwaliteit (`#` perfect · `+` goed · `!` matig · `-` slecht · `=` fout). Gaf iemand anders de pas (noodbal), tik dan die speelster aan.
3. Daarna staat de aanval klaar zoals altijd.

Kost één tik extra per rally. In **Statistieken** en in het **Rapport** verschijnt dan "Spelverdeling per rotatie": het aandeel van de aanvallen naar zone 4, 3, 2 en achter, gesplitst naar de kwaliteit van de eerste bal, plus het percentage goede passes. Ook zonder de pas te taggen wordt de verdeling berekend uit de aanvalszones; je mist dan alleen de paskwaliteit.

### 2.17 Rollen: de app weet waar iedereen staat

Geef elke speelster in de spelerslijst een **rol**: Passeur, Midden, Hoek (passer-loper), Opposite of Libero. Per set kun je in het tabblad **Wedstrijd**, in het inklapbare vak "Rollen en systeem deze set" onder de opstelling, de rol en het systeem van die set aanpassen; Scout neemt dat over. Daarmee leidt de app af waar iemand in de rally staat, los van haar rotatiepositie:

| Actie | Voorspeler | Achterspeler |
|---|---|---|
| Aanval / blok | Hoek → zone 4, Midden → zone 3, Passeur en Opposite → zone 2 | Hoek → pipe (6), Opposite → 1 |
| Receptie / verdediging | rotatiezone | rotatiezone; Passeur achter → 1 |
| Pas | Passeur → 2 | Passeur → 2 |

Tik je een naam, dan staat de zone dus meteen goed; het veldje corrigeer je alleen bij een uitzondering. Bij receptie worden Passeur en Midden gedimd (die ontvangen normaal niet), en de **libero valt automatisch in** voor de midden die achteraan staat — "Libero staat in voor" hoef je niet meer te kiezen, tenzij je ervan afwijkt.

Speelt iemand deze set op een andere plek (invalster), gebruik dan **Rollen deze set…** rechts onder het veld; de basisrol blijft bewaard.

**Systeem per set** (naast de rollenknop): **1-5** (één setter, loopt in; internationaal 5-1), **2-4** (twee setters, de achterste verdeelt, de voorste valt aan vanuit zone 2 als hoek; internationaal 6-2) of **4-2 klassiek** (twee setters, de voorste verdeelt en valt niet aan). Een nieuwe set neemt het systeem van de vorige over. Met rollen én systeem weet de app wie de pas geeft en waar de hoek staat; bij "Pas taggen" staat de juiste setter al ingevuld.

### 2.18 De wedstrijd is de waarheid: vergrendeling en setstanden

- Bewaar je in het tabblad **Wedstrijd** een wedstrijd met een uitslag (drie gewonnen sets), dan wordt ze **vergrendeld**: stand en opstellingen zijn alleen-lezen. Wil je iets corrigeren, klik **Ontgrendelen** (met bevestiging), pas aan en bewaar opnieuw; daarna is ze weer dicht.
- Heeft een set in Wedstrijd al een stand, dan toont Scout die als "vastgelegd in wedstrijd: 25-21" en weigert punten die erbovenuit gaan. Zo kan je scouting nooit afwijken van de officiële uitslag. Klopt de stand niet, corrigeer dan eerst de wedstrijd.
- Scout je live (bank) op een set zonder stand, dan schrijft **Set afsluiten** de eindstand naar de wedstrijd.
- Na 25 punten met 2 verschil (15 in set 5) accepteert de app geen extra punten meer: sluit de set af of maak het laatste punt ongedaan.

---

## Bijlage — Toetsen op een rij

| Toets | Functie |
|---|---|
| `spatie` | video pauzeren / afspelen |
| `←` `→` | 5 seconden terug / vooruit |
| `W` `T` | wij / tegenstander |
| `S` `R` `P` `A` `B` `V` | opslag, receptie, pas, aanval, blok, verdediging |
| `1` – `6` | zone |
| `#` `+` `!` `-` `/` `=` | kwaliteit (slaat de tag op) |
| `Q` `E` | punt wij / punt zij |
| `Z` | ongedaan |
| `L` | volgende tag is de libero |
| `1`–`6` (na een aanval) | landingszone bij de tegenstander; `spatie` = overslaan |

## Bijlage — Woordenlijst

- **Side-out**: het winnen van een rally waarin de tegenstander serveerde; de winnende ploeg draait door.
- **Break point**: een punt gewonnen op eigen opslag.
- **Kill**: een aanval die rechtstreeks een punt oplevert.
- **Ace**: een opslag die rechtstreeks een punt oplevert.
- **Dig**: verdediging van een aanval.
- **5-1 / 6-2**: systeem met één setter die de hele set verdeelt, resp. twee setters die elk verdelen als ze achter staan.
- **Pipe**: aanval vanuit zone 6 achter de 3-meterlijn.
- **Rotatie 1 t/m 6**: de zes standen van een ploeg; in de app genummerd 0 t/m 5 vanaf de startopstelling.

## Bijlage — Wijzigingen

| Datum | Wat |
|---|---|
| 16 sep 2026 | Scout toont alleen gespeelde sets; rollenvak per set inklapbaar; setstanden in de wedstrijdkeuze van Scout |
| 16 sep 2026 | Handleiding in de app; wedstrijd vergrendelen na uitslag; scouting volgt de setstanden uit de wedstrijd; geen punten na setwinst |
| 16 sep 2026 | Rollen en systeem per set in Wedstrijd (Passeur, Midden, Hoek, Opposite, Libero); Scout neemt ze over |
| 16 sep 2026 | Telefoonweergave; Set afsluiten vanuit Scout; libero serveert nooit |
| 15 sep 2026 | Rollen met verwachte zones en automatische libero; systeem 1-5 / 2-4 / 4-2 |
| 15 sep 2026 | Spelerskeuze op naam; dubbel/tripel blok met assists; import herkent bestandstype |
| 15 sep 2026 | Herlaad-veilig bewaren; Cmd+Z; "Alleen eigen ploeg volgen"; blokuitkomsten |
| 15 sep 2026 | Rallybalk met net en balverloop; stapsgewijze bediening; rugnummers tegenstander via veldformulier |
| 15 sep 2026 | Bankmodus herwerkt; standcorrectie; slim taggen; aanvalsrichting; rapport (PDF); pas en spelverdeling |
| 15 sep 2026 | Supabase-versie live: login, database, meerdere coaches, backup/herstel, Scout-module |
