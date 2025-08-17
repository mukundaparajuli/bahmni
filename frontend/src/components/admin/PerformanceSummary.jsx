import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '@/api/axios-instance';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#F59E0B', '#10B981', '#3B82F6'];

const PerformanceSummary = () => {
	const [startDate, setStartDate] = useState(() => {
		const d = new Date();
		d.setDate(d.getDate() - 29);
		return d.toISOString().split('T')[0];
	});
	const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
	const [view, setView] = useState('table');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [data, setData] = useState([]);

	const fetchData = async () => {
		setLoading(true);
		setError('');
		try {
			const res = await axiosInstance.get('/performance', { params: { startDate, endDate } });
			setData(res.data?.data || []);
		} catch (e) {
			setError(e?.response?.data?.message || 'Failed to fetch performance data');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onApply = () => {
		fetchData();
	};

	const totals = useMemo(() => {
		return data.reduce(
			(acc, cur) => {
				acc.pending += cur.status?.pending || 0;
				acc.approved += cur.status?.approved || 0;
				acc.uploaded += cur.status?.uploaded || 0;
				return acc;
			},
			{ pending: 0, approved: 0, uploaded: 0 }
		);
	}, [data]);

	const pieData = useMemo(
		() => [
			{ name: 'Pending', value: totals.pending },
			{ name: 'Approved', value: totals.approved },
			{ name: 'Uploaded', value: totals.uploaded },
		],
		[totals]
	);

	const onDownload = async () => {
		try {
			const res = await axiosInstance.get('/performance/export', {
				params: { startDate, endDate },
				responseType: 'blob',
			});
			const blob = new Blob([res.data], { type: res.headers['content-type'] });
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			const disposition = res.headers['content-disposition'] || '';
			const match = disposition.match(/filename="?([^";]+)"?/);
			a.download = match?.[1] || `performance_${startDate}_to_${endDate}.xlsx`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			a.remove();
		} catch (e) {
			setError('Failed to download Excel');
		}
	};

	return (
		<div className="p-4">
			<div className="flex flex-wrap items-end gap-4 mb-4">
				<div>
					<label className="block text-sm font-medium">Start Date</label>
					<input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border rounded px-2 py-1" />
				</div>
				<div>
					<label className="block text-sm font-medium">End Date</label>
					<input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border rounded px-2 py-1" />
				</div>
				<button onClick={onApply} className="bg-blue-600 text-white px-4 py-2 rounded">
					Apply
				</button>
				<button onClick={onDownload} className="bg-green-600 text-white px-4 py-2 rounded">
					Download Excel
				</button>
				<div className="ml-auto flex gap-2">
					<button onClick={() => setView('table')} className={`px-3 py-2 rounded ${view === 'table' ? 'bg-gray-900 text-white' : 'bg-gray-200'}`}>Table</button>
					<button onClick={() => setView('charts')} className={`px-3 py-2 rounded ${view === 'charts' ? 'bg-gray-900 text-white' : 'bg-gray-200'}`}>Charts</button>
				</div>
			</div>

			{loading && <div>Loading...</div>}
			{!loading && error && <div className="text-red-600">{error}</div>}

			{!loading && !error && view === 'table' && (
				<div className="overflow-x-auto">
					<table className="min-w-full border">
						<thead className="bg-gray-100">
							<tr>
								<th className="px-4 py-2 border">Employee ID</th>
								<th className="px-4 py-2 border">Full Name</th>
								<th className="px-4 py-2 border">Department</th>
								<th className="px-4 py-2 border">Total Charts Processed</th>
								<th className="px-4 py-2 border">Pending</th>
								<th className="px-4 py-2 border">Approved</th>
								<th className="px-4 py-2 border">Uploaded</th>
								<th className="px-4 py-2 border">Reporting Period</th>
							</tr>
						</thead>
						<tbody>
							{data.map((row) => (
								<tr key={row.employeeId} className="odd:bg-white even:bg-gray-50">
									<td className="px-4 py-2 border">{row.employeeId}</td>
									<td className="px-4 py-2 border">{row.fullName}</td>
									<td className="px-4 py-2 border">{row.department}</td>
									<td className="px-4 py-2 border">{row.totalCharts}</td>
									<td className="px-4 py-2 border">{row.status?.pending || 0}</td>
									<td className="px-4 py-2 border">{row.status?.approved || 0}</td>
									<td className="px-4 py-2 border">{row.status?.uploaded || 0}</td>
									<td className="px-4 py-2 border">{row.reportingPeriod}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{!loading && !error && view === 'charts' && (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<div className="h-80 bg-white border rounded p-4">
						<h3 className="font-semibold mb-2">Total Charts Processed per User</h3>
						<ResponsiveContainer width="100%" height="90%">
							<BarChart data={data}>
								<XAxis dataKey="fullName" hide={false} interval={0} angle={-20} textAnchor="end" height={60} />
								<YAxis />
								<Tooltip />
								<Legend />
								<Bar dataKey="totalCharts" fill="#3B82F6" name="Total Charts" />
							</BarChart>
						</ResponsiveContainer>
					</div>
					<div className="h-80 bg-white border rounded p-4">
						<h3 className="font-semibold mb-2">Overall Status Distribution</h3>
						<ResponsiveContainer width="100%" height="90%">
							<PieChart>
								<Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
									{pieData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
									))}
								</Pie>
								<Tooltip />
								<Legend />
							</PieChart>
						</ResponsiveContainer>
					</div>
				</div>
			)}
		</div>
	);
};

export default PerformanceSummary;