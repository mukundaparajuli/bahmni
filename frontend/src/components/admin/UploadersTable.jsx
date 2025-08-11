import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAllUploaders } from '@/api/admin-api'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
    PaginationLink,
    PaginationNext,
} from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function UploadersTable() {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(5)

    const { data, isLoading, error } = useQuery({
        queryKey: ['uploaders', page, pageSize],
        queryFn: () => getAllUploaders({ page, limit: pageSize }),
    })

    const uploaders = data?.data?.data?.data || []
    const totalPages = data?.data?.totalPages || 1


    const handleViewDetails = (uploader) => {
        // Implement your detail view logic
        console.log('View details:', uploader)
    }

    if (isLoading) return <div className="text-center py-8">Loading uploaders...</div>
    if (error) return <div className="text-red-500 text-center py-8">Error: {error.message}</div>

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Employee ID</TableHead>
                            <TableHead>Full Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Roles</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Active</TableHead>
                            <TableHead>Uploaded Documents</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {uploaders.map((uploader) => (
                            <TableRow key={uploader.id}>
                                <TableCell>{uploader.id}</TableCell>
                                <TableCell>{uploader.employeeId}</TableCell>
                                <TableCell>{uploader.fullName}</TableCell>
                                <TableCell>{uploader.email}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {uploader.roles.map((role) => (
                                            <Badge variant="outline" key={role}>{role}</Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            uploader.registrationStatus === 'Approved' ? 'default' :
                                                uploader.registrationStatus === 'Rejected' ? 'destructive' :
                                                    'secondary'
                                        }
                                    >
                                        {uploader.registrationStatus}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={uploader.isActive ? 'default' : 'destructive'}>
                                        {uploader.isActive ? 'Yes' : 'No'}
                                    </Badge>
                                </TableCell>
                                <TableCell>{uploader.uploadedDocuments.length}</TableCell>
                                <TableCell>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleViewDetails(uploader)}
                                    >
                                        View Details
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination className="mt-6 flex justify-center">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                            />
                        </PaginationItem>

                        {[...Array(totalPages)].map((_, index) => {
                            const pageNumber = index + 1;
                            return (
                                <PaginationItem key={pageNumber}>
                                    <PaginationLink
                                        onClick={() => setPage(pageNumber)}
                                        isActive={page === pageNumber}
                                    >
                                        {pageNumber}
                                    </PaginationLink>
                                </PaginationItem>
                            );
                        })}

                        <PaginationItem>
                            <PaginationNext
                                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    )
}