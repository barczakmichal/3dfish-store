import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: (process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL)! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existingCount = await prisma.product.count();

  // Rebrand existing products from 3DFish to treefish
  if (existingCount > 0) {
    const updated = await prisma.$executeRawUnsafe(
      `UPDATE "Product" SET name = REPLACE(name, '3DFish', 'treefish') WHERE name LIKE '%3DFish%'`
    );
    if (updated > 0) {
      console.log(`Rebrand: zmieniono nazwy ${updated} produktów z 3DFish na treefish.`);
    }
    console.log(`Baza zawiera ${existingCount} produktow — pomijam seed.`);
    return;
  }

  console.log('Rozpoczynam seed bazy danych...');

  // Top 10 produktów treefish — dane z CMO (SKL-4)
  const products = await prisma.product.createMany({
    data: [
      {
        name: 'treefish Uchwyt na Wędkę Universal',
        description:
          'Uniwersalny uchwyt na wędkę z druku 3D — stojak naścienny na wędkę do garażu, łodzi lub pomostu. Pasuje do wędek o średnicy 8-30mm. Drukowany z PETG — odporny na UV, deszcz i mróz. Montaż na 2 śruby (w zestawie). Miękka wkładka chroniąca blank wędki. Waga: zaledwie 45g. Idealny organizer wędek dla spinningistów i wędkarzy karpiowych, którzy cenią porządek i szybki dostęp do sprzętu.',
        price: 19.99,
        images: [],
        stock: 40,
        category: 'Organizacja i przechowywanie',
        slug: 'uchwyt-na-wedke-universal',
      },
      {
        name: 'treefish Organizer Tackle Box Pro',
        description:
          'Modularny organizer wędkarski do pudełek na przynęty — wkładka tackle box kompatybilna z Plano 3600/3700 i Meiho VS-3010/3020. Modularne przegródki — konfiguruj według potrzeb. Stabilne zamknięcia — nic się nie przesunie w transporcie. Osobne przegródki na haczyki, jigheady, spławiki i drobne akcesoria. Drukowany z PLA+, dostępny w wielu kolorach. Pojemnik na lury, który zamieni chaos w porządek.',
        price: 24.99,
        images: [],
        stock: 35,
        category: 'Organizacja i przechowywanie',
        slug: 'organizer-tackle-box-pro',
      },
      {
        name: 'treefish Spławik 3D — zestaw 5 szt.',
        description:
          'Zestaw 5 spławików wędkarskich z druku 3D w rozmiarach 1g, 2g, 3g, 5g, 8g. Neonowe kolory: czerwony, żółty, pomarańczowy — widoczne nawet o zmierzchu. Precyzyjne wyważenie — reagują na najdelikatniejsze branie. Spławik z dokładnie dobraną nośnością, niemożliwą do osiągnięcia w produkcji masowej. Trwały lakier UV — nie blakną. Drukowane z PLA+ i pokryte wodoodpornym lakierem.',
        price: 14.99,
        images: [],
        stock: 60,
        category: 'Akcesoria łowcze',
        slug: 'splawik-3d-zestaw-5szt',
      },
      {
        name: 'treefish Crankbait Hunter 7cm',
        description:
          'Lura crankbait 7cm z druku 3D — przynęta na szczupaka i okonia. Waga: 12g, zanurzalność: 1-2m. Realistyczny wobbling imitujący ruch małej ryby. Komora grzechotkowa przyciąga drapieżniki dźwiękiem. Wzmocnione oczka na haczyki treblowe. Dostępne wzory: okoń, płoć, ukleja, firetiger. Testowana na Zalewie Zegrzyńskim. Drukowana lura wędkarska z wykończeniem nie do odróżnienia od fabrycznej.',
        price: 12.99,
        images: [],
        stock: 30,
        category: 'Lury i przynęty',
        slug: 'crankbait-hunter-7cm',
      },
      {
        name: 'treefish Jig Head — zestaw 10 szt.',
        description:
          'Zestaw 10 główek jigowych do jigowania: 2x3g, 2x5g, 2x7g, 2x10g, 2x14g. Haczyki VMC (rozmiar dopasowany do gramatury). Kształty: round head, football head. Jaskrawe kolory: chartreuse, red, white, glow. Kompatybilne z gumami 2-4". Idealne główki jig na okonia, sandacza i szczupaka. Drukowane z wypełnieniem metalowym dla precyzyjnej wagi.',
        price: 19.99,
        images: [],
        stock: 25,
        category: 'Lury i przynęty',
        slug: 'jig-head-zestaw-10szt',
      },
      {
        name: 'treefish Stojak Bankowy na 4 Wędki',
        description:
          'Stabilny stojak bankowy na 4 wędki — rod pod karpiowy z druku 3D. Składana konstrukcja, regulowana wysokość nóg, gumowe końcówki. Kompatybilny z sygnalizatorami brań (buzz bar). Drukowany z PETG — odporny na warunki atmosferyczne. Waga: 280g. Przetestowany na sesjach 48h+ w deszczu, wietrze i słońcu. Idealny stojak wędkarski na sesje karpiowe.',
        price: 39.99,
        images: [],
        stock: 20,
        category: 'Organizacja i przechowywanie',
        slug: 'stojak-bankowy-4-wedki',
      },
      {
        name: 'treefish Uchwyt Serwisowy na Kołowrotek',
        description:
          'Uchwyt do bezpiecznego przechowywania i serwisowania kołowrotków. Pasuje do rozmiarów 1000-5000. Miękkie podkładki chroniące obudowę. Stabilna podstawa. Ułatwia czyszczenie i oliwienie mechanizmu. Drukowany z PETG. Świetny prezent dla wędkarza.',
        price: 14.99,
        images: [],
        stock: 45,
        category: 'Organizacja i przechowywanie',
        slug: 'uchwyt-serwisowy-kolowrotek',
      },
      {
        name: 'treefish Klip na Linkę — zestaw 20 szt.',
        description:
          'Zestaw klipów do organizacji i połączeń żyłki i plecionki. 20 szt. w 4 kolorach (po 5 sztuk). 3 rozmiary: S (do 0.20mm), M (do 0.35mm), L (do 0.50mm). Gładkie krawędzie nie uszkadzają żyłki. System snap-on — szybkie zakładanie i zdejmowanie. Drukowane z PLA+.',
        price: 9.99,
        images: [],
        stock: 80,
        category: 'Akcesoria drobne',
        slug: 'klip-na-linke-zestaw-20szt',
      },
      {
        name: 'treefish Fly Reel Classic #5/6',
        description:
          'Kołowrotek muchowy z druku 3D w klasycznym stylu. Rozmiar #5/6, system click & pawl. Waga: 95g — jeden z najlżejszych na rynku. Materiał ASA — odporny na UV, temperaturę i wilgoć. Duża spool mieści WF5 + 50m backing. Wymienne elementy. Produkt premium z dłuższym czasem produkcji.',
        price: 89.99,
        images: [],
        stock: 10,
        category: 'Połowy muchowe',
        slug: 'fly-reel-classic-5-6',
      },
      {
        name: 'treefish Panel Organizacyjny na Sprzęt',
        description:
          'Modularny panel ścienny 40x60cm do zawieszenia wędek, kołowrotków i akcesoriów. System pegboard z 10 dedykowanymi uchwytami: 4x uchwyt na wędkę, 2x hak na siatkę, 2x półka na pudełka, 2x uchwyt na kołowrotek. Montaż na 4 śruby. Możliwość rozbudowy. Wytrzymałość: do 15kg na panel. PETG.',
        price: 59.99,
        images: [],
        stock: 10,
        category: 'Organizacja i przechowywanie',
        slug: 'panel-organizacyjny-sprzet',
      },
    ],
  });

  console.log(`Utworzono ${products.count} produktów.`);
  console.log('Seed zakończony pomyślnie!');
}

main()
  .catch((e) => {
    console.error('Błąd seedowania:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
