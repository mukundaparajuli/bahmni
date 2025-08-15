import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { getOverview } from '@/api/admin-api'
import { AlertTriangle, Users, FileText, Clock, CheckCircle, XCircle, Upload, RotateCcw, FileCheck } from 'lucide-react'

export function Overview() {
    let { data, isLoading, error } = useQuery({
        queryKey: ['overview'],
        queryFn: getOverview,
    })
    data = data.data.data;
    console.log(data);

    if (error) {
        return (
            <Alert variant="destructive" className="max-w-4xl mx-auto mt-8">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    Failed to load overview data: {error.message}
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="min-h-screen w-full">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                        System Overview
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Monitor your document management system performance
                    </p>
                </div>

                {isLoading ? (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-32 rounded-xl" />
                            ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {[...Array(7)].map((_, i) => (
                                <Skeleton key={i} className="h-32 rounded-xl" />
                            ))}
                        </div>
                        <Skeleton className="h-96 rounded-xl" />
                    </div>
                ) : (
                    <>
                        {/* User Stats Section */}
                        <div className="mb-12">
                            <div className="flex items-center gap-2 mb-6">
                                <Users className="h-6 w-6 text-blue-600" />
                                <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">User Statistics</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard
                                    title="Scanner Clerks"
                                    value={data.stats.users.scanners}
                                    description="Total scanner clerks in system"
                                    icon={<FileCheck className="h-5 w-5" />}
                                    color="blue"
                                />
                                <StatCard
                                    title="Uploaders"
                                    value={data.stats.users.uploaders}
                                    description="Total uploaders in system"
                                    icon={<Upload className="h-5 w-5" />}
                                    color="green"
                                />
                                <StatCard
                                    title="Approvers"
                                    value={data.stats.users.approvers}
                                    description="Total approvers in system"
                                    icon={<CheckCircle className="h-5 w-5" />}
                                    color="purple"
                                />
                            </div>
                        </div>

                        {/* Document Stats Section */}
                        <div className="mb-12">
                            <div className="flex items-center gap-2 mb-6">
                                <FileText className="h-6 w-6 text-emerald-600" />
                                <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">Document Statistics</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard
                                    title="Total Documents"
                                    value={data.stats.documents.total}
                                    description="All documents in system"
                                    icon={<FileText className="h-5 w-5" />}
                                    color="slate"
                                    featured
                                />
                                <StatCard
                                    title="Draft"
                                    value={data.stats.documents.draft}
                                    description="Documents in draft status"
                                    icon={<Clock className="h-5 w-5" />}
                                    color="yellow"
                                />
                                <StatCard
                                    title="Submitted"
                                    value={data.stats.documents.submitted}
                                    description="Documents submitted for approval"
                                    icon={<FileText className="h-5 w-5" />}
                                    color="blue"
                                />
                                <StatCard
                                    title="Approved"
                                    value={data.stats.documents.approved}
                                    description="Approved documents"
                                    icon={<CheckCircle className="h-5 w-5" />}
                                    color="green"
                                />
                                <StatCard
                                    title="Rejected"
                                    value={data.stats.documents.rejected}
                                    description="Rejected documents"
                                    icon={<XCircle className="h-5 w-5" />}
                                    color="red"
                                />
                                <StatCard
                                    title="Uploaded"
                                    value={data.stats.documents.uploaded}
                                    description="Uploaded documents"
                                    icon={<Upload className="h-5 w-5" />}
                                    color="emerald"
                                />
                                <StatCard
                                    title="Rescanned"
                                    value={data.stats.documents.rescanned}
                                    description="Documents marked for rescan"
                                    icon={<RotateCcw className="h-5 w-5" />}
                                    color="orange"
                                />
                            </div>
                        </div>

                        {/* Recent Documents Section */}
                        <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-0 shadow-xl rounded-2xl">
                            <CardHeader className="pb-6">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-6 w-6 text-indigo-600" />
                                    <CardTitle className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
                                        Recent Documents
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {data.recentDocuments.map((doc) => (
                                        <div key={doc.id} className="group hover:shadow-lg transition-all duration-200 border border-slate-200 dark:border-slate-700 rounded-xl p-6 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                                                        {doc.title || 'Untitled Document'}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                                                        <Clock className="h-3 w-3" />
                                                        Scanned: {new Date(doc.scannedAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                                <StatusBadge status={doc.status} />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                {doc.scanner && (
                                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-700">
                                                        <FileCheck className="h-4 w-4 text-blue-600" />
                                                        <div>
                                                            <p className="text-slate-600 dark:text-slate-400 text-xs">Scanner</p>
                                                            <p className="font-medium text-slate-900 dark:text-slate-100">{doc.scanner.fullName}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {doc.approver && (
                                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-700">
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                        <div>
                                                            <p className="text-slate-600 dark:text-slate-400 text-xs">Approver</p>
                                                            <p className="font-medium text-slate-900 dark:text-slate-100">{doc.approver.fullName}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {doc.uploader && (
                                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-700">
                                                        <Upload className="h-4 w-4 text-purple-600" />
                                                        <div>
                                                            <p className="text-slate-600 dark:text-slate-400 text-xs">Uploader</p>
                                                            <p className="font-medium text-slate-900 dark:text-slate-100">{doc.uploader.fullName}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    )
}

function StatCard({ title, value, description, icon, color = "slate", featured = false }) {


    const iconBgClasses = {
        blue: "bg-blue-100 text-blue-600",
        green: "bg-green-100 text-green-600",
        purple: "bg-purple-100 text-purple-600",
        slate: "bg-slate-100 text-slate-600",
        yellow: "bg-yellow-100 text-yellow-600",
        red: "bg-red-100 text-red-600",
        emerald: "bg-emerald-100 text-emerald-600",
        orange: "bg-orange-100 text-orange-600"
    }

    return (
        <Card className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 rounded-2xl overflow-hidden ${featured ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}`}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${iconBgClasses[color]} group-hover:scale-110 transition-transform duration-200`}>
                        {icon}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                    {value.toLocaleString()}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {description}
                </p>
            </CardContent>
        </Card>
    )
}

function StatusBadge({ status }) {
    const statusConfig = {
        approved: {
            bg: "bg-green-100 dark:bg-green-900/30",
            text: "text-green-800 dark:text-green-300",
            border: "border-green-200 dark:border-green-700",
            icon: <CheckCircle className="h-3 w-3" />
        },
        rejected: {
            bg: "bg-red-100 dark:bg-red-900/30",
            text: "text-red-800 dark:text-red-300",
            border: "border-red-200 dark:border-red-700",
            icon: <XCircle className="h-3 w-3" />
        },
        draft: {
            bg: "bg-yellow-100 dark:bg-yellow-900/30",
            text: "text-yellow-800 dark:text-yellow-300",
            border: "border-yellow-200 dark:border-yellow-700",
            icon: <Clock className="h-3 w-3" />
        },
        submitted: {
            bg: "bg-blue-100 dark:bg-blue-900/30",
            text: "text-blue-800 dark:text-blue-300",
            border: "border-blue-200 dark:border-blue-700",
            icon: <FileText className="h-3 w-3" />
        },
        uploaded: {
            bg: "bg-emerald-100 dark:bg-emerald-900/30",
            text: "text-emerald-800 dark:text-emerald-300",
            border: "border-emerald-200 dark:border-emerald-700",
            icon: <Upload className="h-3 w-3" />
        }
    }

    const config = statusConfig[status] || statusConfig.draft

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
            {config.icon}
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    )
}