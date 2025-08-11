import { Check } from "lucide-react";
import ApproverTable from "./ApproversTable"

const ApproversInfo = () => {
    return (
        <div className="container mx-auto px-4 py-8 max-w-8xl">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Check className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Approvers Information</h1>
                        <p className="text-sm md:text-base text-muted-foreground">
                            View and manage all approvers in the system
                        </p>
                    </div>
                </div>
                <ApproverTable />
            </div>
        </div>
    )
}

export default ApproversInfo;