# Smart Student Dashboard 2048

Een zelfstandige Future Simulation over onjuist AI-studieadvies, concrete studentenschade en verschillende hersteloplossingen. De game heeft een zelfstandige spelopbouw met de lichtblauwe dashboardstijl van Manesh: campusbanner, witte afgeronde kaarten en blauwe accenten.

## Openen

Open `index.html` of `autopilot.html`. Geen installatie of internet nodig. Er zijn geen echte accounts, studentgegevens, netwerkverzoeken of schoolbesluiten.

## Spelverloop

1. **Advies:** je bent Manesh, tweedejaars student. Kies AI volgen, zelf de bronnen controleren of een mentor vragen.
2. **Toets:** de tijd springt vooruit. AI volgen of te late begeleiding leidt in deze fictieve casus tot een 4,2, herkansing en vertraging. Zelf oefenen levert een 6,1 op, maar een andere opdracht wordt te laat ingeleverd.
3. **Bezwaar:** ervaar automatische afwijzing of een onafhankelijke menselijke beoordeling.
4. **Herstelteam:** expliciete rolwisseling. Test drie oplossingen op hetzelfde incident: AI repareren, de student helpen of bindende AI pauzeren en de dienst herontwerpen.
5. **Gevolgen:** bekijk directe en uitgestelde impact op student, systeem en organisatie. Extra mentorcapaciteit is een afzonderlijke keuze; zonder capaciteit kan de fallback mislukken.
6. **Terugblik:** drie perspectieven, ELSA, morele grens vanuit plichtethiek en gevolgenethiek, aftercare en Kill / Keep / Change.

De cijfers, deadlines, aantallen, wachttijden en gevolgen zijn geschreven scenario-uitkomsten. Ze zijn geen voorspelling of berekening van echte studieresultaten. Een onvoldoende voor één onderdeel betekent niet automatisch zakken voor de hele studie. Er is geen verborgen timer en lezen kost geen speeltijd.

## Presentatieroute (8–10 minuten)

- 1 minuut: schets de toekomstcontext en open het AI-advies.
- 2 minuten: laat het publiek een studentaanpak kiezen en open de toetsuitslag. Benoem oorzaak, keuze en concreet gevolg.
- 1 minuut: ervaar bezwaar en de overdracht naar een bevoegde mens.
- 3 minuten: test minimaal twee hersteloplossingen. Benoem wat iedere oplossing wel en niet herstelt.
- 2 minuten: eindig met morele grens, aftercare, Kill / Keep / Change en voorwaarden voor gebruik.

Het reflectiescherm kan alle vijf onderdelen samen printen. De browser-PDF-export is niet apart visueel gecontroleerd.

## DP6-dekking

- Toekomstcontext: fictief 2048 met AI-planning voor 24.000 studenten.
- Risico: fout of oud profiel krijgt beslissende invloed op planning.
- Gevolg: onvoldoende, herkansing, vertraging, gemiste deadline, afhankelijkheid en gemiste ondersteuning.
- Drie niveaus: gebruiker, systeem en organisatie, ook tijdens herstel.
- ELSA: ethisch, juridisch, maatschappelijk en technologisch, met positieve en negatieve impact.
- Morele grens: AI mag geen studieroute afdwingen, uitsluiten of passende hulp weigeren op basis van een profiel.
- Onderbouwing: plichtethiek en gevolgenethiek; bijbehorende rechten, menselijke beoordeling en toezicht.
- Lifecycle: bron → advies → planning → beoordeling → bezwaar → herstel → monitoring → herstart of exit.
- Gerichte tests: oude of ontbrekende rubricdata injecteren, bezwaren tot herstel volgen, support onder piekbelasting en toegankelijkheid toetsen.
- Conclusie: geprioriteerd stoppen, behouden, aanpassen en voorwaarden voor verantwoord gebruik.

## Bronnen en grenzen

Het concept sluit aan op het eigen Smart Student Dashboard. Les 6 is gebruikt: lessenoverzicht p. 3, aftercare p. 18, Kill / Keep / Change p. 19–20 en eindcheck p. 21. De andere vijf lesdocumenten zijn niet aangeleverd; toepassingen daarvan zijn gebaseerd op het overzicht. Er zijn geen echte interviews of pilotresultaten verzonnen.

Verdieping:
- Voros / Futures Cone: https://foresightinternational.com.au/wp-content/uploads/2020/03/Voros-Primer-on-FS-2001-Final.pdf
- NIST AI RMF: https://airc.nist.gov/airmf-resources/airmf/5-sec-core/
- AVG: https://eur-lex.europa.eu/eli/reg/2016/679/oj — huidig vertrekpunt; voor inzet in 2048 opnieuw juridisch toetsen.

AI hielp bij scenario, teksten en implementatie. De morele grens is een ontwerpstandpunt dat Manesh zelf moet beoordelen en verdedigen. Het Inter-font heeft een meegeleverde OFL-licentie.

## Bestanden

- `autopilot.html`, `autopilot.js`, `autopilot.css`: zelfstandige game.
- `index.html`: dezelfde nieuwe startpagina.
- `dashboard-theme.css`, `assets/campus.png`: dashboardstijl en campusbanner.
- `assets/Inter.ttf`, `assets/OFL-Inter.txt`: lokaal font en licentie.
- `future-simulation.html`: eerdere dashboardgame; blijft afzonderlijk beschikbaar.
- `archive-2030.html`: oorspronkelijke Engelstalige simulatie.

## Getest

Alle drie studentroutes, beide bezwaarroutes, de drie hersteloplossingen, de capaciteitskeuze en de vijf reflectieonderdelen zijn doorlopen in de browser. JavaScript-syntax en browserfouten zijn gecontroleerd. De game berekent geen echte kans op falen en toont geen score die schade kan wegstrepen.
