# Smart Student Dashboard 2048

Een compacte Nederlandstalige Future Simulation in de stijl van Maneshs negen Figma-schermen. Het inlogscherm is direct het startscherm: korte uitleg, simulatieprofiel, **Start simulatie**. Geen andere introductiewereld, account of echte login.

## Het scenario

Op 14 mei 2048 geeft de studiecoach aan dat Student kan doorgaan naar het volgende datapunt. De informatie is misleidend: AI verwart voortgang met beheersing. De student kan dit opvatten als “ik ben klaar” en daardoor noodzakelijke oefening overslaan.

De statusbalk maakt het verschil zichtbaar tussen de AI-inschatting, de gecontroleerde voorbereiding en de gevoelens van het fictieve personage. **88%, 58% en 80% zijn geschreven scenario-indicatoren, geen gemeten slaagkansen, cijfers of formele normen.** Een tekstcorrectie verbetert de voorbereiding niet; gerichte oefening wel. De uitkomst is verhalend, niet voorspellend.

## Speelroutes

1. **Advies volgen:** kies “ik ben klaar”, ga twee dagen vooruit. Onderbouwing ontbreekt, het datapunt is nog niet aangetoond. De student voelt zich verward en teleurgesteld.
2. **Uitleg controleren:** vergelijk de voortgang met de daadwerkelijke rubric. Geef feedback en laat Sam het advies controleren. Zonder oefening blijft de voorbereiding gelijk en kan het datapunt nog steeds misgaan.
3. **Hulp vragen:** een docent controleert de interpretatie. Oefen daarna een nieuwe casus; de geschreven uitkomst laat betere voorbereiding zien.
4. **Herstel na schade:** vergelijk alleen advies corrigeren, begeleiding plus een herstelmoment, of risicovol advies pauzeren. Een patch maakt een gemist datapunt niet alsnog behaald. Alleen een bevoegde beoordelaar beslist over een nieuwe beoordeling.

De afsluiting bevat de impact op student, systeem en opleiding, ELSA, een morele grens vanuit gevolgenethiek en plichtethiek en voorwaarden voor verantwoord gebruik. Extra uitleg staat achter een uitklapbaar onderdeel.

## Designbasis

Figma-bestand `4XGmYePtcXRxnQHKydjMeC`, opnieuw bekeken via design context en screenshots:

| Figma | Toepassing |
| --- | --- |
| 01 Login · 2:2 | Start met uitleg en simulatieprofiel |
| 02 AI Heads-up · 2:225 | Kort uitlegvenster na starten |
| 03 Dashboard · 2:31 | Rooster, deadlines, resultaten, focus en AI-advies |
| 04 AI Explanation · 2:439 | Data versus AI-interpretatie versus rubric |
| 05 AI Feedback · 2:496 | Werkend feedbackformulier |
| 06 Confirmation · 2:545 | Ontvangst, gevolgd door menselijke controle |
| 07 Updated Advice · 2:578 | Gecorrigeerd advies; voorbereiding nog niet hersteld |
| 08 Settings · 2:630 | AI- en datagebruik, contrast en privacyuitleg |
| 09 Dashboard 2.0 · 69:723 | Aangepaste focus en oefenen met een docent |

De vormgeving gebruikt de bestaande Inter-font, campusafbeelding, sectie-iconen en kleuren uit het prototype. De statusbalk, keuzevensters, gevolg- en reflectieschermen zijn aanvullingen. De oude, donkere Failure Files-versie wordt niet meer als startpagina gebruikt.

## Openen en testen

Open `index.html` met VS Code Live Server, of start in deze map `python -m http.server 8000` en open `http://localhost:8000`. Geen installatie of backend nodig. Alle bestanden kunnen onder een GitHub Pages-subpad staan. De bovenliggende repository-startpagina verwijst naar dit project.

`node simulation.test.cjs` controleert de route-logica: misinterpretatie, voorbereiding, drie herstelkeuzes, oefenen na review, geen verbetering door herhaald klikken, privacybediening, escaping en schermrenders. Browsercontrole omvat de belangrijkste routes, feedbackvalidatie, instellingen en mobiele weergave.

Printen gebruikt de browserdialoog. De reflectie en het beslisspoor krijgen een lichte printweergave; uitklapbare toelichting wordt tijdens printen geopend. Kies zelf de PDF-bestemming. Een geëxporteerde PDF is niet apart visueel gecontroleerd.

## Grenzen

Geen echte AI, accounts, studentgegevens of onderwijsbesluiten. Feedback wordt niet verstuurd of duurzaam opgeslagen; herladen begint opnieuw bij het inlogscherm. Alle gevoelens beschrijven een fictief personage, niet de gebruiker. De beschikbare docent, planning, uitkomsten en toekomstcontext zijn aannames om te testen. Echte inzet vraagt toegankelijke menselijke hulp, monitoring, voldoende capaciteit en een stopprocedure. De simulatie is geen gebruikersonderzoek of juridische beoordeling.

De lokale Inter-font heeft een meegeleverde OFL-licentie. AI hielp bij implementatie en scenariotekst; Manesh beoordeelt en verdedigt het uiteindelijke ontwerp.

## Compacte presentatieweergave

Op desktop past de hoofdroute zonder paginascroll: start, dashboard, uitleg, feedback, aangepast advies, gevolg en terugblik. De indeling is gecontroleerd op 760×884, 1280×720 en 1366×768. Dashboardpanelen en keuzeknoppen blijven binnen de viewport zonder afkappen of pagina-zoom. Extra reflectietekst opent in een apart venster. Op telefoons en zeer lage vensters blijft de leesbare, scrollbare indeling beschikbaar.

## Drie perspectieven

Student is het fictieve personage. Via **Student · AI · Opleiding**, de gevolgpagina en de perspectieftitels in de terugblik kun je wisselen tussen ervaring en autonomie; data, automatisering en interpretatie; en beleid, support, toezicht, verantwoordelijkheid en menselijke controle. De inhoud volgt je route en herstelkeuze. In de herstelkeuze speel je expliciet de opleiding. De functies staan in `perspectives.js`.
