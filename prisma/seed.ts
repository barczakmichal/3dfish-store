import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Rozpoczynam seed bazy danych...');

  // Usuń istniejące dane
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  // Top 10 produktów 3DFish — dane z CMO (SKL-4)
  const products = await prisma.product.createMany({
    data: [
      {
        name: '3DFish Uchwyt na Wędkę Universal',
        description:
          'Uniwersalny uchwyt na wędkę z druku 3D. Montaż naścienny lub do łodzi. Pasuje do wędek o średnicy 8-30mm. Drukowany z PETG — odporny na UV, deszcz i mróz. Montaż na 2 śruby (w zestawie). Miękka wkładka chroniąca blank wędki. Waga: 45g. Idealne rozwiązanie dla spinningistów i wędkarzy karpiowych.',
        price: 19.99,
        images: [],
        stock: 40,
        category: 'Organizacja i przechowywanie',
        slug: 'uchwyt-na-wedke-universal',
      },
      {
        name: '3DFish Organizer Tackle Box Pro',
        description:
          'Modularny organizer do pudełek na przynęty. Pasuje do popularnych modeli Plano 3600/3700 i Meiho VS-3010/3020. Modularne przegródki — konfiguruj według potrzeb. Stabilne zamknięcia — nic się nie przesunie w transporcie. Drukowany z PLA+, dostępny w wielu kolorach.',
        price: 24.99,
        images: [],
        stock: 35,
        category: 'Organizacja i przechowywanie',
        slug: 'organizer-tackle-box-pro',
      },
      {
        name: '3DFish Spławik 3D — zestaw 5 szt.',
        description:
          'Zestaw 5 spławików z druku 3D w rozmiarach 1g, 2g, 3g, 5g, 8g. Neonowe kolory: czerwony, żółty, pomarańczowy — widoczne nawet o zmierzchu. Precyzyjne wyważenie — reagują na najdelikatniejsze branie. Trwały lakier UV — nie blakną. Drukowane z PLA+ i pokryte wodoodpornym lakierem.',
        price: 14.99,
        images: [],
        stock: 60,
        category: 'Akcesoria łowcze',
        slug: 'splawik-3d-zestaw-5szt',
      },
      {
        name: '3DFish Crankbait Hunter 7cm',
        description:
          'Lura typu crankbait 7cm z druku 3D. Waga: 12g, zanurzalność: 1-2m. Realistyczny wobbling imitujący ruch małej ryby. Komora grzechotkowa przyciąga drapieżniki dźwiękiem. Wzmocnione oczka na haczyki treblowe. Dostępne wzory: okoń, płoć, ukleja, firetiger. Testowana na Zalewie Zegrzyńskim.',
        price: 12.99,
        images: [],
        stock: 30,
        category: 'Lury i przynęty',
        slug: 'crankbait-hunter-7cm',
      },
      {
        name: '3DFish Jig Head — zestaw 10 szt.',
        description:
          'Zestaw 10 główek jigowych: 2x3g, 2x5g, 2x7g, 2x10g, 2x14g. Haczyki VMC (rozmiar dopasowany do gramatury). Kształty: round head, football head. Jaskrawe kolory: chartreuse, red, white, glow. Kompatybilne z gumami 2-4". Idealne do jigowania na okonia, sandacza i szczupaka.',
        price: 19.99,
        images: [],
        stock: 25,
        category: 'Lury i przynęty',
        slug: 'jig-head-zestaw-10szt',
      },
      {
        name: '3DFish Stojak Bankowy na 4 Wędki',
        description:
          'Stabilny stojak bankowy na 4 wędki. Składana konstrukcja, regulowana wysokość nóg, gumowe końcówki. Kompatybilny z sygnalizatorami brań (buzz bar). Drukowany z PETG. Waga: 280g. Przetestowany na sesjach 48h+ w deszczu, wietrze i słońcu.',
        price: 39.99,
        images: [],
        stock: 20,
        category: 'Organizacja i przechowywanie',
        slug: 'stojak-bankowy-4-wedki',
      },
      {
        name: '3DFish Uchwyt Serwisowy na Kołowrotek',
        description:
          'Uchwyt do bezpiecznego przechowywania i serwisowania kołowrotków. Pasuje do rozmiarów 1000-5000. Miękkie podkładki chroniące obudowę. Stabilna podstawa. Ułatwia czyszczenie i oliwienie mechanizmu. Drukowany z PETG. Świetny prezent dla wędkarza.',
        price: 14.99,
        images: [],
        stock: 45,
        category: 'Organizacja i przechowywanie',
        slug: 'uchwyt-serwisowy-kolowrotek',
      },
      {
        name: '3DFish Klip na Linkę — zestaw 20 szt.',
        description:
          'Zestaw klipów do organizacji i połączeń żyłki i plecionki. 20 szt. w 4 kolorach (po 5 sztuk). 3 rozmiary: S (do 0.20mm), M (do 0.35mm), L (do 0.50mm). Gładkie krawędzie nie uszkadzają żyłki. System snap-on — szybkie zakładanie i zdejmowanie. Drukowane z PLA+.',
        price: 9.99,
        images: [],
        stock: 80,
        category: 'Akcesoria drobne',
        slug: 'klip-na-linke-zestaw-20szt',
      },
      {
        name: '3DFish Fly Reel Classic #5/6',
        description:
          'Kołowrotek muchowy z druku 3D w klasycznym stylu. Rozmiar #5/6, system click & pawl. Waga: 95g — jeden z najlżejszych na rynku. Materiał ASA — odporny na UV, temperaturę i wilgoć. Duża spool mieści WF5 + 50m backing. Wymienne elementy. Produkt premium z dłuższym czasem produkcji.',
        price: 89.99,
        images: [],
        stock: 10,
        category: 'Połowy muchowe',
        slug: 'fly-reel-classic-5-6',
      },
      {
        name: '3DFish Panel Organizacyjny na Sprzęt',
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
