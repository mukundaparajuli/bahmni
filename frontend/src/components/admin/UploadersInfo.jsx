import { Upload } from "lucide-react"
import UploaderTable from "./UploadersTable"

const UploadersInfo = () => {
    return (
        <div className="container mx-auto px-4 py-8 max-w-8xl">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Uploaders Information</h1>
                        <p className="text-sm md:text-base text-muted-foreground">
                            View and manage all uploaders in the system
                        </p>
                    </div>
                </div>
                <UploaderTable />
            </div>
        </div>
    )
}

export default UploadersInfo