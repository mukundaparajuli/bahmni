import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function Unauthorized() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <AlertCircle className="h-6 w-6 text-red-500" />
                        Unauthorized Access
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600 mb-4">
                        You are not authorized to view this page.
                    </p>
                    <Button asChild>
                        <Link to="/">Go to Homepage</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}