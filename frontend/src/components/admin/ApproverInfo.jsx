import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FileIcon, Loader2 } from "lucide-react";
import { getApproverDetails } from "@/api/admin-api";
import { getStaticUrl } from "@/utils/get-static-url";

const ApproverInfo = () => {
    const { id } = useParams();

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["approver-details", id],
        queryFn: () => getApproverDetails(id),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64 w-full">
                <Loader2 className="animate-spin w-6 h-6 text-primary" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center text-red-500 w-full">
                Error: {error?.message || "Failed to load approver details"}
            </div>
        );
    }

    if (!data) return null;

    const {
        fullName,
        email,
        employeeId,
        photo,
        roles,
        isActive,
        department,
        profession,
        education,
        approvedDocuments = [],
    } = data?.data?.data;

    return (
        <div className="space-y-6 p-6 w-full">
            {/* Profile */}
            <Card>
                <CardHeader>
                    <CardTitle>Approver Information</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-6 items-start">
                    <Avatar className="w-20 h-20">
                        <AvatarImage src={getStaticUrl(photo)} alt={fullName} />
                        <AvatarFallback>{fullName?.[0]}</AvatarFallback>
                    </Avatar>

                    <div className="space-y-2">
                        <p className="text-lg font-semibold">{fullName}</p>
                        <p className="text-sm text-muted-foreground">{email}</p>
                        <p className="text-sm">Employee ID: {employeeId}</p>
                        <div className="flex flex-wrap gap-2">
                            {roles?.map((role) => (
                                <Badge key={role} variant="secondary">
                                    {role}
                                </Badge>
                            ))}
                        </div>
                        <Badge variant={isActive ? "default" : "destructive"}>
                            {isActive ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Department / Profession / Education */}
            <Card>
                <CardHeader>
                    <CardTitle>Work Details</CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-3 gap-4">
                    <div>
                        <p className="font-medium">Department</p>
                        <p className="text-sm text-muted-foreground">{department?.name}</p>
                    </div>
                    <div>
                        <p className="font-medium">Profession</p>
                        <p className="text-sm text-muted-foreground">{profession?.name}</p>
                    </div>
                    <div>
                        <p className="font-medium">Education</p>
                        <p className="text-sm text-muted-foreground">{education?.name}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Approved Documents */}
            <Card>
                <CardHeader>
                    <CardTitle>Approved Documents</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-64 pr-4">
                        {approvedDocuments.length > 0 ? (
                            approvedDocuments.map((doc, idx) => (
                                <div key={doc.id}>
                                    <div className="flex items-center justify-between py-2">
                                        <div className="flex items-center gap-3">
                                            <FileIcon className="w-5 h-5 text-primary" />
                                            <div>
                                                <p className="font-medium">{doc.fileName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    MRN: {doc.patientMRN}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Status: {doc.status}
                                                </p>
                                            </div>
                                        </div>
                                        <a
                                            href={doc.filePath}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary hover:underline"
                                        >
                                            View
                                        </a>
                                    </div>
                                    {idx < approvedDocuments.length - 1 && <Separator />}
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No approved documents found.
                            </p>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};

export default ApproverInfo;
