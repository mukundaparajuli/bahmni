import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAllScanners } from '@/api/admin-api'
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
    PaginationEllipsis,
    PaginationNext,
} from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from 'react-router-dom'

export default function ScannersTable() {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(5)
    const navigate = useNavigate();

    const { data, isLoading, error } = useQuery({
        queryKey: ['scanners', page, pageSize],
        queryFn: () => getAllScanners({ page, limit: pageSize }),
    })

    const scanners = data?.data?.data?.data || []
    const totalPages = data?.data?.totalPages || 1
    const totalItems = data?.data?.total || 0

    console.log(data?.data?.data)

    const handleViewDetails = (scanner) => {
        navigate('/admin/scanner/' + scanner.id)
    }

    if (isLoading) return <div className="text-center py-8">Loading scanners...</div>
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
                            <TableHead>Documents</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {scanners.map((scanner) => (
                            <TableRow key={scanner.id}>
                                <TableCell>{scanner.id}</TableCell>
                                <TableCell>{scanner.employeeId}</TableCell>
                                <TableCell>{scanner.fullName}</TableCell>
                                <TableCell>{scanner.email}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {scanner.roles.map((role) => (
                                            <Badge variant="outline" key={role}>{role}</Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            scanner.registrationStatus === 'Approved' ? 'default' :
                                                scanner.registrationStatus === 'Rejected' ? 'destructive' :
                                                    'secondary'
                                        }
                                    >
                                        {scanner.registrationStatus}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={scanner.isActive ? 'default' : 'destructive'}>
                                        {scanner.isActive ? 'Yes' : 'No'}
                                    </Badge>
                                </TableCell>
                                <TableCell>{scanner.scannedDocuments.length}</TableCell>
                                <TableCell>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleViewDetails(scanner)}
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