import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAllApprovers } from '@/api/admin-api'
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

export default function ApproverTable() {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(5)

    const { data, isLoading, error } = useQuery({
        queryKey: ['approvers', page, pageSize],
        queryFn: () => getAllApprovers({ page, limit: pageSize }),
    })

    const approvers = data?.data?.data?.data || []
    const totalPages = data?.data?.totalPages || 1

    console.log(data?.data?.data)

    const handleViewDetails = (approver) => {
        // Implement your detail view logic
        console.log('View details:', approver)
    }

    if (isLoading) return <div className="text-center py-8">Loading approvers...</div>
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
                            <TableHead>Approved Documents</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {approvers.map((approver) => (
                            <TableRow key={approver.id}>
                                <TableCell>{approver.id}</TableCell>
                                <TableCell>{approver.employeeId}</TableCell>
                                <TableCell>{approver.fullName}</TableCell>
                                <TableCell>{approver.email}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {approver.roles.map((role) => (
                                            <Badge variant="outline" key={role}>{role}</Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            approver.registrationStatus === 'Approved' ? 'default' :
                                                approver.registrationStatus === 'Rejected' ? 'destructive' :
                                                    'secondary'
                                        }
                                    >
                                        {approver.registrationStatus}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={approver.isActive ? 'default' : 'destructive'}>
                                        {approver.isActive ? 'Yes' : 'No'}
                                    </Badge>
                                </TableCell>
                                <TableCell>{approver.approvedDocuments.length}</TableCell>
                                <TableCell>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleViewDetails(approver)}
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