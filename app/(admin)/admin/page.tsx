export const metadata = {
  title: 'Dashboard - Panel Admina 3DFish',
};

const stats = [
  { label: 'Produkty', value: '6', description: 'W katalogu', color: 'bg-blue-50 text-blue-700' },
  { label: 'Zamówienia', value: '0', description: 'Łącznie', color: 'bg-green-50 text-green-700' },
  { label: 'Przychód', value: '0 PLN', description: 'W tym miesiącu', color: 'bg-orange-50 text-orange-700' },
  { label: 'Klienci', value: '0', description: 'Zarejestrowanych', color: 'bg-purple-50 text-purple-700' },
];

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Witaj w panelu administracyjnym 3DFish</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className={`text-3xl font-bold mt-2 ${stat.color.split(' ')[1]}`}>{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Szybkie akcje</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
            <p className="font-medium">Dodaj nowy produkt</p>
            <p className="text-sm mt-1">Funkcja dostępna w Etapie 2</p>
          </div>
          <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
            <p className="font-medium">Zarządzaj zamówieniami</p>
            <p className="text-sm mt-1">Funkcja dostępna w Etapie 2</p>
          </div>
        </div>
      </div>
    </div>
  );
}
