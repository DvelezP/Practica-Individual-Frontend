import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import type { Ticket } from '../../types';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface Props {
  tickets: Ticket[];
}

export function TicketChart({ tickets }: Props) {
  const pendiente = tickets.filter((t) => t.status === 'Pendiente').length;
  const ganado = tickets.filter((t) => t.status === 'Ganado').length;
  const perdido = tickets.filter((t) => t.status === 'Perdido').length;

  const doughnutData = {
    labels: ['Pendiente', 'Ganado', 'Perdido'],
    datasets: [
      {
        data: [pendiente, ganado, perdido],
        backgroundColor: ['#EAB308', '#22C55E', '#EF4444'],
        borderWidth: 2,
        borderColor: ['#CA8A04', '#16A34A', '#DC2626'],
      },
    ],
  };

  // Group by game type
  const gameTypes = ['Lotería', 'Rifa', 'Sorteo', 'Boleta', 'Juego ocasional'];
  const gameTypeCounts = gameTypes.map(
    (gt) => tickets.filter((t) => t.gameType === gt).length
  );

  const barData = {
    labels: gameTypes,
    datasets: [
      {
        label: 'Boletas por tipo',
        data: gameTypeCounts,
        backgroundColor: ['#818CF8', '#60A5FA', '#34D399', '#F472B6', '#94A3B8'],
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };

  if (tickets.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
          Estado de boletas
        </h3>
        <div className="flex justify-center">
          <div className="w-48 h-48">
            <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
          Boletas por tipo de juego
        </h3>
        <Bar data={barData} options={barOptions} />
      </div>
    </div>
  );
}
