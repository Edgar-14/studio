import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Business Details</CardTitle>
          <CardDescription>
            Update your business information for accurate pickups.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="name">Pickup Name</Label>
              <Input
                id="name"
                type="text"
                className="w-full"
                defaultValue="BeFast HQ"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="phone">Pickup Phone</Label>
              <Input
                id="phone"
                type="tel"
                className="w-full"
                defaultValue="(555) 987-6543"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="address">Pickup Address</Label>
              <Input
                id="address"
                type="text"
                className="w-full"
                defaultValue="123 Innovation Drive, Tech City, 12345"
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button>Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
