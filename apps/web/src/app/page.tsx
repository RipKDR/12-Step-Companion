/**
 * Sponsor Dashboard Home Page
 */

import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Welcome, {session.user?.name || session.user?.email}!
        </h1>
        <p className="text-gray-600">12-Step Recovery Companion - Sponsor Portal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sponsor Dashboard</CardTitle>
            <CardDescription>View shared items from your sponsees</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/sponsor/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your sponsor profile</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Edit Profile</Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

