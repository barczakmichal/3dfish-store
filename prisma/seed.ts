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

  // Top 10 produktów z researchu marketingowego (SKL-3)
  const products = await prisma.product.createMany({
    data: [
      {
        name: 'Uchwyt na wędkę naścienny 3D',
        description:
          'Solidny uchwyt na wędkę do montażu naściennego, drukowany z PETG odpornego na UV i wilgoć. Miękka wkładka chroniąca blank wędki. Montaż na 2 śruby, pasuje do wędek o średnicy blanku do 18mm. Idealny do garażu, piwnicy lub nad łóżko.',
        price: 29.99,
        images: [],
        stock: 40,
        category: 'Uchwyty na wędki',
        slug: 'uchwyt-na-wedke-nascienny-3d',
      },
      {
        name: 'Uchwyt na wędkę łodziowy 3D',
        description:
          'Wytrzymały uchwyt na wędkę do montażu na relingu łodzi. Drukowany z ASA — materiału odpornego na promieniowanie UV i wodę morską. Obrotowy mechanizm 360° pozwala na ustawienie wędki pod dowolnym kątem. Pasuje do relingów 22-32mm.',
        price: 49.99,
        images: [],
        stock: 25,
        category: 'Uchwyty na wędki',
        slug: 'uchwyt-na-wedke-lodziowy-3d',
      },
      {
        name: 'Organizer Tackle Box - wkładki Plano 3D',
        description:
          'Zestaw wkładek organizacyjnych do pudełek Plano 3600/3700. Drukowane z PLA+ w precyzyjnych wymiarach. Segregują przynęty, haczyki i akcesoria. Dostępne w 5 konfiguracjach przegródek. Łatwe do czyszczenia, odporne na wilgoć.',
        price: 34.99,
        images: [],
        stock: 35,
        category: 'Organizacja i przechowywanie',
        slug: 'organizer-tackle-box-wkladki-plano-3d',
      },
      {
        name: 'Spławik UltraFloat 3D - zestaw 5 szt.',
        description:
          'Zestaw 5 spławików drukowanych w 3D z precyzyjnie dobranymi nośnościami (1g, 2g, 3g, 5g, 8g). Jaskrawe kolory widoczne z daleka. Aerodynamiczny kształt minimalizuje opór powietrza podczas rzutu. Materiał odporny na wodę i UV.',
        price: 24.99,
        images: [],
        stock: 60,
        category: 'Spławiki',
        slug: 'splawik-ultrafloat-3d-zestaw',
      },
      {
        name: 'Lura Crankbait 3D - szczupak',
        description:
          'Twarda przynęta typu crankbait drukowana w 3D, zaprojektowana na szczupaka. Długość 9cm, waga 12g. Realistyczny wzór łuski, wbudowana komora z kulkami stalowymi tworzącymi hałas podwodny. Zanurzenie 1.5-2.5m. Kolor: firetiger.',
        price: 39.99,
        images: [],
        stock: 30,
        category: 'Lury i przynęty',
        slug: 'lura-crankbait-3d-szczupak',
      },
      {
        name: 'Główki jigowe 3D - zestaw 10 szt.',
        description:
          'Zestaw 10 główek jigowych drukowanych w 3D z osadzonym haczykiem ze stali nierdzewnej. Gramatury: 5g, 7g, 10g, 14g, 21g (po 2 szt.). Kształt typu Erie zapewniający naturalną prezentację. Malowane proszkowo, odporne na zarysowania.',
        price: 44.99,
        images: [],
        stock: 25,
        category: 'Lury i przynęty',
        slug: 'glowki-jigowe-3d-zestaw',
      },
      {
        name: 'Stojak na wędki bankowy 3D',
        description:
          'Stojak brzeżny na 4 wędki, drukowany z PETG wzmocnionego włóknem węglowym. Stabilna podstawa z kolcami do gruntu. Regulowane widełki pasujące do różnych średnic blanku. Składany — mieści się w plecaku. Waga: 280g.',
        price: 59.99,
        images: [],
        stock: 20,
        category: 'Stojaki na wędki',
        slug: 'stojak-na-wedki-bankowy-3d',
      },
      {
        name: 'Uchwyt serwisowy na kołowrotek 3D',
        description:
          'Uchwyt do przechowywania i serwisowania kołowrotków. Drukowany z PLA+ z antypoślizgową podstawą. Pasuje do kołowrotków rozmiar 1000-6000. Ułatwia czyszczenie, smarowanie i wymianę żyłki. Stabilny montaż na biurku lub stole.',
        price: 19.99,
        images: [],
        stock: 45,
        category: 'Akcesoria',
        slug: 'uchwyt-serwisowy-kolowrotek-3d',
      },
      {
        name: 'Klipy na linkę i łączniki 3D - zestaw 20 szt.',
        description:
          'Uniwersalne klipy do zabezpieczania linki wędkarskiej i łączenia elementów zestawu. Drukowane z nylonu PA12 — elastyczne i wytrzymałe. Zestaw zawiera 20 klipów w 4 rozmiarach. Pasują do żyłek 0.15-0.50mm i plecionek do 0.30mm.',
        price: 14.99,
        images: [],
        stock: 80,
        category: 'Akcesoria',
        slug: 'klipy-laczniki-3d-zestaw',
      },
      {
        name: 'Panel ścienny na sprzęt wędkarski 3D',
        description:
          'Modularny panel ścienny do organizacji sprzętu wędkarskiego. System haków i uchwytów drukowanych w 3D, montowany na płycie perforowanej. Pomieści 6 wędek, 4 kołowrotki i akcesoria. Wymiary panelu: 80x60cm. Materiał: PETG.',
        price: 89.99,
        images: [],
        stock: 10,
        category: 'Organizacja i przechowywanie',
        slug: 'panel-scienny-sprzet-wedkarski-3d',
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
