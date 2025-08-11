import { Scan } from "lucide-react"
import ScannersTable from "./ScannersTable"

const ScannersInfo = () => {
    return (
        <div className="container mx-auto px-4 py-8 max-w-8xl">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Scan className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Scanners Information</h1>
                        <p className="text-sm md:text-base text-muted-foreground">
                            View and manage all scanners in the system
                        </p>
                    </div>
                </div>
                <ScannersTable />
            </div>
        </div>
    )
}

export default ScannersInfo