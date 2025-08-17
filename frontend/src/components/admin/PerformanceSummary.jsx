import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '@/api/axios-instance';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

const STATUS_OPTIONS = [
	{ value: '', label: 'All Statuses' },
	{ value: 'draft', label: 'Draft' },
	{ value: 'submitted', label: 'Submitted' },
	{ value: 'approved', label: 'Approved' },
	{ value: 'rejected', label: 'Rejected' },
	{ value: 'uploaded', label: 'Uploaded' },
	{ value: 'rescanned', label: 'Rescanned' },
	{ value: 'rescanned_approved', label: 'Rescanned Approved' },
	{ value: 'rescanned_draft', label: 'Rescanned Draft' },
];

const PerformanceSummary = () => {
	const [startDate, setStartDate] = useState(() => {
		const d = new Date();
		d.setDate(d.getDate() - 29);
		return d.toISOString().split('T')[0];
	});
	const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
	const [statusFilter, setStatusFilter] = useState('');
	const [view, setView] = useState('table');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [data, setData] = useState([]);

	const fetchData = async () => {
		setLoading(true);
		setError('');
		try {
			const params = { startDate, endDate };
			if (statusFilter) {
				params.status = statusFilter;
			}
			const res = await axiosInstance.get('/performance', { params });
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
				acc.draft += cur.status?.draft || 0;
				acc.submitted += cur.status?.submitted || 0;
				acc.approved += cur.status?.approved || 0;
				acc.rejected += cur.status?.rejected || 0;
				acc.uploaded += cur.status?.uploaded || 0;
				acc.rescanned += cur.status?.rescanned || 0;
				acc.rescanned_approved += cur.status?.rescanned_approved || 0;
				acc.rescanned_draft += cur.status?.rescanned_draft || 0;
				return acc;
			},
			{
				draft: 0,
				submitted: 0,
				approved: 0,
				rejected: 0,
				uploaded: 0,
				rescanned: 0,
				rescanned_approved: 0,
				rescanned_draft: 0
			}
		);
	}, [data]);

	const pieData = useMemo(() => {
		return Object.entries(totals)
			.filter(([_, value]) => value > 0)
			.map(([name, value]) => ({
				name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
				value
			}));
	}, [totals]);

	const onDownload = async () => {
		try {
			const params = { startDate, endDate };
			if (statusFilter) {
				params.status = statusFilter;
			}
			const res = await axiosInstance.get('/performance/export', {
				params,
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
		<div className="p-4 max-w-screen overflow-y-scroll">
			<div className="flex flex-wrap items-end gap-4 mb-4">
				<div>
					<label className="block text-sm font-medium">Start Date</label>
					<input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border rounded px-2 py-1" />
				</div>
				<div>
					<label className="block text-sm font-medium">End Date</label>
					<input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border rounded px-2 py-1" />
				</div>
				<div>
					<label className="block text-sm font-medium">Status</label>
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						className="border rounded px-2 py-1 min-w-[150px]"
					>
						{STATUS_OPTIONS.map(option => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
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
								<th className="px-4 py-2 border">Draft</th>
								<th className="px-4 py-2 border">Submitted</th>
								<th className="px-4 py-2 border">Approved</th>
								<th className="px-4 py-2 border">Rejected</th>
								<th className="px-4 py-2 border">Uploaded</th>
								<th className="px-4 py-2 border">Rescanned</th>
								<th className="px-4 py-2 border">Rescanned Approved</th>
								<th className="px-4 py-2 border">Rescanned Draft</th>
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
									<td className="px-4 py-2 border">{row.status?.draft || 0}</td>
									<td className="px-4 py-2 border">{row.status?.submitted || 0}</td>
									<td className="px-4 py-2 border">{row.status?.approved || 0}</td>
									<td className="px-4 py-2 border">{row.status?.rejected || 0}</td>
									<td className="px-4 py-2 border">{row.status?.uploaded || 0}</td>
									<td className="px-4 py-2 border">{row.status?.rescanned || 0}</td>
									<td className="px-4 py-2 border">{row.status?.rescanned_approved || 0}</td>
									<td className="px-4 py-2 border">{row.status?.rescanned_draft || 0}</td>
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