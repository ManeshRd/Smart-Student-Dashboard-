# Smart Student Dashboard / 2048 — faalscenario en herstelgame

Open `index.html` of `future-simulation.html`. Geen installatie, backend of echte login nodig. Alle cijfers, gebeurtenissen en beleidsregels zijn fictief.

## Spelverloop

1. **Start als student in je Figma-dashboard.** AI geeft fout advies over Manage & Control en maakt de planning bindend. Probeer extra oefentijd te vragen of de instellingen te wijzigen.
2. **Ervaar het faalmoment.** De verplichte voorbereiding behandelt het verkeerde onderdeel. Op de fictieve toets krijgt Manesh een **4,2**, met een herkansing en vertraging in de afronding van deze leeruitkomst als gevolg. Een onvoldoende voor één onderdeel betekent niet automatisch zakken voor de hele studie.
3. **Speel drie oplossingen.** Menselijk herstel; technische reparatie; stoppen met bindende AI. Elke route vraagt concrete handelingen en laat zien wat nog ontbreekt.
4. **Vergelijk gevolgen.** Zonder ondersteuning blijft de 4,2 staan. Met een begeleid hersteltraject volgt in het verhaal een 6,4. Een patch zonder begrenzing laat beslismacht bestaan. Een stop zonder begeleiding laat de student wachten.
5. **Sluit af met reflectie.** Gebruiker, systeem, organisatie; ELSA; morele grens vanuit plichtethiek en gevolgenethiek; aftercare; toetsbare aannames en Kill / Keep / Change.

Het eerste hoofdstuk is bewust een vast faalscenario. Het publiek moet eerst ervaren wat er misgaat als AI beslismacht heeft. Het herstelhoofdstuk is vertakt en kan op hetzelfde incident met andere oplossingen worden herspeeld.

De 4,2 en 6,4 zijn geschreven scenario-artefacten, geen berekende of gegarandeerde echte onderwijsuitkomsten. Voorgestelde begeleiding, termijnen en bevoegdheden zijn geen bestaand Windesheim-beleid.

## Het oorspronkelijke Figma-prototype

Kies **Bekijk eerst mijn Figma-prototype**. Alle negen schermen blijven beschikbaar: login, AI-heads-up, dashboard, uitleg, feedback, bevestiging, aangepast advies, instellingen en dashboard 2.0. Via **Spring naar 2048** start het spel.

## Presenteren in circa 8 minuten

- 1 min: begin als student; toon het verkeerde AI-advies en de geblokkeerde keuze.
- 1 min: speel de tijdsprong en lees de toetsuitslag en vertraging.
- 3 min: laat het publiek een oplossing kiezen; speel die en vergelijk met minstens één andere oplossing.
- 2 min: bespreek wat per gebruiker, systeem en organisatie wordt opgelost of juist blijft bestaan.
- 1 min: verdedig de morele grens en eindig met behouden, veranderen, stoppen en voorwaarden.

## Actieve bestanden

- `index.html` en `future-simulation.html`: startpagina.
- `student-dashboard.js`: het nagebouwde Figma-dashboard en de reflectie.
- `failure-game.js`: faalscenario, drie herstelroutes en concrete gevolgen.
- `student-dashboard.css`: dashboardstijl, game, responsive layout en printstijl.
- `assets/`: lokale Figma-assets en Inter-font inclusief OFL-licentie.

Oudere varianten zoals `risk-consequences.js` worden niet door de nieuwste pagina geladen. `archive-2030.html` bewaart de oorspronkelijke Engelstalige simulatie.

## Bronnen en grenzen

Gebaseerd op het aangeleverde Figma-bestand en Les 6, met name lessenoverzicht p. 3, aftercare p. 18, Kill / Keep / Change p. 19–20 en de eindcheck p. 21. De vijf andere lesdocumenten zijn niet aangeleverd. Theorie wordt toegepast op dit scenario; er zijn geen onderzoeksresultaten of interviews verzonnen. Het morele standpunt is een ontwerpvoorstel dat Manesh zelf moet beoordelen en verdedigen.

Figma: https://www.figma.com/design/4XGmYePtcXRxnQHKydjMeC/V1---DP4---Prototype--met-AI-?node-id=0-1

Verdieping: Voros/Futures Cone; NIST AI RMF; AVG als huidig juridisch vertrekpunt. Voor daadwerkelijk gebruik in 2048 moet de dan geldende regelgeving opnieuw worden getoetst.

## Verificatie

Getest in de browser: het geweigerde oefenverzoek, tijdsprong naar de 4,2, menselijk herstel met terugkerend systeemrisico, patch zonder studentherstel, stop met begeleiding en doorklik naar reflectie. JavaScript-syntax en browserfouten zijn gecontroleerd. Printstijl is aanwezig; een geëxporteerde PDF is niet apart visueel gecontroleerd.
