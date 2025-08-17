const db = require('../config/db');
const asyncHandler = require('../middleware/async-handler');
const { ApiResponse } = require('../utils/api-response');
const ExcelJS = require('exceljs');

const PENDING_STATUSES = ['submitted', 'rescanned'];
const APPROVED_STATUSES = ['approved', 'rescanned_approved'];
const UPLOADED_STATUSES = ['uploaded'];

const parseDateRange = (startDateStr, endDateStr) => {
	let startDate;
	let endDate;
	if (startDateStr && endDateStr) {
		startDate = new Date(startDateStr);
		endDate = new Date(endDateStr);
		// Normalize to cover the whole end day
		endDate.setHours(23, 59, 59, 999);
	} else {
		const today = new Date();
		endDate = new Date(today);
		endDate.setHours(23, 59, 59, 999);
		startDate = new Date(endDate);
		startDate.setDate(startDate.getDate() - 29);
		startDate.setHours(0, 0, 0, 0);
	}
	return { startDate, endDate };
};

const buildReportingPeriodLabel = (startDate, endDate) => {
	const s = startDate.toISOString().split('T')[0];
	const e = endDate.toISOString().split('T')[0];
	return `${s} to ${e}`;
};

const computeSummaries = (documents, reportingPeriod) => {
	const summariesByUserId = new Map();

	documents.forEach((doc) => {
		const user = doc.scanner;
		if (!user) return;
		const key = user.id;
		if (!summariesByUserId.has(key)) {
			summariesByUserId.set(key, {
				employeeId: user.employeeId,
				fullName: user.fullName,
				department: user.department?.name || 'N/A',
				totalCharts: 0,
				status: { pending: 0, approved: 0, uploaded: 0 },
				reportingPeriod,
			});
		}
		const entry = summariesByUserId.get(key);
		entry.totalCharts += 1;
		if (PENDING_STATUSES.includes(doc.status)) {
			entry.status.pending += 1;
		}
		if (APPROVED_STATUSES.includes(doc.status)) {
			entry.status.approved += 1;
		}
		if (UPLOADED_STATUSES.includes(doc.status)) {
			entry.status.uploaded += 1;
		}
	});

	return Array.from(summariesByUserId.values()).sort((a, b) => b.totalCharts - a.totalCharts);
};

exports.getPerformanceSummaries = asyncHandler(async (req, res) => {
	const { startDate: startDateStr, endDate: endDateStr } = req.query;
	const { startDate, endDate } = parseDateRange(startDateStr, endDateStr);
	const reportingPeriod = buildReportingPeriodLabel(startDate, endDate);

	const documents = await db.document.findMany({
		where: {
			scannedAt: {
				gte: startDate,
				lte: endDate,
			},
		},
		select: {
			status: true,
			scannerId: true,
			scanner: {
				select: {
					id: true,
					employeeId: true,
					fullName: true,
					department: { select: { name: true } },
				},
			},
		},
	});

	const summaries = computeSummaries(documents, reportingPeriod);
	return ApiResponse(res, 200, summaries, 'Performance summaries fetched successfully');
});

exports.exportPerformanceSummaries = asyncHandler(async (req, res) => {
	const { startDate: startDateStr, endDate: endDateStr } = req.query;
	const { startDate, endDate } = parseDateRange(startDateStr, endDateStr);
	const reportingPeriod = buildReportingPeriodLabel(startDate, endDate);

	const documents = await db.document.findMany({
		where: {
			scannedAt: {
				gte: startDate,
				lte: endDate,
			},
		},
		select: {
			status: true,
			scannerId: true,
			scanner: {
				select: {
					id: true,
					employeeId: true,
					fullName: true,
					department: { select: { name: true } },
				},
			},
		},
	});

	const summaries = computeSummaries(documents, reportingPeriod);

	const workbook = new ExcelJS.Workbook();
	const sheet = workbook.addWorksheet('Performance Summary');

	sheet.columns = [
		{ header: 'Employee ID', key: 'employeeId', width: 18 },
		{ header: 'Full Name', key: 'fullName', width: 28 },
		{ header: 'Department', key: 'department', width: 22 },
		{ header: 'Total Charts', key: 'totalCharts', width: 16 },
		{ header: 'Pending', key: 'pending', width: 12 },
		{ header: 'Approved', key: 'approved', width: 12 },
		{ header: 'Uploaded', key: 'uploaded', width: 12 },
		{ header: 'Reporting Period', key: 'reportingPeriod', width: 28 },
	];

	summaries.forEach((s) => {
		sheet.addRow({
			employeeId: s.employeeId,
			fullName: s.fullName,
			department: s.department,
			totalCharts: s.totalCharts,
			pending: s.status.pending,
			approved: s.status.approved,
			uploaded: s.status.uploaded,
			reportingPeriod: s.reportingPeriod,
		});
	});

	const buffer = await workbook.xlsx.writeBuffer();
	const fileName = `performance_${startDate.toISOString().split('T')[0]}_to_${endDate
		.toISOString()
		.split('T')[0]}.xlsx`;

	res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
	res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
	res.send(Buffer.from(buffer));
});