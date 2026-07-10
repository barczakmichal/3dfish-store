import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Polityka Prywatności',
  description: 'Polityka prywatności sklepu internetowego treefish.pl',
};

export default function PolitykaPrywatnosciPage() {
  return (
    <div className="bg-white min-h-screen">
      <section className="bg-blue-900 text-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            Polityka Prywatności
          </h1>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-gray-700 leading-relaxed">

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded-r-lg">
            <p className="font-semibold text-blue-900 mb-2">POLITYKA PRYWATNOŚCI (ale bez korporacyjnego żargonu)</p>
            <p className="text-blue-800 text-sm">
              Wiemy, że polityka prywatności brzmi jak coś, co czyta się tylko pod przymusem.
              Dlatego napisaliśmy ją tak, żebyś faktycznie wiedział(a), co robimy z Twoimi danymi.
              Spoiler: nic złego.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">§1. Kto jest administratorem Twoich danych?</h2>
          <p className="mb-4">
            My - treefish.pl. Sklep internetowy z akcesoriami wędkarskimi drukowanymi w 3D. Kontakt: kontakt@treefish.pl.
          </p>
          <p className="mb-6">
            Jesteśmy mali, eksperymentalni i bardzo poważnie podchodzimy do Twoich danych (nawet jeśli do wszystkiego innego podchodzimy z przymrużeniem oka).
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">§2. Jakie dane zbieramy?</h2>
          <p className="mb-3">Zbieramy tylko to, co naprawdę potrzebujemy:</p>
          <ol className="list-decimal pl-6 mb-6 space-y-3">
            <li>
              Przy składaniu zamówienia:
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600">
                <li>Imię i nazwisko (żeby wiedzieć, do kogo wysłać paczkę)</li>
                <li>Adres dostawy (żeby wiedzieć, gdzie wysłać paczkę)</li>
                <li>Adres e-mail (żeby potwierdzić zamówienie i informować o statusie)</li>
                <li>Numer telefonu (żeby kurier mógł się do Ciebie dodzwonić)</li>
              </ul>
            </li>
            <li>
              Automatycznie (przez pliki cookies):
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600">
                <li>Adres IP</li>
                <li>Typ przeglądarki</li>
                <li>Czas wizyty</li>
              </ul>
            </li>
          </ol>
          <p className="mb-6 text-gray-600 italic">
            Nie zbieramy: Twojego ulubionego gatunku ryby, rozmiaru buta ani preferencji dotyczących pogody na rybach. Choć brzmi to ciekawie.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">§3. Po co przetwarzamy Twoje dane?</h2>
          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li>Realizacja zamówienia - musimy wiedzieć, co, komu i gdzie wysłać.</li>
            <li>Kontakt w sprawie zamówienia - jeśli coś pójdzie nie tak (np. kurier się zgubi).</li>
            <li>Obowiązki prawne - faktury, podatki, takie tam.</li>
            <li>Analityka strony - żeby wiedzieć, czy ktoś w ogóle nas odwiedza (i czy ten eksperyment ma sens).</li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">§4. Podstawa prawna (RODO)</h2>
          <p className="mb-3">Przetwarzamy Twoje dane na podstawie:</p>
          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li>Art. 6 ust. 1 lit. b RODO - wykonanie umowy (realizacja zamówienia).</li>
            <li>Art. 6 ust. 1 lit. c RODO - obowiązek prawny (np. przepisy podatkowe).</li>
            <li>Art. 6 ust. 1 lit. f RODO - uzasadniony interes administratora (analityka, ulepszanie sklepu).</li>
            <li>Art. 6 ust. 1 lit. a RODO - Twoja zgoda (jeśli zapiszesz się na newsletter, którego jeszcze nie mamy, ale kto wie).</li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">§5. Komu udostępniamy Twoje dane?</h2>
          <p className="mb-3">Twoje dane mogą trafić do:</p>
          <ol className="list-decimal pl-6 mb-4 space-y-2">
            <li>Stripe - obsługa płatności (BLIK, karta, Klarna, Link). Stripe ma własną politykę prywatności i jest certyfikowany na poziomie PCI DSS Level 1.</li>
            <li>Furgonetka.pl - obsługa wysyłki (przekazujemy adres dostawy i dane kontaktowe).</li>
            <li>Organy państwowe - jeśli prawo tego wymaga (ale to raczej nie nasza ulubiona sytuacja).</li>
          </ol>
          <p className="mb-6 font-semibold">
            Nie sprzedajemy, nie wymieniamy i nie rozdajemy Twoich danych nikomu innemu. Punkt.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">§6. Jak długo przechowujemy dane?</h2>
          <ol className="list-decimal pl-6 mb-4 space-y-2">
            <li>Dane zamówienia - 5 lat (wymóg przepisów podatkowych i rachunkowych).</li>
            <li>Dane do celów analitycznych - do 2 lat lub do cofnięcia zgody.</li>
            <li>Dane z plików cookies - zgodnie z ustawieniami Twojej przeglądarki.</li>
          </ol>
          <p className="mb-6 text-gray-600 italic">
            Po upływie tych terminów dane są usuwane. Bez żalu (no, może troszkę).
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">§7. Twoje prawa (masz ich sporo!)</h2>
          <p className="mb-3">Zgodnie z RODO masz prawo do:</p>
          <ol className="list-decimal pl-6 mb-4 space-y-2">
            <li>Dostępu do swoich danych - <em>Hej treefish, co o mnie wiecie?</em></li>
            <li>Sprostowania - <em>Hej, źle napisaliście moje nazwisko!</em></li>
            <li>Usunięcia - <em>Zapomnijcie, że istnieję</em> (prawo do bycia zapomnianym).</li>
            <li>Ograniczenia przetwarzania - <em>Możecie dane mieć, ale nic z nimi nie róbcie</em>.</li>
            <li>Przenoszenia danych - <em>Dajcie mi moje dane w pliku</em>.</li>
            <li>Sprzeciwu - <em>Nie chcę, żebyście to robili</em>.</li>
          </ol>
          <p className="mb-3">
            Aby skorzystać z tych praw, napisz do nas: kontakt@treefish.pl. Odpowiemy najszybciej jak potrafimy (a potrafimy szybko, bo lubimy maile).
          </p>
          <p className="mb-6">
            Masz też prawo wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych (PUODO), ul. Stawki 2, 00-193 Warszawa - jeśli uznasz, że coś poszło nie tak.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">§8. Pliki cookies</h2>
          <p className="mb-3">Nasza strona używa plików cookies. Nie, nie tych do jedzenia.</p>
          <ol className="list-decimal pl-6 mb-4 space-y-2">
            <li><strong>Cookies niezbędne</strong> - potrzebne do działania sklepu (koszyk, sesja).</li>
            <li><strong>Cookies analityczne</strong> - pomagają nam zrozumieć, jak korzystasz ze strony.</li>
          </ol>
          <p className="mb-6">
            Możesz zarządzać cookies w ustawieniach swojej przeglądarki. Wyłączenie cookies niezbędnych może spowodować, że sklep nie będzie działać poprawnie (a koszyk zapomni o Twoich wspaniałych wyborach).
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">§9. Bezpieczeństwo danych</h2>
          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li>Strona działa na protokole HTTPS (kłódeczka w pasku adresu = Twoje dane są szyfrowane).</li>
            <li>Płatności obsługuje Stripe - jeden z najbezpieczniejszych systemów na świecie.</li>
            <li>Nie przechowujemy danych Twojej karty płatniczej - to robi Stripe.</li>
          </ol>
          <p className="mb-6">
            Robimy wszystko, co w naszej (eksperymentalnej) mocy, żeby Twoje dane były bezpieczne.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">§10. Zmiany w Polityce Prywatności</h2>
          <p className="mb-4">
            Możemy aktualizować tę politykę od czasu do czasu. O istotnych zmianach poinformujemy na stronie Sklepu.
          </p>
          <p className="mb-6">
            Jeśli masz pytania dotyczące prywatności - pisz śmiało: kontakt@treefish.pl. Odpowiadamy szybciej niż karp bierze na kukurydzę.
          </p>

          <p className="text-sm text-gray-500 mt-10 pt-6 border-t border-gray-200">
            Ostatnia aktualizacja: lipiec 2025
          </p>
        </div>
      </article>
    </div>
  );
}
