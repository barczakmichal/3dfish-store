import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Regulamin',
  description: 'Regulamin sklepu internetowego treefish.pl',
};

export default function RegulamingPage() {
  return (
    <div className="bg-white min-h-screen">
      <section className="bg-blue-900 text-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            Regulamin sklepu
          </h1>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-gray-700 leading-relaxed">

          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg">
            <p className="font-semibold text-amber-900 mb-2">UWAGA EKSPERYMENTALNA</p>
            <p className="text-amber-800 text-sm mb-2">
              Zanim zaczniesz czytać ten regulamin, chcemy Ci coś wyznać: treefish to eksperyment.
              Tak, dobrze czytasz. Nasz sklep powstał jako projekt testowy - trochę z ciekawości,
              trochę z pasji do wędkarstwa, a trochę dlatego, że drukarka 3D stała i się nudziła.
            </p>
            <p className="text-amber-800 text-sm">
              Ale regulamin musi być regulaminem, więc oto on - w wersji, która (mamy nadzieję) nie uśpi Cię przed trzecim paragrafem.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">§1. Postanowienia ogólne</h2>
          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li>Sklep internetowy treefish.pl (dalej: Sklep albo my, czyli treefish) to platforma sprzedażowa oferująca akcesoria wędkarskie wydrukowane w technologii 3D.</li>
            <li>Właścicielem Sklepu jest... no cóż, my. Kontakt: kontakt@treefish.pl.</li>
            <li>Sklep działa na zasadzie eksperymentu - testujemy pomysły, produkty i technologie. Kupując u nas, stajesz się częścią tego eksperymentu (ale spokojnie, nie będziemy testować na Tobie żadnych prądownic).</li>
            <li>Regulamin określa zasady korzystania ze Sklepu, składania zamówień, płatności, dostawy i zwrotów.</li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">§2. Definicje (czyli tłumaczymy, co mamy na myśli)</h2>
          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li><strong>Klient</strong> - to Ty! Osoba, która odwiedza Sklep lub składa zamówienie.</li>
            <li><strong>Zamówienie</strong> - Twoja oficjalna prośba o produkt, potwierdzona płatnością.</li>
            <li><strong>Produkt</strong> - akcesoria wędkarskie drukowane w 3D. Nie są to produkty profesjonalne ani certyfikowane - to wydruki z drukarki 3D, robione z sercem, ale bez certyfikatów ISO.</li>
            <li><strong>Dzień roboczy</strong> - poniedziałek-piątek, z wyłączeniem świąt (i dni, kiedy ryby biorą szczególnie dobrze).</li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">§3. Charakter produktów (ważne, przeczytaj!)</h2>
          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li>
              Produkty oferowane w Sklepie są wytwarzane w technologii druku 3D (FDM/FFF). Oznacza to, że:
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600">
                <li>Mogą mieć widoczne warstwy druku - to cecha technologii, nie wada.</li>
                <li>Każdy wydruk może się minimalnie różnić - nie ma dwóch identycznych, jak płatki śniegu, tyle że z plastiku.</li>
                <li>Nie są to produkty profesjonalne ani przemysłowe.</li>
              </ul>
            </li>
            <li>Kupując w treefish, akceptujesz eksperymentalny charakter naszych produktów. Robimy co możemy, żeby były świetne, ale nie obiecujemy, że zastąpią profesjonalny sprzęt wędkarski za tysiące złotych.</li>
            <li>Produkty nie posiadają certyfikatów bezpieczeństwa ani atestów. Używasz ich na własną odpowiedzialność (i na własne ryby).</li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">§4. Składanie zamówień</h2>
          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li>Zamówienie składasz przez stronę treefish.pl - wybierasz produkt, dodajesz do koszyka i przechodzisz do płatności. Proste jak łowienie na spławik.</li>
            <li>Po złożeniu zamówienia otrzymasz potwierdzenie na podany adres e-mail.</li>
            <li>Umowa sprzedaży zostaje zawarta w momencie potwierdzenia zamówienia.</li>
            <li>
              Zastrzegamy sobie prawo do odmowy realizacji zamówienia w przypadku:
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600">
                <li>Błędnych danych adresowych.</li>
                <li>Podejrzenia oszustwa.</li>
                <li>Gdy drukarka 3D postanowi wziąć wolne (żartujemy... chyba).</li>
              </ul>
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">§5. Ceny i płatności</h2>
          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li>Wszystkie ceny w Sklepie podane są w złotych polskich (PLN) i zawierają VAT (o ile mamy obowiązek go naliczać).</li>
            <li>
              Obsługujemy następujące metody płatności:
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600">
                <li>BLIK - szybko i po polsku.</li>
                <li>Karta płatnicza - Visa, Mastercard.</li>
                <li>Klarna - kup teraz, zapłać później.</li>
                <li>Link - dla szybkich płatności.</li>
              </ul>
            </li>
            <li>Płatności obsługuje Stripe - bezpieczny i sprawdzony system.</li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">§6. Dostawa</h2>
          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li>Zamówienia wysyłamy za pośrednictwem usługi kurierskiej (obsługiwanej przez Furgonetka.pl).</li>
            <li>Czas realizacji zamówienia: 3-7 dni roboczych (bo wydruk 3D wymaga czasu, a my chcemy, żeby był perfekcyjny... no, prawie perfekcyjny).</li>
            <li>Koszty dostawy podane są w procesie zamówienia przed finalizacją płatności.</li>
            <li>Ryzyko utraty lub uszkodzenia przesyłki przechodzi na Klienta z chwilą jej doręczenia.</li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">§7. Prawo odstąpienia od umowy</h2>
          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li>Zgodnie z ustawą o prawach konsumenta, masz prawo odstąpić od umowy w ciągu 14 dni od otrzymania przesyłki, bez podawania przyczyny.</li>
            <li>Aby skorzystać z tego prawa, napisz do nas: kontakt@treefish.pl. Wystarczy jedno zdanie w stylu: <em>Hej treefish, chcę zwrócić zamówienie nr XYZ</em>.</li>
            <li>Produkt zwracasz na własny koszt. Powinien być w stanie nienaruszonym (czyli nie po 3 miesiącach wędkowania w deszczu).</li>
            <li>Zwrot pieniędzy nastąpi w ciągu 14 dni od otrzymania przez nas zwróconego produktu.</li>
            <li>Prawo odstąpienia nie przysługuje w przypadku produktów wykonanych na indywidualne zamówienie Klienta.</li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">§8. Reklamacje</h2>
          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li>Jeśli produkt ma wadę fizyczną, masz prawo złożyć reklamację.</li>
            <li>Reklamację zgłoś na: kontakt@treefish.pl z opisem problemu i zdjęciem.</li>
            <li>Rozpatrzymy reklamację w ciągu 14 dni.</li>
            <li>Pamiętaj: widoczne warstwy druku 3D, drobne różnice kolorystyczne i minimalne odchylenia wymiarowe nie stanowią wady produktu - to cechy technologii FDM, którą stosujemy.</li>
            <li>Biorąc pod uwagę eksperymentalny charakter naszych produktów, podchodzimy do reklamacji z otwartą głową i dobrą wolą. Zawsze spróbujemy znaleźć rozwiązanie.</li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">§9. Odpowiedzialność</h2>
          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li>
              Sklep treefish to projekt eksperymentalny. Nie ponosimy odpowiedzialności za:
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600">
                <li>Użycie produktów niezgodnie z ich przeznaczeniem.</li>
                <li>Szkody wynikłe z właściwości druku 3D (np. ograniczona wytrzymałość w porównaniu do tradycyjnych metod produkcji).</li>
                <li>Ucieczkę ryby z powodu użycia naszych akcesoriów (choć szczerze współczujemy).</li>
              </ul>
            </li>
            <li>Maksymalna odpowiedzialność Sklepu ograniczona jest do wartości zamówienia.</li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">§10. Dane osobowe</h2>
          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li>
              Twoje dane osobowe przetwarzamy zgodnie z RODO i naszą{' '}
              <Link href="/polityka-prywatnosci" className="text-blue-700 hover:underline">
                Polityką Prywatności
              </Link>
              .
            </li>
            <li>Przetwarzamy tylko dane niezbędne do realizacji zamówienia.</li>
            <li>Nie sprzedajemy Twoich danych. Serio. Nawet za naprawdę ładnego karpia.</li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">§11. Postanowienia końcowe</h2>
          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li>Regulamin wchodzi w życie z dniem opublikowania na stronie.</li>
            <li>Zastrzegamy sobie prawo do zmian regulaminu. O zmianach poinformujemy na stronie Sklepu.</li>
            <li>W sprawach nieuregulowanych niniejszym regulaminem zastosowanie mają przepisy prawa polskiego.</li>
            <li>Ewentualne spory rozstrzygane będą przez sąd właściwy dla siedziby Sklepu.</li>
            <li>Jeśli dotarłeś do końca tego regulaminu - szacunek! Zasługujesz na rybę.</li>
          </ol>

          <p className="text-sm text-gray-500 mt-10 pt-6 border-t border-gray-200">
            Ostatnia aktualizacja: lipiec 2025
          </p>
        </div>
      </article>
    </div>
  );
}
