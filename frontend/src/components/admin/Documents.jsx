import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Loader2, X, Filter, FileText, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { getAllDocuments } from "@/api/admin-api";
import ScannedDocumentCard from "../ScannedDocumentCard";

const DocumentList = () => {
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        status: "",
        patientMRN: "",
        employeeId: "",
        startDate: "",
        endDate: "",
    });

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["documents", page, filters],
        queryFn: () => getAllDocuments({ page, ...filters }),
        keepPreviousData: true,
    });

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPage(1);
    };

    const handleClearFilters = () => {
        setFilters({
            status: "",
            patientMRN: "",
            employeeId: "",
            startDate: "",
            endDate: "",
        });
        setPage(1);
    };

    const filteredDocuments = data?.data?.data?.data;
    const hasActiveFilters = Object.values(filters).some(value => value !== "");

    return (
        <div className="container mx-auto px-4 py-8 max-w-8xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Document Management</h1>
                        <p className="text-sm md:text-base text-muted-foreground">
                            View and manage all scanned documents in the system
                        </p>
                    </div>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-2">
                    {data?.total && (
                        <Badge variant="secondary" className="px-3 py-1">
                            {data.total.toLocaleString()} documents
                        </Badge>
                    )}
                    {data?.totalPages > 1 && (
                        <Badge variant="outline" className="px-3 py-1">
                            Page {page} of {data.totalPages}
                        </Badge>
                    )}
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            onClick={handleClearFilters}
                            size="sm"
                            className="text-muted-foreground hover:text-primary"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Clear filters
                        </Button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <Card className="mb-8 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        Filter Documents
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground">Status</label>
                            <Select
                                value={filters.status}
                                onValueChange={(value) => handleFilterChange("status", value === "all" ? "" : value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground">Patient MRN</label>
                            <Input
                                placeholder="Enter MRN"
                                value={filters.patientMRN}
                                onChange={(e) => handleFilterChange("patientMRN", e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground">Employee ID</label>
                            <Input
                                placeholder="Enter employee ID"
                                value={filters.employeeId}
                                onChange={(e) => handleFilterChange("employeeId", e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground">Date Range</label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                                    className="w-full"
                                />
                                <span className="text-muted-foreground text-sm">to</span>
                                <Input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => handleFilterChange("endDate", e.target.value)}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Loading */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-lg font-medium text-muted-foreground">Loading documents...</p>
                    <p className="text-sm text-muted-foreground">Please wait while we fetch your documents</p>
                </div>
            )}

            {/* Error */}
            {isError && (
                <Alert variant="destructive" className="mb-8">
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle className="font-medium">Error loading documents</AlertTitle>
                    <AlertDescription>
                        {error?.message || "There was an issue fetching the documents. Please try again later."}
                    </AlertDescription>
                </Alert>
            )}

            {/* Documents */}
            {!isLoading && !isError && (
                <>
                    {filteredDocuments?.length > 0 ? (
                        <>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {filteredDocuments.map((doc) => (
                                    <ScannedDocumentCard key={doc.id} document={doc} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {data?.totalPages > 1 && (
                                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="text-sm text-muted-foreground">
                                        Showing page {page} of {data?.totalPages} • {data?.total?.toLocaleString()} total documents
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            disabled={page === 1 || isLoading}
                                            onClick={() => setPage((prev) => prev - 1)}
                                            className="gap-1"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            disabled={page === data?.totalPages || isLoading}
                                            onClick={() => setPage((prev) => prev + 1)}
                                            className="gap-1"
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
                            <FileText className="h-12 w-12 text-muted-foreground" />
                            <h3 className="text-xl font-medium">No documents found</h3>
                            <p className="text-muted-foreground max-w-md">
                                {hasActiveFilters
                                    ? "Your current filters didn't match any documents. Try adjusting your search criteria."
                                    : "There are no documents available in the system yet."}
                            </p>
                            {hasActiveFilters && (
                                <Button
                                    variant="outline"
                                    onClick={handleClearFilters}
                                    className="mt-4"
                                >
                                    Clear all filters
                                </Button>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default DocumentList;