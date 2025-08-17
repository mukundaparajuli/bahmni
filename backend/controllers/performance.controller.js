const db = require('../config/db');
const asyncHandler = require('../middleware/async-handler');
const { ApiResponse } = require('../utils/api-response');
const ExcelJS = require('exceljs');

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

const buildWhereClause = (startDate, endDate, statusFilter) => {
	const whereClause = {
		scannedAt: {
			gte: startDate,
			lte: endDate,
		},
	};

	// Add status filter if provided
	if (statusFilter) {
		whereClause.status = statusFilter;
	}

	return whereClause;
};

// Remove the categorized status arrays since we'll use actual statuses
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
				status: {
					draft: 0,
					submitted: 0,
					approved: 0,
					rejected: 0,
					uploaded: 0,
					rescanned: 0,
					rescanned_approved: 0,
					rescanned_draft: 0
				},
				reportingPeriod,
			});
		}
		const entry = summariesByUserId.get(key);
		entry.totalCharts += 1;

		// Increment the specific status count
		if (entry.status.hasOwnProperty(doc.status)) {
			entry.status[doc.status] += 1;
		}
	});

	return Array.from(summariesByUserId.values()).sort((a, b) => b.totalCharts - a.totalCharts);
};

exports.getPerformanceSummaries = asyncHandler(async (req, res) => {
	const { startDate: startDateStr, endDate: endDateStr, status: statusFilter } = req.query;
	const { startDate, endDate } = parseDateRange(startDateStr, endDateStr);
	const reportingPeriod = buildReportingPeriodLabel(startDate, endDate);

	const whereClause = buildWhereClause(startDate, endDate, statusFilter);

	const documents = await db.document.findMany({
		where: whereClause,
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
	const { startDate: startDateStr, endDate: endDateStr, status: statusFilter } = req.query;
	const { startDate, endDate } = parseDateRange(startDateStr, endDateStr);
	const reportingPeriod = buildReportingPeriodLabel(startDate, endDate);

	const whereClause = buildWhereClause(startDate, endDate, statusFilter);

	const documents = await db.document.findMany({
		where: whereClause,
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
		{ header: 'Draft', key: 'draft', width: 12 },
		{ header: 'Submitted', key: 'submitted', width: 12 },
		{ header: 'Approved', key: 'approved', width: 12 },
		{ header: 'Rejected', key: 'rejected', width: 12 },
		{ header: 'Uploaded', key: 'uploaded', width: 12 },
		{ header: 'Rescanned', key: 'rescanned', width: 12 },
		{ header: 'Rescanned Approved', key: 'rescannedApproved', width: 18 },
		{ header: 'Rescanned Draft', key: 'rescannedDraft', width: 16 },
		{ header: 'Reporting Period', key: 'reportingPeriod', width: 28 },
	];

	summaries.forEach((s) => {
		sheet.addRow({
			employeeId: s.employeeId,
			fullName: s.fullName,
			department: s.department,
			totalCharts: s.totalCharts,
			draft: s.status.draft,
			submitted: s.status.submitted,
			approved: s.status.approved,
			rejected: s.status.rejected,
			uploaded: s.status.uploaded,
			rescanned: s.status.rescanned,
			rescannedApproved: s.status.rescanned_approved,
			rescannedDraft: s.status.rescanned_draft,
			reportingPeriod: s.reportingPeriod,
		});
	});

	const buffer = await workbook.xlsx.writeBuffer();
	let fileName = `performance_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}`;
	if (statusFilter) {
		fileName += `_${statusFilter}`;
	}
	fileName += '.xlsx';

	res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
	res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
	res.send(Buffer.from(buffer));
});